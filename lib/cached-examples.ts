// Pre-cached responses for example transactions (no API cost)
export const CACHED_EXAMPLES: Record<string, string> = {
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

export function getCachedExample(txHash: string): string | null {
  const cleanHash = txHash.trim().toLowerCase()
  return CACHED_EXAMPLES[cleanHash] || null
}
