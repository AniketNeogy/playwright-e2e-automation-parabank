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

### Option 1: Setting up Jenkins Locally (Windows)

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
   - **Important for Windows**: In the pipeline configuration, select one of these options:
   
   **Option A: Use Direct Pipeline Script**
   - Under "Pipeline", select "Pipeline script"
   - Click "Pipeline Syntax" link to open the syntax generator
   - Select "checkout: Check out from version control" from the sample step dropdown
   - Fill in your repository details, click "Generate Pipeline Script"
   - Use the generated script as part of your pipeline definition
   - Click "Save"
   
   **Option B: Use SCM with Local Filepath**
   - Under "Pipeline", select "Pipeline script from SCM"
   - Select "Git" as SCM
   - For local repositories, set Repository URL as:
     ```
     file:///D:/Workspace/cursor-workspace/playwright-e2e-automation-parabank
     ```
     (Note the triple slashes and capital drive letter)
   - Set "Script Path" to "Jenkinsfile"
   - Click "Save"
   
   **Option C: Direct File System Approach**
   - Under "Pipeline", select "Pipeline script" (not from SCM)
   - Paste the entire contents of your Jenkinsfile in the script area
   - Click "Save"

8. **Troubleshooting Windows-Specific Issues:**
   - If Jenkins cannot find your Jenkinsfile, verify these settings:
     - The repository path format is correct (file:/// with three slashes)
     - The drive letter is capitalized (D: not d:)
     - Try Option C above as a fallback approach
   - If you see "sh not found" errors, ensure your Jenkinsfile uses Windows commands:
     - Use `bat` instead of `sh` for command execution
     - Replace bash commands with Windows PowerShell or CMD equivalents

### Option 2: Using Docker for Jenkins (Recommended)

For a more consistent and isolated environment, you can run Jenkins in Docker:

1. **Prerequisites:**
   - Make sure Docker and Docker Compose are installed
   - For Windows users, ensure Docker Desktop is running

2. **Launch Jenkins Container:**
   - The repository contains the necessary Docker configuration files
   - Open a terminal or command prompt
   - Navigate to the project root directory
   - Run the following command:
   ```bash
   docker-compose up -d
   ```
   - This will build a custom Jenkins image with Node.js 22.x and all dependencies required for Playwright

3. **Initial Jenkins Setup:**
   - Once the container is running, access Jenkins at http://localhost:8080
   - Retrieve the initial admin password by running:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
   - Complete the setup wizard, installing the recommended plugins
   - Create an admin user when prompted

4. **Configure Jenkins:**
   - Install additional plugins if needed:
     - Go to "Manage Jenkins" > "Plugins" > "Available plugins"
     - Install the "HTML Publisher" plugin if not already installed

5. **Create a Pipeline Job:**
   - Click "New Item", enter a name (e.g., "ParaBank-Playwright-Tests")
   - Select "Pipeline" and click "OK"
   - Under "Pipeline", select "Pipeline script from SCM"
   - For "SCM", select "Git"
   - For "Repository URL", enter `/workspace` (the project is already mounted in the container)
   - For "Branch Specifier", enter `*/main` (or your branch name)
   - For "Script Path", enter `Jenkinsfile`
   - Save the configuration

6. **Run the Pipeline:**
   - Click "Build with Parameters" on your pipeline job
   - Select parameters and click "Build"
   - Monitor progress in the console output

7. **View Test Results:**
   - After completion, view test reports via the "Playwright Test Report" link

8. **Stopping Jenkins:**
   - When finished, stop the Jenkins container:
   ```bash
   docker-compose down
   ```
   - To remove all data, including volumes:
   ```bash
   docker-compose down -v
   ```

### Jenkinsfile Explanation:

Our Jenkinsfile defines a pipeline with the following features:

- **Specific Node.js Version:** Uses Node.js 22.14.0 via NVM for consistent execution
- **Parameterized Builds:** Allows customizing test runs with browser selection and test type filters
- **Multi-stage Pipeline:** Includes checkout, setup, dependencies installation, and test execution
- **Comprehensive Reporting:** Generates and publishes HTML reports and archives test artifacts
- **Error Handling:** Captures test failures without stopping the build
- **Workspace Cleanup:** Maintains a clean environment between runs

### Troubleshooting Jenkins Setup:

1. **Docker Issues:**
   - If you encounter permission errors with Docker, make sure your user has Docker permissions
   - On Windows, ensure Docker Desktop is running before starting the container
   - If port 8080 is already in use, modify the port mapping in docker-compose.yml

2. **NVM Installation Issues:**
   - If NVM installation fails, ensure Jenkins has proper internet access
   - Try manually installing NVM in the Jenkins user's home directory

3. **Dependency Installation Failures:**
   - Check that Node.js and npm are working correctly in the Jenkins environment
   - Ensure Jenkins has sufficient permissions to install packages

4. **Browser Installation Problems:**
   - If browser installation fails, you may need to install additional system dependencies
   - For Debian/Ubuntu: `apt-get install ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils`

### Customizing the Pipeline:

You can modify the Jenkinsfile to:
- Add email notifications for build status
- Integrate with Slack or other messaging platforms
- Add code quality checks or other testing tools
- Create parallel test execution for faster feedback
- Configure environment-specific settings

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
