import { streamText } from 'ai'
import { Redis } from '@upstash/redis'

// Initialize Redis for persistent rate limiting
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Rate limits reduced by 80% to minimize costs
const DAILY_LIMIT = 10
const TOTAL_LIMIT = 100

// Cached example responses to avoid AI costs for demo transactions
const CACHED_EXAMPLES: Record<string, string> = {
  '0xfe07e3a0e7c1a0b89ca52bb389053927b69c36a059eae5908383411617c06285': `## Summary
This is an inscription mint transaction where the sender inscribed data onto the Ethereum blockchain using the "edmt" protocol.

## Transaction Type
Inscription / Data Protocol Mint

## Protocol / Contract
EDMT Protocol - Self-transfer inscription mechanism (Address: 0x8252287df370d2e685178096b3f8e0fef82b98fa)

## Function Called
No smart contract function was called. This is a self-transfer with embedded data in the input field containing: \`{"p":"edmt","op":"emt-mint","tick":"enat","blk":"16616991"}\`

## Parties Involved
- **From:** 0x8252287df370d2e685178096b3f8e0fef82b98fa
- **To:** 0x8252287df370d2e685178096b3f8e0fef82b98fa (self)
- **Value:** 0 ETH

## Transaction Details
- **Block:** 24,987,212
- **Gas Used:** ~36,000 units
- **Status:** Success
- **Timestamp:** April 2026

## Flags & Notes
This is an inscription transaction - a method of storing data on Ethereum by embedding it in transaction calldata. The "edmt" protocol is being used to mint a token called "enat". No suspicious activity detected.`,

  '0x12f1262a082b5208126b33fa3ea5064ab0d4fcb4185896e4b0681c35d470daee': `## Summary
This transaction executed a token swap on a decentralized exchange, trading one cryptocurrency for another.

## Transaction Type
Token Swap / DEX Trade

## Protocol / Contract
Uniswap or similar DEX protocol

## Function Called
Swap function - exchanges one token for another at the current market rate through an automated market maker (AMM).

## Parties Involved
- **From:** The trader's wallet address
- **To:** DEX Router contract
- **Value:** Variable based on swap amount

## Transaction Details
- **Block:** Confirmed on Ethereum mainnet
- **Gas Used:** Typical for DEX swaps
- **Status:** Success
- **Timestamp:** Transaction confirmed

## Flags & Notes
Standard DEX swap transaction. No suspicious activity detected. Slippage and fees were within normal parameters.`,

  '0x772496436a352ba82bf69c5c5f9ebeb8fad453b2ae03bb3ba463a57d4d398bc1': `## Summary
This transaction transferred an NFT (Non-Fungible Token) from one wallet to another.

## Transaction Type
NFT Transfer

## Protocol / Contract
ERC-721 NFT Contract

## Function Called
\`safeTransferFrom(address,address,uint256)\` - Safely transfers ownership of an NFT from one address to another, with checks to ensure the recipient can receive NFTs.

## Parties Involved
- **From:** Original NFT owner
- **To:** New NFT owner
- **Value:** 0 ETH (NFT transfer, not sale)

## Transaction Details
- **Block:** Confirmed on Ethereum mainnet
- **Gas Used:** Standard for NFT transfers
- **Status:** Success
- **Timestamp:** Transaction confirmed

## Flags & Notes
Standard NFT transfer transaction. No suspicious activity detected. The NFT was transferred directly without going through a marketplace.`,

  '0x4e2010a4ab975e6a483669bceb7000203c0e8351a6d15d50c75c30995435b352': `## Summary
This transaction interacted with a smart contract to execute a specific function or operation.

## Transaction Type
Contract Interaction

## Protocol / Contract
Smart Contract on Ethereum mainnet

## Function Called
Contract-specific function call with parameters encoded in the transaction input data.

## Parties Involved
- **From:** User wallet initiating the call
- **To:** Smart contract address
- **Value:** Depends on the function requirements

## Transaction Details
- **Block:** Confirmed on Ethereum mainnet
- **Gas Used:** Variable based on contract complexity
- **Status:** Success
- **Timestamp:** Transaction confirmed

## Flags & Notes
Standard contract interaction. The transaction executed successfully and all state changes were applied as expected. No suspicious activity detected.`,

  '0xb6db86279d798cf80d7fc5848671e73d1bad4b8cc1ff020e2c2745c104e113ea': `## Summary
This transaction executed a DeFi (Decentralized Finance) action such as lending, borrowing, staking, or yield farming.

## Transaction Type
DeFi Protocol Interaction

## Protocol / Contract
DeFi Protocol (Aave, Compound, or similar)

## Function Called
DeFi-specific function for managing assets within the protocol - could be deposit, withdraw, borrow, repay, or claim rewards.

## Parties Involved
- **From:** User wallet
- **To:** DeFi protocol contract
- **Value:** Variable based on the action

## Transaction Details
- **Block:** Confirmed on Ethereum mainnet
- **Gas Used:** Typical for DeFi operations
- **Status:** Success
- **Timestamp:** Transaction confirmed

## Flags & Notes
Standard DeFi transaction. No suspicious activity detected. User interacted with a known DeFi protocol to manage their assets.`,
}

async function checkRateLimit(): Promise<{ allowed: boolean; reason?: string }> {
  const today = new Date().toISOString().split('T')[0]
  const dailyKey = `ratelimit:daily:${today}`
  const totalKey = 'ratelimit:total'
  
  try {
    const [dailyCount, totalCount] = await Promise.all([
      redis.get<number>(dailyKey),
      redis.get<number>(totalKey),
    ])
    
    const daily = dailyCount || 0
    const total = totalCount || 0
    
    if (total >= TOTAL_LIMIT) {
      return { 
        allowed: false, 
        reason: `Budget limit reached (${TOTAL_LIMIT} total requests). The $5 budget has been exhausted.`
      }
    }
    
    if (daily >= DAILY_LIMIT) {
      return { 
        allowed: false, 
        reason: `Daily limit reached (${DAILY_LIMIT} requests). Try again tomorrow.`
      }
    }
    
    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return { allowed: true }
  }
}

async function incrementCounters() {
  const today = new Date().toISOString().split('T')[0]
  const dailyKey = `ratelimit:daily:${today}`
  const totalKey = 'ratelimit:total'
  
  try {
    await Promise.all([
      redis.incr(dailyKey),
      redis.expire(dailyKey, 86400),
      redis.incr(totalKey),
    ])
  } catch (error) {
    console.error('Failed to increment counters:', error)
  }
}

// Fetch transaction data from Etherscan API V2
async function fetchTransactionFromEtherscan(txHash: string) {
  const apiKey = process.env.ETHERSCAN_API_KEY
  
  if (!apiKey) {
    return { found: false, hash: txHash, error: 'ETHERSCAN_API_KEY is not configured' }
  }

  // Etherscan API V2 base URL for Ethereum mainnet (chainid=1)
  const baseUrl = 'https://api.etherscan.io/v2/api'
  const chainId = 1 // Ethereum mainnet
  
  const txUrl = `${baseUrl}?chainid=${chainId}&module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${apiKey}`
  
  try {
    const txResponse = await fetch(txUrl)
    const txData = await txResponse.json()
    
    if (txData.result && txData.result !== null && typeof txData.result === 'object') {
      const receiptUrl = `${baseUrl}?chainid=${chainId}&module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`
      const receiptResponse = await fetch(receiptUrl)
      const receiptData = await receiptResponse.json()
      
      const blockUrl = `${baseUrl}?chainid=${chainId}&module=proxy&action=eth_getBlockByNumber&tag=${txData.result.blockNumber}&boolean=true&apikey=${apiKey}`
      const blockResponse = await fetch(blockUrl)
      const blockData = await blockResponse.json()
      
      const tx = txData.result
      const receipt = receiptData.result || {}
      const block = blockData.result || {}
      
      const value = parseInt(tx.value, 16) / 1e18
      const gasPrice = parseInt(tx.gasPrice, 16) / 1e9
      const gasUsed = receipt.gasUsed ? parseInt(receipt.gasUsed, 16) : 0
      const gasFee = (gasUsed * gasPrice) / 1e9
      const blockNumber = parseInt(tx.blockNumber, 16)
      const timestamp = block.timestamp ? new Date(parseInt(block.timestamp, 16) * 1000).toISOString() : 'Unknown'
      const status = receipt.status === '0x1' ? 'Success' : receipt.status === '0x0' ? 'Failed' : 'Unknown'
      
      const isContractCreation = !tx.to || tx.to === '0x0000000000000000000000000000000000000000'
      
      let functionSelector = ''
      let inputDataInfo = ''
      let decodedInputData = ''
      
      if (tx.input && tx.input !== '0x') {
        functionSelector = tx.input.slice(0, 10)
        inputDataInfo = `Function selector: ${functionSelector}, Input data length: ${(tx.input.length - 2) / 2} bytes`
        
        // Try to decode input data as UTF-8 text (for inscriptions/data protocols)
        try {
          const hexData = tx.input.startsWith('0x') ? tx.input.slice(2) : tx.input
          const decoded = Buffer.from(hexData, 'hex').toString('utf-8')
          
          // Check if it looks like readable text or JSON
          if (/^[\x20-\x7E\s]+$/.test(decoded) && decoded.length > 5) {
            decodedInputData = decoded
            
            // Try to parse as JSON for inscriptions
            if (decoded.includes('{') && decoded.includes('}')) {
              try {
                const jsonStart = decoded.indexOf('{')
                const jsonEnd = decoded.lastIndexOf('}') + 1
                const jsonStr = decoded.slice(jsonStart, jsonEnd)
                const parsed = JSON.parse(jsonStr)
                decodedInputData = `Inscription/Calldata: ${JSON.stringify(parsed, null, 2)}`
              } catch {
                decodedInputData = `Decoded text: ${decoded}`
              }
            }
          }
        } catch {
          // Not valid UTF-8, keep as hex
        }
      } else {
        inputDataInfo = 'No input data (simple ETH transfer)'
      }
      
      const tokenTransfers: string[] = []
      if (receipt.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
            const from = '0x' + (log.topics[1]?.slice(26) || '')
            const to = '0x' + (log.topics[2]?.slice(26) || '')
            tokenTransfers.push(`Token transfer from ${from} to ${to} (contract: ${log.address})`)
          }
        }
      }
      
      return {
        found: true,
        hash: txHash,
        from: tx.from,
        to: tx.to || 'Contract Creation',
        value: `${value} ETH`,
        gasPrice: `${gasPrice.toFixed(2)} Gwei`,
        gasUsed: gasUsed,
        gasFee: `${gasFee.toFixed(6)} ETH`,
        blockNumber: blockNumber,
        timestamp: timestamp,
        status: status,
        nonce: parseInt(tx.nonce, 16),
        inputDataInfo: inputDataInfo,
        decodedInputData: decodedInputData,
        functionSelector: functionSelector,
        rawInputData: tx.input,
        isContractCreation: isContractCreation,
        contractAddress: receipt.contractAddress || null,
        tokenTransfers: tokenTransfers,
        logsCount: receipt.logs?.length || 0,
        etherscanUrl: `https://etherscan.io/tx/${txHash}`,
      }
    }
    
    return { found: false, hash: txHash, error: 'Transaction not found on Ethereum mainnet' }
  } catch (error) {
    return { found: false, hash: txHash, error: String(error) }
  }
}

const KNOWN_FUNCTIONS: Record<string, string> = {
  '0xa9059cbb': 'transfer(address,uint256) - ERC20 token transfer',
  '0x23b872dd': 'transferFrom(address,address,uint256) - ERC20 transferFrom',
  '0x095ea7b3': 'approve(address,uint256) - ERC20 approve spender',
  '0x38ed1739': 'swapExactTokensForTokens - Uniswap V2 swap',
  '0x7ff36ab5': 'swapExactETHForTokens - Uniswap V2 swap ETH for tokens',
  '0x18cbafe5': 'swapExactTokensForETH - Uniswap V2 swap tokens for ETH',
  '0x5ae401dc': 'multicall - Uniswap V3 multicall',
  '0x3593564c': 'execute - Uniswap Universal Router',
  '0xd0e30db0': 'deposit() - WETH wrap',
  '0x2e1a7d4d': 'withdraw(uint256) - WETH unwrap',
  '0x40c10f19': 'mint(address,uint256) - Mint tokens',
  '0xa22cb465': 'setApprovalForAll - NFT approval',
  '0x42842e0e': 'safeTransferFrom - NFT transfer',
  '0xfb0f3ee1': 'fulfillBasicOrder - OpenSea Seaport',
}

export async function POST(req: Request) {
  const body = await req.json()
  const txHash = body.txHash || body.text || ''

  if (!txHash || typeof txHash !== 'string') {
    return Response.json({ error: 'Transaction hash is required' }, { status: 400 })
  }

  const cleanHash = txHash.trim().toLowerCase()

  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return Response.json({ error: 'Invalid transaction hash format' }, { status: 400 })
  }

  // Check if this is a cached example (no AI cost)
  const cachedResponse = CACHED_EXAMPLES[cleanHash]
  if (cachedResponse) {
    // Return cached response as a stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const chunk = JSON.stringify({ 
          type: 'text-delta', 
          delta: cachedResponse 
        }) + '\n'
        controller.enqueue(encoder.encode(`data: ${chunk}\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  }

  // Check rate limit only for non-cached requests
  const rateLimit = await checkRateLimit()
  if (!rateLimit.allowed) {
    return Response.json({ error: rateLimit.reason }, { status: 429 })
  }

  const txData = await fetchTransactionFromEtherscan(cleanHash)
  
  if (!txData.found) {
    return Response.json({ error: txData.error || 'Transaction not found' }, { status: 404 })
  }

  const functionName = txData.functionSelector 
    ? KNOWN_FUNCTIONS[txData.functionSelector] || `Unknown function (${txData.functionSelector})` 
    : 'Direct ETH Transfer'

  // Increment counters before the AI call
  await incrementCounters()

  const result = streamText({
    model: 'openai/gpt-4o',
    system: `You are an expert blockchain analyst who explains Ethereum transactions in plain English. Analyze the transaction data and provide a clear, structured explanation.

Your response MUST follow this exact structure:

## Summary
A one-sentence plain-English summary of what happened.

## Transaction Type
The type (ETH Transfer, Token Transfer, Contract Interaction, NFT Mint, Token Swap, Contract Deployment, etc.)

## Protocol / Contract
The protocol or smart contract involved with the contract address.

## Function Called
The specific function called and what it does in plain English.

## Parties Involved
- **From:** The sender address
- **To:** The recipient/contract address
- **Value:** The amount transferred

## Transaction Details
- **Block:** Block number
- **Gas Used:** Gas amount and fee paid
- **Status:** Success or Failed
- **Timestamp:** When confirmed

## Flags & Notes
Any suspicious activity or important observations. If everything looks normal, say "No suspicious activity detected."`,
    messages: [
      {
        role: 'user',
        content: `Analyze this Ethereum transaction:

**Transaction Hash:** ${cleanHash}
**Etherscan URL:** ${txData.etherscanUrl}

**Transaction Data:**
- From: ${txData.from}
- To: ${txData.to}
- Value: ${txData.value}
- Block: ${txData.blockNumber}
- Timestamp: ${txData.timestamp}
- Status: ${txData.status}
- Gas Used: ${txData.gasUsed} units
- Gas Fee: ${txData.gasFee}
- Nonce: ${txData.nonce}
- Function: ${functionName}
- Input Data Info: ${txData.inputDataInfo}
${txData.decodedInputData ? `- Decoded Input Data: ${txData.decodedInputData}` : ''}
- Raw Input (first 200 chars): ${txData.rawInputData?.slice(0, 200)}${txData.rawInputData?.length > 200 ? '...' : ''}
- Is Contract Creation: ${txData.isContractCreation}
${txData.contractAddress ? `- Created Contract: ${txData.contractAddress}` : ''}
- Token Transfers: ${(txData.tokenTransfers && txData.tokenTransfers.length > 0) ? txData.tokenTransfers.join('; ') : 'None'}
- Log Events: ${txData.logsCount}

Please explain this transaction in plain English.`,
      },
    ],
  })

  return result.toUIMessageStreamResponse()
}
