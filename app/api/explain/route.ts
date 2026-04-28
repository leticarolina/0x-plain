import { streamText } from 'ai'

// Fetch transaction data from Etherscan API
async function fetchTransactionFromEtherscan(txHash: string) {
  const apiKey = process.env.ETHERSCAN_API_KEY
  
  if (!apiKey) {
    throw new Error('ETHERSCAN_API_KEY is not configured')
  }

  // Get transaction details
  const txUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${apiKey}`
  
  try {
    const txResponse = await fetch(txUrl)
    const txData = await txResponse.json()
    
    if (txData.result && txData.result !== null) {
      // Get transaction receipt for status and gas used
      const receiptUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`
      const receiptResponse = await fetch(receiptUrl)
      const receiptData = await receiptResponse.json()
      
      // Get receipt status separately for confirmation
      const statusUrl = `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${apiKey}`
      const statusResponse = await fetch(statusUrl)
      const statusData = await statusResponse.json()
      
      // Get block info for timestamp
      const blockUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${txData.result.blockNumber}&boolean=true&apikey=${apiKey}`
      const blockResponse = await fetch(blockUrl)
      const blockData = await blockResponse.json()
      
      const tx = txData.result
      const receipt = receiptData.result || {}
      const block = blockData.result || {}
      
      // Convert hex values
      const value = parseInt(tx.value, 16) / 1e18
      const gasPrice = parseInt(tx.gasPrice, 16) / 1e9
      const gasUsed = receipt.gasUsed ? parseInt(receipt.gasUsed, 16) : 0
      const gasFee = (gasUsed * gasPrice) / 1e9
      const blockNumber = parseInt(tx.blockNumber, 16)
      const timestamp = block.timestamp ? new Date(parseInt(block.timestamp, 16) * 1000).toISOString() : 'Unknown'
      const status = receipt.status === '0x1' ? 'Success' : receipt.status === '0x0' ? 'Failed' : 'Unknown'
      
      // Check if it's a contract creation
      const isContractCreation = !tx.to || tx.to === '0x0000000000000000000000000000000000000000'
      
      // Decode input data (basic function selector)
      let functionSelector = ''
      let inputDataInfo = ''
      if (tx.input && tx.input !== '0x') {
        functionSelector = tx.input.slice(0, 10)
        inputDataInfo = `Function selector: ${functionSelector}, Input data length: ${(tx.input.length - 2) / 2} bytes`
      } else {
        inputDataInfo = 'No input data (simple ETH transfer)'
      }
      
      // Check for token transfers in logs
      const tokenTransfers: string[] = []
      if (receipt.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          // ERC20 Transfer event signature
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
        valueWei: tx.value,
        gasPrice: `${gasPrice.toFixed(2)} Gwei`,
        gasUsed: gasUsed,
        gasFee: `${gasFee.toFixed(6)} ETH`,
        blockNumber: blockNumber,
        timestamp: timestamp,
        status: status,
        nonce: parseInt(tx.nonce, 16),
        inputData: tx.input,
        inputDataInfo: inputDataInfo,
        functionSelector: functionSelector,
        isContractCreation: isContractCreation,
        contractAddress: receipt.contractAddress || null,
        tokenTransfers: tokenTransfers,
        logsCount: receipt.logs?.length || 0,
        etherscanUrl: `https://etherscan.io/tx/${txHash}`,
      }
    }
    
    return { found: false, hash: txHash, error: 'Transaction not found' }
  } catch (error) {
    return { found: false, hash: txHash, error: String(error) }
  }
}

// Known function selectors (common ones)
const KNOWN_FUNCTIONS: Record<string, string> = {
  '0xa9059cbb': 'transfer(address,uint256) - ERC20 token transfer',
  '0x23b872dd': 'transferFrom(address,address,uint256) - ERC20 transferFrom',
  '0x095ea7b3': 'approve(address,uint256) - ERC20 approve spender',
  '0x38ed1739': 'swapExactTokensForTokens - Uniswap V2 swap',
  '0x7ff36ab5': 'swapExactETHForTokens - Uniswap V2 swap ETH for tokens',
  '0x18cbafe5': 'swapExactTokensForETH - Uniswap V2 swap tokens for ETH',
  '0x5ae401dc': 'multicall - Uniswap V3 multicall',
  '0x3593564c': 'execute - Uniswap Universal Router',
  '0xfb3bdb41': 'swapETHForExactTokens - Uniswap V2',
  '0xd0e30db0': 'deposit() - WETH wrap',
  '0x2e1a7d4d': 'withdraw(uint256) - WETH unwrap',
  '0x40c10f19': 'mint(address,uint256) - Mint tokens',
  '0xa22cb465': 'setApprovalForAll - NFT approval',
  '0x42842e0e': 'safeTransferFrom - NFT transfer',
  '0xb88d4fde': 'safeTransferFrom with data - NFT transfer',
  '0xab834bab': 'atomicMatch_ - OpenSea Wyvern',
  '0xfb0f3ee1': 'fulfillBasicOrder - OpenSea Seaport',
  '0xe7acab24': 'fulfillAdvancedOrder - OpenSea Seaport',
}

export async function POST(req: Request) {
  console.log('[v0] API route called')
  
  const body = await req.json()
  console.log('[v0] Request body:', JSON.stringify(body))
  
  const txHash = body.txHash || body.text || ''
  console.log('[v0] Extracted txHash:', txHash)

  if (!txHash || typeof txHash !== 'string') {
    console.log('[v0] Error: Transaction hash is required')
    return Response.json({ error: 'Transaction hash is required' }, { status: 400 })
  }

  const cleanHash = txHash.trim()
  console.log('[v0] Clean hash:', cleanHash)

  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    console.log('[v0] Error: Invalid transaction hash format')
    return Response.json({ error: 'Invalid transaction hash format' }, { status: 400 })
  }

  // Check if API key is set
  console.log('[v0] ETHERSCAN_API_KEY exists:', !!process.env.ETHERSCAN_API_KEY)

  // Fetch real transaction data
  console.log('[v0] Fetching transaction from Etherscan...')
  const txData = await fetchTransactionFromEtherscan(cleanHash)
  console.log('[v0] Etherscan response:', JSON.stringify(txData).slice(0, 500))
  
  if (!txData.found) {
    console.log('[v0] Error: Transaction not found, error:', txData.error)
    return Response.json({ error: `Transaction not found: ${txData.error}` }, { status: 404 })
  }

  // Get function name if known
  const functionName = txData.functionSelector ? KNOWN_FUNCTIONS[txData.functionSelector] || `Unknown function (${txData.functionSelector})` : 'Direct ETH Transfer'

  const result = streamText({
    model: 'openai/gpt-5',
    system: `You are an expert blockchain analyst who explains Ethereum transactions in plain English. You will receive real transaction data fetched from Etherscan. Analyze it and provide a clear, structured explanation.

Your response MUST follow this exact structure with these section headers:

## Summary
A one-sentence plain-English summary of what happened in this transaction.

## Transaction Type
The type of transaction (ETH Transfer, Token Transfer, Contract Interaction, NFT Mint, Token Swap, Contract Deployment, etc.)

## Protocol / Contract
The protocol or smart contract involved (e.g., Uniswap V3, OpenSea Seaport, USDT, etc.) with the contract address.

## Function Called
The specific function that was called and what it does in plain English.

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

**Raw Transaction Data:**
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
- Input Data: ${txData.inputDataInfo}
- Is Contract Creation: ${txData.isContractCreation}
${txData.contractAddress ? `- Created Contract: ${txData.contractAddress}` : ''}
- Token Transfers Detected: ${(txData.tokenTransfers && txData.tokenTransfers.length > 0) ? txData.tokenTransfers.join('; ') : 'None'}
- Total Log Events: ${txData.logsCount}

Please explain this transaction in plain English following the required format.`,
      },
    ],
  })

  return result.toUIMessageStreamResponse()
}
