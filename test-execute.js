// Test script for flash loan trade execution

const fetch = require('node-fetch');

async function testExecuteEndpoint() {
  console.log('🧪 Testing flash loan trade execution...');
  
  // Sample execution request
  const testRequest = {
    id: 'test-opportunity-' + Date.now(),
    pair: {
      base: 'WETH',
      quote: 'USDC'
    },
    sourceChain: 'ethereum',
    targetChain: 'arbitrum',
    buyQuote: {
      dex: 'uniswap-v3',
      chain: 'ethereum',
      pair: {
        base: 'WETH',
        quote: 'USDC'
      },
      price: 3500.50,
      liquidity: 5000000,
      timestamp: Math.floor(Date.now() / 1000) - 10
    },
    sellQuote: {
      dex: 'sushiswap',
      chain: 'arbitrum',
      pair: {
        base: 'WETH',
        quote: 'USDC'
      },
      price: 3520.75,
      liquidity: 3000000,
      timestamp: Math.floor(Date.now() / 1000) - 5
    },
    sizeDollar: 1000,
    grossPnlUsd: 20.25,
    timestamp: Math.floor(Date.now() / 1000),
    status: 'new',
    dryRun: true, // Set to true for testing without actual execution
    maxSlippageBps: 100
  };

  try {
    // Test with dry run first
    console.log('Testing with dry run mode...');
    const dryRunResponse = await fetch('http://localhost:3000/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });
    
    const dryRunResult = await dryRunResponse.json();
    console.log('Dry run response status:', dryRunResponse.status);
    console.log('Dry run result:', JSON.stringify(dryRunResult, null, 2));
    
    if (!dryRunResponse.ok) {
      console.error('❌ Dry run test failed');
      return;
    }
    
    console.log('✅ Dry run test successful');
    
    // Test with real execution (but still in simulation mode due to FORCE_SIMULATION env var)
    console.log('\nTesting with real execution mode...');
    const realRequest = { ...testRequest, dryRun: false };
    
    const realResponse = await fetch('http://localhost:3000/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(realRequest)
    });
    
    const realResult = await realResponse.json();
    console.log('Real execution response status:', realResponse.status);
    console.log('Real execution result:', JSON.stringify(realResult, null, 2));
    
    if (!realResponse.ok) {
      console.error('❌ Real execution test failed');
      return;
    }
    
    console.log('✅ Real execution test successful');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testExecuteEndpoint();