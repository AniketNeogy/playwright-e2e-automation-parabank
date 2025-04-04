# ParaBank Playwright E2E Automation Framework

A comprehensive end-to-end test automation framework for ParaBank application built with Playwright and TypeScript. This framework covers both UI and API testing scenarios with a modular, reusable, and maintainable approach.

## Overview

This framework automates testing of ParaBank, a realistic online banking application, performing both UI validations and API verifications to ensure the application functions correctly.

**Application URL:** https://parabank.parasoft.com/

## Features

- **TypeScript** for type safety and better code organization
- **Page Object Model** design pattern for better maintenance and reusability
- **Environment Configuration** for managing test environments
- **Data-driven testing** with random data generation for unique test runs
- **Parallel test execution** for faster feedback
- **HTML reporting** for better visualization of test results
- **CI/CD Integration** with Jenkins pipeline
- **Multi-browser testing** support for Chrome, Firefox, and Safari
- **Mobile viewport testing** for Pixel 5 and iPhone 12


## Project Structure

```
playwright-e2e-automation-parabank/
├── env-config/                # Environment configuration files
│   └── environment.config.ts  # URL and timeout settings
├── data/                      # Test data files
├── page-objects/              # Page Object classes
│   ├── base.page.ts           # Base page with common methods
│   ├── login.page.ts          # Login page interactions
│   ├── registration.page.ts   # User registration page
│   ├── accounts-overview.page.ts  # Account overview page
│   ├── new-account.page.ts    # Account creation page
│   ├── transfer-funds.page.ts # Fund transfers page
│   ├── bill-payment.page.ts   # Bill payment page
│   └── find-transactions.page.ts  # Transaction search page
├── tests/                     # Test scripts by feature
│   ├── auth.spec.ts           # Authentication tests
│   ├── account-management.spec.ts  # Account operations tests
│   └── api.spec.ts            # API tests
├── utils/                     # Utility functions
│   ├── api-utils.ts           # API interaction helpers
│   ├── data-generator.ts      # Random data generation
│   ├── global-setup.ts        # Test hooks and global setup
│   ├── test-helpers.ts        # Common testing utilities
│   └── types.ts               # TypeScript interfaces
├── playwright.config.ts       # Playwright configuration
└── package.json               # Project dependencies and scripts
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playwright-e2e-automation-parabank
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests:
```bash
npx playwright test
```

### Run specific test file:
```bash
npx playwright test tests/auth.spec.ts
```

### Run UI tests only (excluding API tests):
```bash
npx playwright test --grep-invert "api\.spec\.ts"
```

### Run API tests only:
```bash
npx playwright test tests/api.spec.ts
```

### Run tests on specific browsers:
```bash
npx playwright test --project=ui-chromium  # Chrome only
npx playwright test --project=ui-firefox   # Firefox only
npx playwright test --project=ui-mobile-chrome  # Mobile Chrome
```

### Run with debugging:
```bash
npx playwright test --debug
```

### View HTML test report:
```bash
npx playwright show-report
```

## Test Configuration

The `playwright.config.ts` file contains configuration for:

- Test timeouts
- Browser settings
- Screenshot and video capture
- HTML reporting
- Project-specific configurations for different browsers/devices

You can modify these settings to suit your testing needs.

## Creating New Tests

### UI Tests
1. Create page objects for any new pages in the `page-objects` directory
2. Create test files in the `tests` directory
3. Use the Page Object Model pattern for maintainable tests

Example:
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';

test('User Login - Login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('username', 'password');
  expect(await loginPage.isLoggedIn()).toBeTruthy();
});
```

### API Tests
1. Use the ApiUtils class in `utils/api-utils.ts` for API interactions
2. Create test files in the `tests` directory with API assertions

## CI/CD Integration

### Setting Up Jenkins Pipeline:

1. Install Jenkins on your local machine
2. Create a new Pipeline job
3. Create a Jenkinsfile in your repository root with the following content:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'Node16'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
        
        stage('Generate Reports') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Test Report'
                ])
            }
        }
    }
}
```

## Best Practices Followed

- **Modularity**: Clear separation of concerns with the Page Object Model
- **Reliability**: Stable selectors and appropriate waiting strategies
- **Maintainability**: Easy to extend and modify with organized structure
- **Reusability**: Common functions extracted into reusable utilities
- **Readability**: Clear naming conventions and code organization
- **Type Safety**: TypeScript interfaces for all data structures
- **Parallel Execution**: Tests designed to run independently
- **Cross-Browser Compatibility**: Tests run across multiple browsers and devices

## Troubleshooting

### Common Issues

1. **Tests Timing Out**: 
   - Increase the timeout in `playwright.config.ts`
   - Add appropriate waits in page objects

2. **Selector Not Found**:
   - Update selectors if the application UI has changed
   - Use more stable selectors like data-testid, IDs, or accessibility roles

3. **API Tests Failing**:
   - Check if session cookies are being properly passed
   - Verify API endpoint URLs and request formats

## License

This project is licensed under the MIT License.
