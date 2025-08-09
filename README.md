# ArbiZirQ — Zircuit × Bitte Flash Arbitrage Executor (UI-only)

A comprehensive web application that scans markets, simulates after-fee PnL, and executes cross-chain arbitrage via GUD Trading Engine with final settlement on Zircuit L2, orchestrated by Bitte Open Agents. Everything is accessible through the UI with no CLI required.

## 🚀 Features

- **Real-time Market Scanning**: Monitor arbitrage opportunities across multiple chains and DEXs
- **Cross-chain Arbitrage**: Execute trades between Ethereum, Polygon, Zircuit, Arbitrum, and Optimism
- **GUD Trading Engine Integration**: Leverage GUD's cross-chain routing for optimal execution
- **Zircuit L2 Settlement**: Final settlement on Zircuit for reduced costs and faster confirmation
- **Bitte Agent Orchestration**: Automated workflow management via Bitte Open Agents
- **Comprehensive Risk Management**: Built-in guardrails for slippage, freshness, and liquidity
- **Real-time Updates**: Live polling with configurable intervals
- **Fee Estimation**: Accurate calculation of swap, bridge, gas, and routing fees
- **Simulation Before Execution**: Test arbitrage profitability before committing funds

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI   │    │   API Routes    │    │    Services     │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • /api/scan     │◄──►│ • DEX Indexer   │
│ • Settings      │    │ • /api/simulate │    │ • GUD Client    │
│ • Components    │    │ • /api/execute  │    │ • Zircuit RPC   │
│                 │    │ • /api/health   │    │ • Bitte Agent   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Zod validation, SWR for data fetching
- **Blockchain**: viem for Ethereum interactions, Zircuit L2 integration
- **Trading**: GUD Trading Engine for cross-chain routing
- **Orchestration**: Bitte Open Agents for workflow automation
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deployment**: Vercel-ready with environment variable support

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Environment variables configured (see setup)

## 🚀 Quick Start

1. **Clone and install dependencies**:
```bash
git clone https://github.com/sambitsargam/ArbiZirQ.git
cd ArbiZirQ
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
PROJECT_NAME=ArbiZirQ
ZIRCUIT_RPC_URL=https://zircuit1-mainnet.p2pify.com/
GUD_API_KEY=ETHVietnam2025
BITTE_API_KEY=bitte_3ZXGgFibVouKJMNstXASUorp
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
```

3. **Generate API types**:
```bash
npm run generate-api
```

4. **Start development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to `http://localhost:3000`

## 🎯 Core Workflows

### 1. Market Scanning
- Configure token pairs and chains in settings
- Real-time polling for arbitrage opportunities
- Opportunities sorted by profitability
- Built-in guardrails for safety

### 2. Simulation
- Click "Simulate" on any opportunity
- View detailed fee breakdown
- Estimate slippage and net PnL
- Proceed only if profitable

### 3. Execution
- Confirm simulation results
- Set maximum slippage tolerance
- Execute via GUD Trading Engine
- Monitor settlement on Zircuit L2

## 🔧 Configuration

### Settings Panel
Access via the gear icon in the top-right corner:

- **Polling Settings**: Enable/disable automatic scanning, set intervals
- **Profit Thresholds**: Minimum profit (USD), maximum slippage (bps)
- **Chain Selection**: Choose chains to monitor (minimum 2 required)
- **Token Pairs**: Add/remove trading pairs
- **API Status**: View service connectivity

### Default Settings
```typescript
{
  minProfitUsd: 10,        // $10 minimum profit
  maxSlippageBps: 100,     // 1% maximum slippage
  pollingIntervalMs: 5000, // 5-second polling
  maxQuoteAgeSeconds: 30,  // 30-second quote freshness
}
```

## 📊 API Endpoints

### Health Check
```http
GET /api/health
```
Returns status of Zircuit, GUD, and Bitte services.

### Scan Markets
```http
POST /api/scan
Content-Type: application/json
X-Bitte-Key: your-bitte-api-key

{
  "pairs": [{"base": "USDC", "quote": "USDT"}],
  "chains": ["ethereum", "polygon", "zircuit"],
  "minProfitUsd": 10,
  "maxSlippageBps": 100
}
```

### Simulate Arbitrage
```http
POST /api/simulate
Content-Type: application/json
X-Bitte-Key: your-bitte-api-key

{
  "id": "opportunity-id",
  "pair": {"base": "USDC", "quote": "USDT"},
  "sourceChain": "ethereum",
  "targetChain": "polygon",
  // ... opportunity details
}
```

### Execute Arbitrage
```http
POST /api/execute
Content-Type: application/json
X-Bitte-Key: your-bitte-api-key

{
  // ... same as simulate
  "dryRun": false,
  "maxSlippageBps": 100
}
```

## 🛡️ Risk Management

### Guardrails
- **Quote Freshness**: Reject stale quotes (configurable age limit)
- **Slippage Protection**: Maximum slippage enforcement
- **Liquidity Checks**: Minimum liquidity requirements
- **Profit Thresholds**: Only execute profitable opportunities
- **Cross-chain Validation**: Verify both legs of arbitrage

### Safety Features
- **Dry Run Mode**: Test execution without real trades
- **Confirmation Dialogs**: User acknowledgment required
- **Transaction Monitoring**: Real-time status updates
- **Error Handling**: Graceful failure recovery

## 📈 Fee Calculation

### Fee Breakdown
```typescript
{
  swapFees: number,     // DEX trading fees
  bridgeFees: number,   // Cross-chain bridge costs
  gasEstimate: number,  // Transaction gas costs
  routingFees: number,  // GUD Trading Engine fees
  total: number         // Sum of all fees
}
```

### Fee Estimation
- **Swap Fees**: 0.05-0.3% depending on DEX
- **Bridge Fees**: $1-15 base + 0.1% of trade size
- **Gas Costs**: Chain-specific multipliers
- **Routing Fees**: 0.1-0.3% for GUD services

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
- Math utilities (PnL calculation, fees)
- API route validation
- Component rendering
- User workflows

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all required environment variables are set:
- `ZIRCUIT_RPC_URL`
- `GUD_API_KEY` 
- `BITTE_API_KEY`
- `ETHEREUM_RPC_URL` (optional)
- `POLYGON_RPC_URL` (optional)

## 🔗 Integrations

### Zircuit L2
- **Documentation**: https://docs.zircuit.io/
- **SDK**: https://docs.zircuit.io/sdk
- **RPC**: Configure via `ZIRCUIT_RPC_URL`

### GUD Trading Engine
- **Documentation**: https://docs.gud.finance/trading-engine
- **API Key**: Set `GUD_API_KEY` environment variable
- **Workshop**: https://github.com/zircuit-labs/trading-engine-workshop

### Bitte Open Agents
- **Documentation**: https://docs.bitte.ai/
- **Boilerplate**: https://github.com/BitteProtocol/agent-next-boilerplate/
- **API Key**: Set `BITTE_API_KEY` environment variable

## 📝 Development Notes

### Adding New Chains
1. Update `SUPPORTED_CHAINS` in `lib/constants.ts`
2. Add chain configuration to `CHAIN_DEXS`
3. Update `getChainColor` in `lib/format.ts`
4. Add RPC endpoint to `DEFAULT_RPC_URLS`

### Adding New DEXs
1. Update `CHAIN_DEXS` mapping
2. Add fee configuration to `DEX_FEE_BPS`
3. Implement quote fetching in `dex-indexer.ts`

### Custom Token Pairs
Users can add custom token pairs via the settings panel. The application validates and stores these preferences locally.

## 🐛 Troubleshooting

### Common Issues

1. **"No opportunities found"**
   - Check chain selection (minimum 2 required)
   - Verify token pairs are configured
   - Ensure API keys are valid

2. **"Simulation failed"**
   - Check quote freshness
   - Verify liquidity requirements
   - Review slippage settings

3. **"Execution error"**
   - Ensure sufficient balance
   - Check network connectivity
   - Verify GUD API key

### Debug Mode
Set `NODE_ENV=development` to enable detailed error messages and logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zircuit** for L2 infrastructure and SDK
- **GUD Finance** for cross-chain trading engine
- **Bitte Protocol** for agent orchestration
- **Vercel** for deployment platform
- **shadcn/ui** for component library

## 📞 Support

- **Issues**: GitHub Issues
- **Discord**: [Join our community](https://discord.gg/arbizirq)
- **Twitter**: [@ArbiZirQ](https://twitter.com/arbizirq)

---

**⚠️ Disclaimer**: This software is for educational and research purposes. Always understand the risks involved in DeFi trading and never invest more than you can afford to lose.
