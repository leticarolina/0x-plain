# 0xPlain — From hex to human.

Paste any Ethereum transaction hash and get a plain-English explanation of exactly what happened.

🔗 **Live app:** [https://0x-plain.vercel.app](https://0x-plain.vercel.app)

---

## What is 0xPlain?

Blockchain transactions are cryptic by default. Raw hex data, function selectors, encoded parameters — even experienced developers have to cross-reference multiple tools just to understand what a single transaction did.

0xPlain fixes that. Paste any Ethereum transaction hash and get an instant, human-readable breakdown:

- What type of action occurred (transfer, swap, mint, contract deployment, etc.)
- Which smart contract function was called
- What the parameters mean in plain English
- Who sent it, who received it, and how much
- Which protocol was involved (Uniswap, Aave, OpenSea, etc.)
- Any suspicious or unusual flags worth noting

No blockchain expertise required.

---

## Why I Built This

I've been building in Web3 for 4+ years, as a transaction auditor and as a Solidity developer. One tool I always wished existed was something that could take any tx hash and just *tell me what happened* in plain English, not raw hex, not ABI-encoded calldata, just a clear explanation.

I built [Blockchain Finder](https://blockchainfinder.site) earlier to help identify which network a transaction belongs to. 0xPlain is the next step: once you find the transaction, actually understand it.

---

## How It Works

1. User pastes an Ethereum transaction hash
2. The app fetches real on-chain data from the Etherscan API
3. Input data is decoded to identify the contract function and parameters
4. An AI agent interprets the raw data and returns a structured plain-English explanation

---

## Tech Stack

- **Framework:** Next.js
- **Deployment:** Vercel
- **Blockchain Data:** Etherscan API
- **AI Layer:** Vercel AI SDK
- **Built with:** v0.app

---

## Hackathon

This project was built as part of the **[Zero to Agent Hackathon](https://community.vercel.com/hackathons/zero-to-agent)** by Vercel (April 24 – May 4, 2026).

Track: **v0 + MCPs** — AI app built with v0 that connects to external data sources to power real agent behavior.

---

## Features

- Paste any Ethereum transaction hash
- Example transactions included (Inscription, Swap, NFT, Contract, DeFi)
- Clean, minimal dark UI
- Structured explanation with labeled sections
- Currently supports **Ethereum mainnet**

---

## Roadmap

- Multi-chain support (Base, Arbitrum, Polygon, Optimism)
- Suspicious behavior flagging
- Contract address lookup and explanation
- Share the explanation as a link

---

## About the Developer

Built by [Leticia Azevedo](https://www.letiazevedo.com) — Web3 & Solidity developer with 4+ years in DeFi, blockchain, and smart contract security.

- [GitHub](https://github.com/leticarolina)
- X: [@letiweb3](https://x.com/letiweb3)
- [LinkedIn](https://www.linkedin.com/in/leti-azevedo/)
