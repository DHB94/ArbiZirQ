import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock fetch for testing
global.fetch = vi.fn()

// Mock environment variables
process.env.ZIRCUIT_RPC_URL = 'https://test-rpc.zircuit.com'
process.env.GUD_API_KEY = 'test-key'
process.env.BITTE_API_KEY = 'bitte_test_key'
