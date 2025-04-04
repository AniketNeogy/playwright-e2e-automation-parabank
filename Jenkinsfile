pipeline {
    agent any
    
    // We'll use environment variables to specify Node.js version
    environment {
        NODE_VERSION = '22.14.0'
    }
    
    options {
        // Keep the build history and artifacts for 10 days
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Don't run concurrent builds for the same branch
        disableConcurrentBuilds()
        // Set timeout to prevent hanging builds
        timeout(time: 60, unit: 'MINUTES')
    }
    
    parameters {
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'], description: 'Browser to run tests on')
        booleanParam(name: 'API_ONLY', defaultValue: false, description: 'Run only API tests')
        booleanParam(name: 'UI_ONLY', defaultValue: false, description: 'Run only UI tests')
        booleanParam(name: 'MOBILE', defaultValue: false, description: 'Run tests on mobile viewports')
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout code from repository
                checkout scm
                echo 'Code checkout completed'
            }
        }
        
        stage('Setup Node.js') {
            steps {
                // Use NVM to install and use specific Node.js version
                sh '''
                    # Install NVM if not available
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    
                    # Install and use specific Node.js version
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                    
                    # Verify Node.js and npm versions
                    node --version
                    npm --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                // Use NVM with specific Node.js version for installing dependencies
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm use ${NODE_VERSION}
                    
                    # Install npm dependencies
                    npm ci
                    
                    # Install Playwright browsers with dependencies
                    npx playwright install --with-deps
                '''
                echo 'Dependencies installation completed'
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    def testCommand = 'npx playwright test'
                    
                    // Configure test command based on parameters
                    if (params.API_ONLY) {
                        testCommand = 'npx playwright test tests/api.spec.ts'
                    } else if (params.UI_ONLY) {
                        testCommand = 'npx playwright test --grep-invert "api\\.spec\\.ts"'
                    }
                    
                    // Add browser selection
                    if (params.BROWSER != 'all') {
                        if (params.MOBILE && params.BROWSER == 'chromium') {
                            testCommand += ' --project=ui-mobile-chrome'
                        } else if (params.MOBILE && params.BROWSER == 'webkit') {
                            testCommand += ' --project=ui-mobile-safari'
                        } else {
                            testCommand += " --project=ui-${params.BROWSER}"
                        }
                    } else if (params.MOBILE) {
                        testCommand += ' --project=ui-mobile-chrome --project=ui-mobile-safari'
                    }
                    
                    try {
                        // Run the tests with the specific Node.js version
                        sh """
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            nvm use ${NODE_VERSION}
                            
                            ${testCommand}
                        """
                    } catch (Exception e) {
                        echo "Tests failed with error: ${e.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Archive test results and generate reports
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                reportTitles: 'Test Results'
            ])
            
            // Archive test artifacts
            archiveArtifacts(
                artifacts: 'playwright-report/**/*.*,test-results/**/*.*', 
                allowEmptyArchive: true
            )
        }
        
        success {
            echo 'Tests completed successfully!'
        }
        
        unstable {
            echo 'Tests completed with errors. Check the test report for details.'
        }
        
        failure {
            echo 'Build failed. Check build logs for details.'
        }
        
        cleanup {
            // Clean workspace
            cleanWs(
                cleanWhenNotBuilt: true,
                deleteDirs: true,
                disableDeferredWipeout: true,
                patterns: [[pattern: 'test-results', type: 'INCLUDE']]
            )
        }
    }
} 