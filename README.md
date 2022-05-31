# Sell Your Smart Contract
### *Trustless Escrow for Smart Contracts*

--- 

Smart contracts on public blockchains are enabling individuals and organizations to sell on-chain products and services. Many, if not most, of these organizations are not publicly traded, meaning they do not have an ERC-20 token or on-chain treasury, that accrues revenue. This means there is now a niche, but rapidly growing market for on-chain private transactions. 

Examples include: 
- Creator Royalty Agreements and Bonds
- DAO Mergers and Acquisitions
- On-Chain SaaS Products Offered by Companies
- DAO Lending
- Programmable Cash Flows

Unfortunately, there is no existing solution that enables trustless private market transactions on public blockchains. How do individuals and businesses exchange smart contracts that own revenue streams for fixed or lump sum payments? 

**Sell Your Smart Contract** is an on-chain escrow service that facilitates the trustless exchange of privately owned smart contracts for fixed payments, regardless of the asset type or value (1 ETH or 10,000 ETH). 

**Resources**: 
* [Whitepaper](https://docs.google.com/document/d/10KBQ4uHuWa1Z5eNzDnpow6YFL8SbplNHdxjsjMNP_JM/edit?usp=sharing)

* [Pitch Deck](https://docs.google.com/presentation/d/1DM0f90koPnjq9E4PbMSyfTdv39XNEVS9AbRJTVb4KZQ/edit?usp=sharing)

* [Demo](https://www.youtube.com/watch?v=R_GiktG7cZU)

* [Rinkeby Dapp](https://sell-your-contract.vercel.app/)

---

## Setup

- Rename `.env.example` to `.env`. Replace `<<Your ALCHEMY_API_KEY>>` with your alchemy API key and `<<Your WALLET_PRIVATE_KEY>>` with your wallet's private key.

---

## Deployment

- Deploy the dapp to Ethereum's Rinkeby test network.

```npm run deploy```

- Launch the dapp frontend on your local network.

```npm start```

---

## Dapp Tutorial

- Buyers and sellers connect their Web3 wallets to dapp frontend.
![](/src/img/1_Connect_Wallet.png)

- Buyers and sellers navigate to *Buy Contract* or *Sell Contract*.
![](/src/img/2_Home_Page.png)

- Sellers enter details for smart contracts they list for sale.
![](/src/img/3_Seller_Input.png)

- Buyers confirm seller details and make payments for smart contract listings.
![](/src/img/4_Buyer_Input.png)
