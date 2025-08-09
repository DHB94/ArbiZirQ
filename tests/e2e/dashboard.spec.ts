import { test, expect } from '@playwright/test'

test.describe('ArbiZirQ Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main dashboard', async ({ page }) => {
    // Check if the page loads with correct title
    await expect(page).toHaveTitle(/ArbiZirQ/)
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('ArbiZirQ')
    
    // Check for key components
    await expect(page.locator('[data-testid=opportunities-table]')).toBeVisible()
    await expect(page.locator('[data-testid=stats-cards]')).toBeVisible()
  })

  test('should show health status', async ({ page }) => {
    // Check for health indicator
    await expect(page.locator('[data-testid=health-indicator]')).toBeVisible()
  })

  test('should allow opening settings', async ({ page }) => {
    // Click settings button
    await page.locator('[data-testid=settings-button]').click()
    
    // Check if settings sheet opens
    await expect(page.locator('[data-testid=settings-sheet]')).toBeVisible()
    
    // Check for settings sections
    await expect(page.locator('text=Polling Settings')).toBeVisible()
    await expect(page.locator('text=Token Pairs')).toBeVisible()
    await expect(page.locator('text=Supported Chains')).toBeVisible()
  })

  test('should handle opportunity simulation', async ({ page }) => {
    // Wait for opportunities to load
    await page.waitForSelector('[data-testid=opportunity-row]', { timeout: 10000 })
    
    // Click simulate on first opportunity
    await page.locator('[data-testid=simulate-button]').first().click()
    
    // Check if simulation drawer opens
    await expect(page.locator('[data-testid=simulate-drawer]')).toBeVisible()
    
    // Check for opportunity details
    await expect(page.locator('text=Token Pair')).toBeVisible()
    await expect(page.locator('text=Route')).toBeVisible()
    await expect(page.locator('text=Trade Size')).toBeVisible()
  })

  test('should update polling settings', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid=settings-button]').click()
    
    // Change polling interval
    await page.locator('[data-testid=polling-interval]').fill('10')
    
    // Toggle polling off and on
    await page.locator('[data-testid=polling-toggle]').click()
    await page.locator('[data-testid=polling-toggle]').click()
    
    // Close settings
    await page.locator('[data-testid=settings-close]').click()
    
    // Verify settings are closed
    await expect(page.locator('[data-testid=settings-sheet]')).not.toBeVisible()
  })

  test('should add and remove token pairs', async ({ page }) => {
    // Open settings
    await page.locator('[data-testid=settings-button]').click()
    
    // Add new token pair
    await page.locator('[data-testid=token-base-input]').fill('DAI')
    await page.locator('[data-testid=token-quote-input]').fill('USDC')
    await page.locator('[data-testid=add-pair-button]').click()
    
    // Check if pair was added
    await expect(page.locator('text=DAI/USDC')).toBeVisible()
    
    // Remove a token pair
    await page.locator('[data-testid=remove-pair-button]').first().click()
    
    // Close settings
    await page.locator('[data-testid=settings-close]').click()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('/api/scan', route => route.abort())
    
    // Reload page
    await page.reload()
    
    // Check for error state
    await expect(page.locator('text=Failed to load')).toBeVisible()
    
    // Check for retry button
    await expect(page.locator('[data-testid=retry-button]')).toBeVisible()
  })

  test('should show guardrails banner', async ({ page }) => {
    // Check for guardrails banner
    await expect(page.locator('[data-testid=guardrails-banner]')).toBeVisible()
    
    // Check for guardrails status
    await expect(page.locator('text=System Guardrails')).toBeVisible()
  })

  test('should refresh opportunities', async ({ page }) => {
    // Click refresh button
    await page.locator('[data-testid=refresh-button]').click()
    
    // Check for loading state
    await expect(page.locator('[data-testid=refresh-button] .animate-spin')).toBeVisible()
    
    // Wait for refresh to complete
    await page.waitForTimeout(2000)
    
    // Check that loading state is gone
    await expect(page.locator('[data-testid=refresh-button] .animate-spin')).not.toBeVisible()
  })

  test('should display opportunity details correctly', async ({ page }) => {
    // Wait for opportunities
    await page.waitForSelector('[data-testid=opportunity-row]')
    
    // Check table headers
    await expect(page.locator('text=Pair')).toBeVisible()
    await expect(page.locator('text=Route')).toBeVisible()
    await expect(page.locator('text=Size')).toBeVisible()
    await expect(page.locator('text=Gross PnL')).toBeVisible()
    await expect(page.locator('text=Freshness')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
    await expect(page.locator('text=Actions')).toBeVisible()
  })
})
