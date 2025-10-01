import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')

  // Expect page title to contain 'Prestr'
  await expect(page).toHaveTitle(/Prestr/)
})
