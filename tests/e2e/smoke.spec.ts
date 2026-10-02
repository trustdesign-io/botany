import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('home page renders correctly', async ({ page }) => {
    await page.goto('/botany/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('header navigation is present', async ({ page }) => {
    await page.goto('/botany/')
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  })

  test('footer is present', async ({ page }) => {
    await page.goto('/botany/')
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })
})
