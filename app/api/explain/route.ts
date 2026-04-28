import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'

// Helper function to fetch from Etherscan API or scrape transaction data
async function fetchTransactionData(txHash: string) {
  try {
    // Try to fetch from Etherscan public page
    const response = await fetch(`https://etherscan.io/tx/${txHash}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; 0xPlain/1.0)',
      },
    })
    
    if (response.ok) {
      return {
        url: `https://etherscan.io/tx/${txHash}`,
        status: 'found',
        hash: txHash,
      }
    }
    return { status: 'not_found', hash: txHash }
  } catch (error) {
    return { status: 'error', hash: txHash, error: String(error) }
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const txHash = body.txHash || body.text || ''

  if (!txHash || typeof txHash !== 'string') {
    return Response.json({ error: 'Transaction hash is required' }, { status: 400 })
  }

  // Clean the transaction hash
  const cleanHash = txHash.trim()

  // Validate hash format
  if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
    return Response.json({ error: 'Invalid transaction hash format' }, { status: 400 })
  }

  const result = streamText({
    model: 'openai/gpt-5',
    system: `You are an expert blockchain analyst who explains Ethereum transactions in plain English. 

IMPORTANT: You have access to web search capabilities. Use the searchWeb tool to look up the transaction on Etherscan to get real data.

When analyzing a transaction:
1. FIRST, use the searchWeb tool to search for the transaction hash on Etherscan
2. Based on the search results, identify all transaction details
3. Explain everything in a clear, structured format

Your response MUST follow this exact structure with these section headers:

## Summary
A one-sentence plain-English summary of what happened in this transaction.

## Transaction Type
The type of transaction (ETH Transfer, Token Transfer, Contract Interaction, NFT Mint, Token Swap, Contract Deployment, etc.)

## Protocol / Contract
The protocol or smart contract involved (e.g., Uniswap V3, OpenSea Seaport, USDT, etc.) with the contract address if relevant.

## Function Called
The specific function that was called on the smart contract and what each parameter means in plain English. If it's a simple ETH transfer, say "Direct ETH Transfer (no contract function)".

## Parties Involved
- **From:** The sender address and any known labels (e.g., "0x123... (Binance Hot Wallet)")
- **To:** The recipient address and any known labels
- **Value:** The amount transferred in ETH/tokens with approximate USD value if known

## Transaction Details
- **Block:** Block number
- **Gas Used:** Gas amount and fee paid in ETH
- **Status:** Success or Failed
- **Timestamp:** When the transaction was confirmed

## Flags & Notes
Any suspicious activity, unusual patterns, or important observations. Note things like:
- High gas fees
- Failed transactions
- Interactions with known scam contracts
- Large value transfers
If everything looks normal, say "No suspicious activity detected. This appears to be a standard transaction."

Be accurate and base your analysis on real data from the search results. If you cannot find the transaction or it doesn't exist, clearly state that.`,
    messages: [
      {
        role: 'user',
        content: `Please analyze this Ethereum blockchain transaction and explain what happened in plain English: ${cleanHash}

Search for this transaction on Etherscan to get the real data.`,
      },
    ],
    tools: {
      searchWeb: tool({
        description: 'Search the web for information. Use this to look up transaction details on Etherscan or other blockchain explorers.',
        inputSchema: z.object({
          query: z.string().describe('The search query - include the full transaction hash'),
        }),
        execute: async ({ query }) => {
          // Construct search URL for transaction lookup
          const txHash = query.match(/0x[a-fA-F0-9]{64}/)?.[0] || query
          const searchUrl = `https://etherscan.io/tx/${txHash}`
          
          // Return information that helps the AI understand where to look
          return {
            searchQuery: query,
            etherscanUrl: searchUrl,
            blockscoutUrl: `https://eth.blockscout.com/tx/${txHash}`,
            instructions: `Transaction ${txHash} can be viewed at ${searchUrl}. Please analyze the transaction data including: sender, recipient, value, gas used, input data, and any token transfers or contract interactions.`
          }
        },
      }),
      fetchEtherscanPage: tool({
        description: 'Fetch transaction details from Etherscan',
        inputSchema: z.object({
          txHash: z.string().describe('The transaction hash to look up'),
        }),
        execute: async ({ txHash }) => {
          return await fetchTransactionData(txHash)
        },
      }),
    },
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
