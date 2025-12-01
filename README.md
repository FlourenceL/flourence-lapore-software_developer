# Fullstack Ethereum Application

This repository contains a fullstack application with a **Next.js frontend** and a **Node.js backend**. The application interacts with Ethereum using Etherscan and Alchemy APIs.

---

## Prerequisites

Before running the project, make sure you have the following installed:

- **Node.js v22**
- **Redis**
- **MongoDB**

---

## Backend Setup (NestJS)

```bash
cd backend
npm i
npm run start
```

## Frontend Setup (NextJS)
```bash
cd frontend
npm i
npm run dev
```

## Fullstack Application Setup
```bash
cd docker

# Backend
cd backend
npm i
npm run start

# Frontend
cd ../frontend
npm i
npm run dev

```
## Env vars
## Frontend (.env.local)
```bash
NEXT_PUBLIC_API_KEY=your_etherscan_api_key
```
## Backend (.env)
```bash
DATABASE_URL=your_mongodb_url
ETHEREUM_RPC_URL=your_ethereum_mainnet_alchemy_rpc
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Fullstack Frontend (.env.local)
```bash
NEXT_PUBLIC_API_KEY=your_etherscan_api_key
```
## Fullstack Backend (.env)
```bash
DATABASE_URL=your_mongodb_url
ETHEREUM_RPC_URL=your_ethereum_mainnet_alchemy_rpc
SEPOLIA_RPC_URL=your_sepolia_rpc_url
CONTRACT_ADDRESS=0xaBEf3d5e6fdEbcBa6cB347315725A058fdC4F0b5
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Notes
- Make sure Redis and MongoDB are running before starting the backend.
- Make sure to run the backend first before running the frontend
- Replace all placeholder values in .env files with your actual API keys and URLs.

