import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configurations
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  // Set timeout for each test - can be adjusted as needed
  timeout: 60000,
  
  // Global setup for all tests
  use: {
    // Base URL for navigation
    baseURL: 'https://parabank.parasoft.com',
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Enable screenshot capturing - 'on' captures on test failures
    screenshot: 'on',
    
    // Capture trace for all tests
    trace: 'on',
    
    // Record video for all tests
    video: 'on',
    
    // Automatically capture console logs
    contextOptions: {
      logger: {
        isEnabled: () => true,
        log: (name, severity, message, args) => console.log(`${name} ${message}`)
      }
    },
    
    // Enable access to page error logs
    launchOptions: {
      slowMo: process.env.CI ? 0 : 0
    }
  },

  // Output directory for test artifacts
  outputDir: './test-results/',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Safari - iPhone 12',
      use: { ...devices['iPhone 12'] },
    }
  ],
});
