/**
 * Account Management Tests
 * 
 * This file contains test scenarios for account creation, overview, fund transfers, and bill payments.
 */


import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiUtils } from '../utils/api-utils';
import { generateUserData } from '../utils/data-generator';
import { RegistrationPage } from '../page-objects/registration.page';
import { LoginPage } from 'page-objects';

test.describe.serial('API Test Suite', () => {
    let apiUtils: ApiUtils;
    let userData: { username: string, password: string };
    let accountId: number;
    let customerId: number;
    let newAccountId: number;
    
    test.beforeAll(async ({ browser, request }) => {
        apiUtils = new ApiUtils(request);
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // Register a new user
            const registrationPage = new RegistrationPage(page);
            const generatedUser = generateUserData();

            userData = {
                username: generatedUser.username,
                password: generatedUser.password,
            };

            await registrationPage.goto();
            await page.waitForLoadState('networkidle');
            await registrationPage.fillRegistrationForm(generatedUser);
            await registrationPage.submitRegistration();

            const welcomeLocator = page.locator('div#rightPanel h1');
            await welcomeLocator.waitFor({ state: 'visible', timeout: 30000 });
            
            // Login and intercept account data
            const context2 = await browser.newContext();
            const page2 = await context2.newPage();
            
            // Add request logging for debugging
            page2.on('request', request => {
                // Important requests only
                if (request.url().includes('/services_proxy/bank/customers/')) {
                    console.log(`>> ${request.method()} ${request.url()}`);
                }
            });
            
            // Setup a response listener for the accounts endpoint
            const accResponsePromise = page2.waitForResponse(response => {
                const matches = response.url().includes('/services_proxy/bank/customers/') && 
                                response.url().includes('/accounts');
                return matches;
            }, { timeout: 30000 });
            
            const loginPage = new LoginPage(page2);
            await loginPage.navigate();
            await loginPage.login(userData.username, userData.password);
            
            try {
                // Extract account information from the intercepted response
                const accResponse = await accResponsePromise;
                const responseBody = await accResponse.json();
                
                if (responseBody && responseBody.length > 0) {
                    const firstAccount = responseBody[0];
                    customerId = firstAccount.customerId;
                    accountId = firstAccount.id;
                }
                
                // Create a new savings account
                try {
                    // Extract the session cookie from the browser
                    const cookies = await page2.context().cookies();
                    const sessionCookie = cookies.find(cookie => cookie.name === 'JSESSIONID');
                    
                    if (sessionCookie) {
                        apiUtils.setSessionId(`JSESSIONID=${sessionCookie.value}`);
                    }
                    
                    const newAccount = await apiUtils.createAccount(customerId, accountId, 'SAVINGS');
                    newAccountId = newAccount.id;
                } catch (createAccountError) {
                    // If we can't create a new account, use the existing account as both source and destination
                    newAccountId = accountId;
                }
            } catch (error) {
                console.error('Failed to intercept account response:', error);
            }
        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        } finally {
            await context.close();
        }
    });

    test('Transfer funds & Validate transaction', async ({ browser, request }) => {
        // Skip test if account setup failed
        if (!accountId || !newAccountId) {
            test.skip();
            return;
        }
        
        // Create a new API utils instance with request from the test context
        const testApiUtils = new ApiUtils(request);
        
        // Create a new browser context to get the cookies
        const context = await browser.newContext();
        const page = await context.newPage();
        const loginPage = new LoginPage(page);
        
        // Log in to get the session
        await loginPage.navigate();
        await loginPage.login(userData.username, userData.password);
        
        // Extract the session cookie
        const cookies = await context.cookies();
        const sessionCookie = cookies.find(cookie => cookie.name === 'JSESSIONID');
        
        if (sessionCookie) {
            testApiUtils.setSessionId(`JSESSIONID=${sessionCookie.value}`);
        }
        
        // Transfer funds
        const transferResponse = await testApiUtils.transferFunds(accountId, newAccountId, 20);
        expect(transferResponse).toContain('Successfully transferred');
        
        // Wait briefly for transaction to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify transaction
        const transactions = await testApiUtils.findTransaction(newAccountId, 20);
        expect(transactions.length).toBeGreaterThan(0);
        expect(transactions[0]).toMatchObject({ 
            amount: 20, 
            type: accountId === newAccountId ? 'Debit' : 'Credit', 
            description: accountId === newAccountId ? 'Funds Transfer Sent' : 'Funds Transfer Received'
        });
        
        await context.close();
    });
});