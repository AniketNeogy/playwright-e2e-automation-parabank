/**
 * Global test setup and hooks for the Playwright test framework.
 * This file contains hooks that will run before/after tests across all test files.
 */

import { test as base, expect } from '@playwright/test';

// Extension of the base test object
export const test = base.extend({
  // Add any custom fixtures here if needed
});

// Global before all tests
test.beforeAll(async () => {
  console.log('Starting test run...');
});

// Global after all tests
test.afterAll(async () => {
  console.log('Test run completed');
});

// Before each test hook
test.beforeEach(async ({ page }, testInfo) => {
  console.log(`Running test: ${testInfo.title}`);
});

// After each test hook to capture additional diagnostics on failures
test.afterEach(async ({ page }, testInfo) => {
  // If test failed, capture additional diagnostics
  if (testInfo.status !== 'passed') {
    console.log(`Test failed: ${testInfo.title}`);
    
    try {
      // Capture and attach screenshot directly to the test result
      // This will be saved in Playwright's test-specific directory
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      await testInfo.attach('failure-screenshot', { 
        body: screenshotBuffer, 
        contentType: 'image/png' 
      });
      
      // Capture and attach HTML content
      const htmlContent = await page.content();
      await testInfo.attach('page-html', { 
        body: htmlContent, 
        contentType: 'text/html' 
      });
      
      // Log the current URL
      console.log(`Failed at URL: ${page.url()}`);
      
    } catch (error) {
      console.error('Error capturing failure diagnostics:', error);
    }
  }
  
  console.log(`Completed test: ${testInfo.title} - Status: ${testInfo.status}`);
});

// Export the custom test object
export { expect }; 