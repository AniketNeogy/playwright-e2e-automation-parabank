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
- **Mobile viewport testing** for Pixel 5, iPhone 12, and iPhone SE

## Project Structure

```
playwright-e2e-automation-parabank/
├── config/           # Environment and configuration files
├── data/             # Test data and data generators
├── page-objects/     # Page Object classes for UI elements and actions
├── reports/          # Custom reporting utilities
├── tests/            # Test scripts organized by features
├── utils/            # Utility functions and helpers
├── playwright.config.ts # Playwright configuration
└── tsconfig.json        # TypeScript configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/playwright-e2e-automation-parabank.git
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
npm test
```

### Run specific browser tests:
```bash
npm run test:chrome
npm run test:firefox
npm run test:safari
```

### Run mobile tests:
```bash
npm run test:mobile
```

### Run tests with UI mode:
```bash
npm run test:ui
```

### Show test reports:
```bash
npm run show-report
```

### Debug tests:
```bash
npm run debug
```

## CI/CD Integration

This framework is designed to be integrated with Jenkins CI/CD pipeline:

1. Setup a local Jenkins instance
2. Create a new pipeline job in Jenkins
3. Configure the pipeline to clone the repository
4. Install necessary dependencies (Node.js, npm, Playwright)
5. Run tests using npm scripts
6. Generate and publish HTML reports

### Sample Jenkinsfile:

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
                sh 'npm test'
            }
        }
        
        stage('Generate Reports') {
            steps {
                sh 'npm run show-report'
            }
            post {
                always {
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
}
```

## Best Practices Followed

- **Modular Structure**: Clear separation of tests, page objects, and utilities
- **Clean Code**: Minimal comments, descriptive naming, and consistent formatting
- **Reusable Components**: Page objects for UI interactions and reusable utilities
- **Type Safety**: TypeScript types for better code quality and IDE support
- **Consistent Naming**: Clear and consistent naming conventions
- **Cross-Browser Testing**: Tests run across different browsers and device viewports
- **Maintainability**: Easy to extend and maintain with a well-organized structure

## License

This project is licensed under the ISC License.
