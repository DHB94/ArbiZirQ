// Test script for Vercel deployment of flash loan trade execution

const fetch = require('node-fetch');

async function testVercelDeployment() {
  console.log('🧪 Testing Vercel deployment of flash loan trade execution...');
  
  // Replace this with your actual Vercel deployment URL
  const vercelUrl = process.env.VERCEL_URL || 'https://arbizirq.vercel.app';
  
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
    dryRun: false, // Set to false to test real execution path (which should fall back to simulation in Vercel)
    maxSlippageBps: 100
  };

  try {
    console.log(`Testing execution API at ${vercelUrl}/api/execute`);
    const response = await fetch(`${vercelUrl}/api/execute`, {
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
      console.error('❌ Test failed');
      return;
    }
    
    console.log('✅ Test successful');
    
    // Verify the response contains the expected fields
    if (result.txHash && result.actualPnlUsd !== undefined) {
      console.log('✅ Response contains expected fields');
    } else {
      console.error('❌ Response is missing expected fields');
    }
    
    // Check if we're getting a simulation response as expected in Vercel
    if (result.mode === 'simulation') {
      console.log('✅ Correctly running in simulation mode on Vercel');
    } else {
      console.warn('⚠️ Not running in simulation mode - unexpected for Vercel deployment');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testVercelDeployment();
}

module.exports = { testVercelDeployment };