# Real Transaction Execution Guide for ArbiZirQ

This guide provides instructions on how to execute real flash loan trades using ArbiZirQ.

## Prerequisites

Before executing real transactions, ensure you have:

1. **Wallet with Funds**: A wallet with sufficient funds for the trades
2. **Private Key**: Access to the private key of the wallet
3. **API Keys**: Valid API keys for GUD and other services
4. **RPC URLs**: Working RPC URLs for the blockchains you'll interact with

## Setup

1. **Environment Variables**:
   
   Copy the `.env.real` file to `.env.local`:
   ```bash
   cp .env.real .env.local
   ```

2. **Configure Private Key**:
   
   Edit `.env.local` and add your wallet's private key:
   ```
   EXECUTOR_PRIVATE_KEY=0x... # Your private key here
   ```

3. **Configure API Keys**:
   
   Add your API keys to `.env.local`:
   ```
   GUD_API_KEY=your_gud_api_key_here
   BITTE_API_KEY=your_bitte_api_key_here
   ```

4. **Disable Simulation Mode**:
   
   Ensure simulation mode is disabled:
   ```
   FORCE_SIMULATION=false
   ```

## Running Real Transactions

### Starting the Server

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will run at `http://localhost:3000`

### Executing Trades

#### Option 1: Using the Test Script

1. Run the test script:
   ```bash
   node test-real-execution.js
   ```

2. The script will execute a real trade on Polygon using the configured wallet.

#### Option 2: Using the API Directly

1. Send a POST request to the execute endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/execute \
     -H "Content-Type: application/json" \
     -d '{
       "id": "manual-opportunity-123",
       "pair": {
         "base": "WETH",
         "quote": "USDC"
       },
       "sourceChain": "polygon",
       "targetChain": "polygon",
       "buyQuote": {
         "dex": "quickswap",
         "chain": "polygon",
         "pair": {
           "base": "WETH",
           "quote": "USDC"
         },
         "price": 3500.50,
         "liquidity": 5000000,
         "timestamp": 1754781336
       },
       "sellQuote": {
         "dex": "quickswap",
         "chain": "polygon",
         "pair": {
           "base": "WETH",
           "quote": "USDC"
         },
         "price": 3520.75,
         "liquidity": 3000000,
         "timestamp": 1754781341
       },
       "sizeDollar": 10,
       "grossPnlUsd": 0.25,
       "timestamp": 1754781346,
       "status": "new",
       "dryRun": false,
       "maxSlippageBps": 100
     }'
   ```

## Monitoring Transactions

1. **Transaction Hash**: The API response will include a transaction hash
2. **Block Explorer**: Use the appropriate block explorer to monitor the transaction:
   - Ethereum: [Etherscan](https://etherscan.io)
   - Polygon: [PolygonScan](https://polygonscan.com)
   - Arbitrum: [Arbiscan](https://arbiscan.io)
   - Base: [Basescan](https://basescan.org)

## Security Considerations

1. **Private Key Security**:
   - Never commit your private key to version control
   - Use environment variables or secure key management
   - Consider using a hardware wallet for production

2. **Fund Management**:
   - Start with small trade sizes for testing
   - Implement circuit breakers for large trades
   - Monitor wallet balances regularly

3. **Error Handling**:
   - Implement proper error handling for failed transactions
   - Set up monitoring and alerts for failed trades
   - Have a recovery plan for stuck transactions

## Troubleshooting

### Common Issues

1. **Insufficient Funds**:
   - Ensure your wallet has sufficient funds for the trade and gas
   - Check token approvals for DEX routers

2. **Transaction Failures**:
   - Check gas price and limits
   - Verify token addresses are correct
   - Ensure slippage tolerance is appropriate

3. **API Errors**:
   - Verify API keys are valid
   - Check RPC URLs are working
   - Ensure request parameters are valid

### Getting Help

If you encounter issues:
1. Check the console logs for detailed error messages
2. Review transaction details on the block explorer
3. Contact support with the transaction hash and error details