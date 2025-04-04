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


## CI/CD Integration

### Setting up Jenkins Locally (Windows)

1. **Download and Install Jenkins:**
   - Go to the Jenkins download page: https://www.jenkins.io/download/
   - Download the Windows installer (.msi file)
   - Run the installer and follow the setup wizard:
     - Accept the license agreement
     - Choose an installation directory (avoid paths with spaces)
     - Let it configure the port (default is 8080)
     - Select "Install" and wait for completion

2. **Start and Configure Jenkins:**
   - After installation, Jenkins should start automatically and open in your browser
   - If it doesn't, access it at http://localhost:8080
   - You'll see an "Unlock Jenkins" screen
   - Find the admin password at: C:\Program Files\Jenkins\secrets\initialAdminPassword
   - Copy this password and paste it into the "Administrator password" field
   - Click "Continue"

3. **Install Plugins:**
   - On the "Customize Jenkins" screen, select "Install suggested plugins"
   - Wait for plugin installation to complete
   - Create an admin user when prompted (fill in username, password, etc.)
   - Keep the Jenkins URL as http://localhost:8080 and click "Save and Finish"
   - Click "Start using Jenkins" to access dashboard

4. **Install Additional Required Plugins:**
   - Go to "Manage Jenkins" > "Plugins" > "Available plugins"
   - Search for and install:
     - "NodeJS Plugin"
     - "HTML Publisher Plugin"
     - Verify "Pipeline" and "Git" plugins are installed
   - Click "Install without restart"

5. **Configure NodeJS Tool:**
   - Go to "Manage Jenkins" > "Tools"
   - Under "NodeJS installations" click "Add NodeJS"
   - Name it "NodeJS" 
   - Check "Install automatically"
   - Select latest Node 22.x version
   - Click "Save"

6. **Create a Pipeline Job:**
   - Click "New Item"
   - Enter "ParaBank-Playwright-Tests" as name
   - Select "Pipeline" and click "OK"
   - In the pipeline configuration:

7. **Configure Pipeline:**
   - **Important for Windows**: 
   - Under "Pipeline", select "Pipeline script from SCM"
   - Select "Git" as SCM
   - set Repository URL as:
     ```
     https://github.com/AniketNeogy/playwright-e2e-automation-parabank
     ```
   - Set "Script Path" to "Jenkinsfile"
   - Click "Save"

8. **Run the Pipeline:**
   - Click "Build with Parameters" on your pipeline job
   - Select desired parameters:
     - BROWSER: Choose browser to run tests (chromium/firefox/webkit/all)
     - API_ONLY: Run only API tests
     - UI_ONLY: Run only UI tests  
     - MOBILE: Run tests on mobile viewport
   - Click "Build"
   - Monitor build progress in console output
   - View test results after completion:
     - Click on build number
     - Click "Playwright Test Report" link
     - Review test execution details, screenshots and traces

<div align="center">
    <img src="/artefacts/JenkinsBuild.png" width="400px"</img> 
</div>

<div align="center">
    <img src="/artefacts/JenkinsTestReport.png" width="400px"</img> 
</div>


## License

This project is licensed under the MIT License.
