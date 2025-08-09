# Vercel Deployment Guide for ArbiZirQ

This document provides instructions and best practices for deploying ArbiZirQ to Vercel's serverless environment.

## Environment Setup

### Required Environment Variables

Set the following environment variables in the Vercel project settings:

```
FORCE_SIMULATION=true
ZIRCUIT_RPC_URL=https://mainnet.zircuit.com
ETHEREUM_RPC_URL=https://ethereum.publicnode.com
POLYGON_RPC_URL=https://polygon.rpc.blxrbdn.com
GUD_API_KEY=your_gud_api_key_here
BITTE_API_KEY=your_bitte_api_key_here
```

### Optional Environment Variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
PROJECT_NAME=ArbiZirQ
```

## Deployment Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "FORCE_SIMULATION": "true",
    "NODE_ENV": "production"
  }
}
```

## Serverless Compatibility

The codebase has been optimized for Vercel's serverless environment with the following features:

1. **Simulation Mode**: All flash loan trade executions run in simulation mode on Vercel to avoid wallet connection issues.

2. **Error Handling**: Enhanced error handling with fallbacks to ensure the API always returns a valid response.

3. **Environment Detection**: The code automatically detects when running in Vercel's environment and adjusts behavior accordingly.

4. **Reduced Dependencies**: Removed dependencies on browser-specific APIs that might cause issues in serverless functions.

## Testing Vercel Deployment

After deploying to Vercel, you can test the deployment using the included test script:

```bash
# Update the VERCEL_URL environment variable with your deployment URL
VERCEL_URL=https://your-deployment-url.vercel.app node test-vercel-deploy.js
```

## Troubleshooting

### Common Issues

1. **API 500 Errors**: Check the function logs in Vercel dashboard. Most likely caused by missing environment variables.

2. **Timeout Errors**: Vercel functions have a 10-second execution limit. Ensure all operations complete within this timeframe.

3. **Memory Limit Errors**: Vercel functions have a 1GB memory limit. Monitor memory usage for large operations.

### Debugging

1. Enable function logs in the Vercel dashboard to see detailed error messages.

2. Use the `console.log` statements in the code to track execution flow.

3. Test locally with the Vercel CLI before deploying:
   ```bash
   vercel dev
   ```

## Best Practices

1. **Always Use Simulation Mode**: Set `FORCE_SIMULATION=true` in production to avoid wallet connection issues.

2. **Keep Functions Small**: Break down complex operations into smaller functions to avoid timeout issues.

3. **Use Edge Functions**: For performance-critical operations, consider using Vercel Edge Functions.

4. **Cache Results**: Use Vercel's KV store or Redis to cache results for frequently accessed data.

5. **Monitor Performance**: Regularly check function execution times and memory usage in the Vercel dashboard.