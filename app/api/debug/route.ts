// Debug endpoint to test Etherscan API directly
export async function GET(req: Request) {
  const url = new URL(req.url)
  const txHash = url.searchParams.get('tx') || '0xfe07e3a0e7c1a0b89ca52bb389053927b69c36a059eae5908383411617c06285'
  
  const apiKey = process.env.ETHERSCAN_API_KEY
  
  const debug: Record<string, unknown> = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey?.slice(0, 10) || 'NOT SET',
    txHash: txHash,
  }
  
  if (!apiKey) {
    return Response.json({ 
      ...debug, 
      error: 'ETHERSCAN_API_KEY not configured',
      envVars: {
        ETHERSCAN_API_KEY: !!process.env.ETHERSCAN_API_KEY,
        AI_GATEWAY_API_KEY: !!process.env.AI_GATEWAY_API_KEY,
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      }
    })
  }
  
  try {
    const txUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${apiKey}`
    
    const response = await fetch(txUrl)
    const data = await response.json()
    
    debug.etherscanResponse = data
    debug.hasResult = !!data.result
    debug.resultType = typeof data.result
    
    if (data.result && typeof data.result === 'object') {
      debug.parsedTx = {
        from: data.result.from,
        to: data.result.to,
        value: parseInt(data.result.value, 16) / 1e18 + ' ETH',
        blockNumber: parseInt(data.result.blockNumber, 16),
      }
    }
    
    return Response.json(debug)
  } catch (error) {
    return Response.json({ 
      ...debug, 
      error: String(error) 
    })
  }
}
