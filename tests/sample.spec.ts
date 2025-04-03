import { test, expect } from '@playwright/test';
import { EnvironmentConfig } from '../env-config/environment.config';

test.describe('Playwright Setup Verification', () => {
  test('should navigate to ParaBank and verify page title', async ({ page }) => {
    await page.goto(EnvironmentConfig.baseUrl);
    await expect(page).toHaveTitle(/ParaBank/);
    await expect(page.locator('form[name="login"]')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();
    console.log('✅ Playwright setup is working correctly!');
  });
}); 