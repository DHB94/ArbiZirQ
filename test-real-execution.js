// Test script for real flash loan trade execution

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.real' });

async function testRealExecution() {
  console.log('🚀 Testing REAL flash loan trade execution...');
  
  // Sample execution request
  const testRequest = {
    id: 'test-opportunity-' + Date.now(),
    pair: {
      base: 'WETH',
      quote: 'USDC'
    },
    sourceChain: 'polygon', // Using Polygon for testing
    targetChain: 'polygon', // Same chain to avoid bridging complexity
    buyQuote: {
      dex: 'quickswap',
      chain: 'polygon',
      pair: {
        base: 'WETH',
        quote: 'USDC'
      },
      price: 3500.50,
      liquidity: 5000000,
      timestamp: Math.floor(Date.now() / 1000) - 10
    },
    sellQuote: {
      dex: 'quickswap',
      chain: 'polygon',
      pair: {
        base: 'WETH',
        quote: 'USDC'
      },
      price: 3520.75,
      liquidity: 3000000,
      timestamp: Math.floor(Date.now() / 1000) - 5
    },
    sizeDollar: 10, // Small amount for testing
    grossPnlUsd: 0.25,
    timestamp: Math.floor(Date.now() / 1000),
    status: 'new',
    dryRun: false, // IMPORTANT: Set to false for real execution
    maxSlippageBps: 100
  };

  try {
    console.log('⚠️ WARNING: This will execute a REAL transaction using actual funds!');
    console.log('Make sure your wallet has sufficient funds and you understand the risks.');
    console.log('Press Ctrl+C now to cancel if you do not want to proceed.');
    
    // Wait 5 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Proceeding with real execution...');
    
    const response = await fetch('http://localhost:3000/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('❌ Real execution test failed');
      return;
    }
    
    console.log('✅ Real execution test successful');
    
    // Check transaction hash
    if (result.txHash) {
      console.log('Transaction hash:', result.txHash);
      console.log(`View transaction on PolygonScan: https://polygonscan.com/tx/${result.txHash}`);
    }
    
    // Check PnL
    if (result.actualPnlUsd !== undefined) {
      console.log('Actual PnL:', result.actualPnlUsd, 'USD');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRealExecution();