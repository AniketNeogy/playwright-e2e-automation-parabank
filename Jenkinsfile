pipeline {
    agent any
    
    environment {
        NODE_VERSION = '22.14.0'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
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
                checkout scm
                echo 'Code checkout completed'
            }
        }
        
        stage('Setup Node.js') {
            steps {
                bat 'node --version || echo Node.js not found'
                bat 'npm --version || echo npm not found'
                bat 'where node || echo Node.js path not found'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install --with-deps'
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
                    
                    // Add browser selection with CORRECT project names
                    if (params.BROWSER != 'all') {
                        if (params.MOBILE && (params.BROWSER == 'chromium' || params.BROWSER == 'webkit')) {
                            testCommand += ' --project="Mobile Safari - iPhone 12"'
                        } else {
                            testCommand += " --project=${params.BROWSER}"
                        }
                    }
                    
                    try {
                        bat "${testCommand}"
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
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                reportTitles: 'Test Results'
            ])
            
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
            cleanWs(
                cleanWhenNotBuilt: true,
                deleteDirs: true,
                disableDeferredWipeout: true,
                patterns: [[pattern: 'test-results', type: 'INCLUDE']]
            )
        }
    }
}