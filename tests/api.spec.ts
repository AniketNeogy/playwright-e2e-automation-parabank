/**
 * API Tests
 * 
 * This file contains test scenarios for ParaBank API functionality.
 */

import { test, expect } from '@playwright/test';
import { 
    createAuthenticatedContext, 
    findTransactions,
    validateResponseSchema 
} from '../utils/api-utils';
import { generateUserData } from '../utils/data-generator';

test.describe('API Tests', () => {
    let username: string;
    let password: string;
    let accountId: string;
    let customerId: string;
    let transactionAmount: string;
    
    test.beforeAll(async ({ browser }) => {
        // Setup: Register a user and perform transactions via UI
        const page = await browser.newPage();
        
        try {
            // Register a new user
            await page.goto('https://parabank.parasoft.com/parabank/register.htm');
            const userData = generateUserData();
            username = userData.username;
            password = userData.password;
            
            await page.fill('input[id="customer.firstName"]', userData.firstName);
            await page.fill('input[id="customer.lastName"]', userData.lastName);
            await page.fill('input[id="customer.address.street"]', userData.address);
            await page.fill('input[id="customer.address.city"]', userData.city);
            await page.fill('input[id="customer.address.state"]', userData.state);
            await page.fill('input[id="customer.address.zipCode"]', userData.zipCode);
            await page.fill('input[id="customer.phoneNumber"]', userData.phone);
            await page.fill('input[id="customer.ssn"]', userData.ssn);
            await page.fill('input[id="customer.username"]', userData.username);
            await page.fill('input[id="customer.password"]', userData.password);
            await page.fill('input[id="repeatedPassword"]', userData.confirmPassword);
            await page.click('input[value="Register"]');
            
            // Wait for registration to complete and extract customer ID
            await page.waitForURL('**/parabank/overview.htm*');
            
            // Get account ID (needed for API calls)
            const accountElement = await page.locator('#accountTable tr.ng-scope td:first-child a').first();
            accountId = (await accountElement.textContent() || '').trim();
            
            // Extract customer ID from the welcome message or URL
            const welcomeMessage = await page.locator('.smallText').first().textContent();
            const match = welcomeMessage?.match(/Welcome (.*) \((\d+)\)/);
            if (match && match[2]) {
                customerId = match[2];
            }
            
            // Make a bill payment for testing transaction search
            transactionAmount = '123.45'; // Use a unique amount to search for
            
            // Navigate to bill pay page
            await page.click('text=Bill Pay');
            
            // Fill out bill payment form
            await page.fill('input[name="payee.name"]', 'Test Payee');
            await page.fill('input[name="payee.address.street"]', '123 Test St');
            await page.fill('input[name="payee.address.city"]', 'Testville');
            await page.fill('input[name="payee.address.state"]', 'TS');
            await page.fill('input[name="payee.address.zipCode"]', '12345');
            await page.fill('input[name="payee.phoneNumber"]', '123-456-7890');
            await page.fill('input[name="payee.accountNumber"]', '12345');
            await page.fill('input[name="verifyAccount"]', '12345');
            await page.fill('input[name="amount"]', transactionAmount);
            await page.selectOption('select[name="fromAccountId"]', accountId);
            await page.click('input[value="Send Payment"]');
            
            // Wait for payment to complete
            await page.waitForSelector('h1.title');
            
        } finally {
            await page.close();
        }
    });
    
    test('Search transactions using API by amount', async ({ request }) => {
        // Skip test if required data is missing
        test.skip(!accountId || !username || !password, 'Required test data missing');
        
        // Create an authenticated API context
        const apiContext = await createAuthenticatedContext(username, password);
        
        // Search for the transaction by amount
        const transactions = await findTransactions(apiContext, accountId, {
            amount: transactionAmount
        });
        
        // Assert on the result
        expect(transactions).toBeDefined();
        expect(Array.isArray(transactions)).toBeTruthy();
        expect(transactions.length).toBeGreaterThan(0);
        
        // Validate the transaction details
        const transaction = transactions[0];
        expect(transaction.amount).toEqual(parseFloat(transactionAmount));
        expect(transaction.description).toContain('Bill Payment');
    });
    
    test('Validate transaction response schema', async ({ request }) => {
        // Skip test if required data is missing
        test.skip(!accountId || !username || !password, 'Required test data missing');
        
        // Create an authenticated API context
        const apiContext = await createAuthenticatedContext(username, password);
        
        // Search for the transaction by amount
        const transactions = await findTransactions(apiContext, accountId, {
            amount: transactionAmount
        });
        
        // Assert on the result
        expect(transactions).toBeDefined();
        expect(Array.isArray(transactions)).toBeTruthy();
        expect(transactions.length).toBeGreaterThan(0);
        
        // Validate the schema - define the required properties
        const requiredProps = [
            'id', 'accountId', 'type', 'date', 'amount', 'description'
        ];
        
        // Call validateResponseSchema with the transaction and required properties
        const isValid = validateResponseSchema(transactions[0], requiredProps);
        expect(isValid).toBeTruthy();
        
        // Log the transaction details for verification
        test.info().annotations.push({
            type: 'info',
            description: `Transaction Details: ${JSON.stringify(transactions[0], null, 2)}`
        });
    });
}); 