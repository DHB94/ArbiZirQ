// Initialize Bitte integration when the application starts
import { initializeBitteIntegration } from '@/lib/services/bitte-client'

// Initialize Bitte integration
if (typeof window === 'undefined') {
  // Only run on server side
  initializeBitteIntegration().catch(console.warn)
}

export {}
