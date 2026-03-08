# Agent Lily

Agent Lily is a cross-chain yield strategist that monitors USDC lending yields across chains and uses LI.FI to route capital toward better opportunities.

## The Problem

- Different DeFi chains offer different yields on the same asset (USDC)
- Ethereum might offer 3.5%, while Base offers 4.5%
- Manually tracking and moving funds is tedious

## The Solution

This AI agent:
1. Fetches live USDC supply APR across supported chains
2. Compares yields and finds the best opportunity
3. Uses LI.FI SDK to get cross-chain bridge quotes
4. Recommends (and can execute) rebalancing to maximize yield


### Cross-Chain Yield Agent
- Fetches real-time yields from **6 EVM chains** via Aave V3
- Fetches **Solana** yields via Kamino API
- Compares yields and recommends optimal rebalancing

### Chat Interface
- Conversational AI interface at `/dashboard/chat`
- Commands: `/yields`, `/rebalance`, `/bridge`, `/chains`, `/balance`
- Connect wallet via Dynamic
- Balance check before execution

### Execution
- LI.FI SDK integration for bridge quotes
- Pre-execution balance validation
- Support for EVM → EVM and EVM → Solana bridges

### Dashboard
- Real-time yield opportunity display
- Run history and metrics
- Telegram notifications (optional)

## Tech Stack

- **Next.js 16** - React framework with App Router
- **LI.FI SDK** - Cross-chain swaps and bridging (EVM + Solana)
- **Aave V3** - Real-time yield data via direct RPC calls
- **Kamino** - Solana yield data
- **Dynamic** - Wallet connection
- **Viem** - Ethereum interaction
- **Supabase** - Persistence (config, runs history)
- **Gemini** - AI reasoning for yield strategy

## Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the agent.

## Demo

### 1. Dashboard
View yield opportunities and metrics at `/dashboard`

### 2. Chat
Ask Lily about yields or execute bridges:

```
check yields
rebalance 100
bridge 10 usdc from arbitrum to polygon
check balance on base
```

### 3. API
```bash
# Get current yields
curl -X GET http://localhost:3000/api/agent/yields \
  -H "Authorization: Bearer <AGENT_API_SECRET>"

# Trigger rebalance analysis
curl -X POST http://localhost:3000/api/agent/rebalance \
  -H "Authorization: Bearer <AGENT_API_SECRET>"
```

## Supported Chains

### EVM (via Aave V3)
| Chain | Chain ID | USDC Address |
|-------|----------|--------------|
| Ethereum | 1 | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |
| Arbitrum | 42161 | 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8 |
| Optimism | 10 | 0x7F5c764cBc14f9669B88837ca1490cCa17c31607 |
| Polygon | 137 | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 |
| Base | 8453 | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |
| Avalanche | 43114 | 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E |

### Solana (via Kamino)
| Chain | Chain ID | Token |
|-------|----------|-------|
| Solana | 1151111081099710 | USDC |



## LI.FI Integration (Required by Hackathon)

This project uses LI.FI in production code:

### 1. LI.FI SDK ✅ (Primary)
```typescript
import { getQuote, createConfig, executeRoute } from '@lifi/sdk';
```

### 2. LI.FI MCP Server ✅
Configured in `mcp.json` for AI assistants.

### 3. LI.FI Agent Skills ✅
```bash
npx skills add https://github.com/lifinance/lifi-agent-skills --skill li-fi-sdk
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx      # Dashboard overview
│   │   ├── chat/         # Chat interface
│   │   ├── policies/     # Agent config
│   │   └── reports/     # Run history
│   ├── api/
│   │   └── agent/       # Agent API endpoints
│   └── page.tsx         # Landing page
├── components/           # React components
├── lib/
│   ├── agent.ts        # Main yield agent logic
│   ├── yields.ts       # Yield aggregation
│   ├── lifi.ts        # LI.FI SDK integration
│   ├── kamino.ts      # Solana yield (Kamino)
│   ├── aaveDirect.ts  # Aave V3 RPC reads
│   └── execution.ts   # Bridge execution
└── constants/          # Chain configs
```

## License

MIT
