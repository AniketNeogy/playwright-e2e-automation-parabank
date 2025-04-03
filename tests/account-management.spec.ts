/**
 * Account Management Tests
 * 
 * This file contains test scenarios for account creation, overview, fund transfers, and bill payments.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { NewAccountPage } from '../page-objects/new-account.page';
import { TransferFundsPage } from '../page-objects/transfer-funds.page';
import { BillPaymentPage } from '../page-objects/bill-payment.page';
import { RegistrationPage } from '../page-objects/registration.page';
import { generateUserData } from '../utils/data-generator';
import { formatCurrency, parseCurrency } from '../utils/test-helpers';

// Store user data for use across tests
interface TestUser {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

// Test data
let savingsAccountId: string;
let initialBalance: number;
const transferAmount = '100.00';
const billPaymentAmount = '50.00';

test.describe.serial('ParaBank Account Management', () => {
    let userData: TestUser;
    
    test.beforeAll(async ({ browser }) => {
        console.log('Setting up test data for Account Management tests');
        const page = await browser.newPage();
        
        try {
            // Arrange
            const registrationPage = new RegistrationPage(page);
            const generatedUser = generateUserData();

            userData = {
                username: generatedUser.username,
                password: generatedUser.password,
                firstName: generatedUser.firstName,
                lastName: generatedUser.lastName
            };

            await registrationPage.goto();
            console.log('Navigated to registration page');
            await page.waitForLoadState('networkidle');
            await registrationPage.fillRegistrationForm(generatedUser);
            await registrationPage.submitRegistration();

            const welcomeLocator = page.locator('div#rightPanel h1');
            await welcomeLocator.waitFor({ state: 'visible', timeout: 30000 });
            
            console.log(`Set up test amounts - Transfer: ${transferAmount}, Bill Payment: ${billPaymentAmount}`);
            
        } finally {
            await page.close();
        }
    });
    
    test.describe('Navigation and Site Structure', () => {
        test('Verify global navigation menu functionality is working correctly', async ({ page }) => {
            // Arrange - Login first
            console.log('Starting navigation menu functionality test');
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            await loginPage.login(userData.username, userData.password);
            console.log(`Logged in with username: ${userData.username}`);

            const navLinks = [
                { name: 'Open New Account', url: 'openaccount.htm' },
                { name: 'Accounts Overview', url: 'overview.htm' },
                { name: 'Transfer Funds', url: 'transfer.htm' },
                { name: 'Bill Pay', url: 'billpay.htm' },
                { name: 'Find Transactions', url: 'findtrans.htm' },
                { name: 'Update Contact Info', url: 'updateprofile.htm' },
                { name: 'Request Loan', url: 'requestloan.htm' }
            ];
            
            // Act & Assert - Test each navigation link
            for (const link of navLinks) {
                await page.click(`text=${link.name}`);
                await page.waitForURL(`**/${link.url}*`);
                expect(page.url(), `URL should contain ${link.url} after clicking on ${link.name}`).toContain(link.url);
                console.log(`Successfully navigated to ${link.name}: ${page.url()}`);
            }
        });
    });
    
    test.describe('Account Creation and Management', () => {
        test('Create a new savings account successfully', async ({ page }) => {
            // Arrange - Login first
            console.log('Starting new savings account creation test');
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            const accountsPage = await loginPage.login(userData.username, userData.password);
            await page.waitForTimeout(2000);
            console.log(`Logged in with username: ${userData.username}`);

            const accountIds = await accountsPage.getAccountIds();
            expect(accountIds.length, 'User should have at least one account for funding').toBeGreaterThan(0);
            console.log(`Found ${accountIds.length} existing accounts for funding`);
            
            // Act - Create a new savings account
            const newAccountPage = new NewAccountPage(page);
            await newAccountPage.navigate();
            console.log('Navigated to new account page');

            const accountTypes = await newAccountPage.getAvailableAccountTypes();
            console.log(`Available account types: ${accountTypes.join(', ')}`);

            savingsAccountId = await newAccountPage.openNewAccount('SAVINGS', accountIds[0]);
            console.log(`Created new savings account with ID: ${savingsAccountId}`);
            
            // Assert
            expect(savingsAccountId, 'Savings account ID should be returned').toBeTruthy();
            const isCreated = await newAccountPage.isAccountCreated();
            expect(isCreated, 'Account creation success message should be displayed').toBeTruthy();
            console.log('Account creation confirmed successful');

            test.info().annotations.push({
                type: 'info', 
                description: `Created savings account ID: ${savingsAccountId}`
            });
        });
        
        test('Validate account balance details are displayed correctly', async ({ page }) => {
            // Arrange - Login first
            console.log('Starting account balance validation test');
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            const accountsPage = await loginPage.login(userData.username, userData.password);
            console.log(`Logged in with username: ${userData.username}`);
            
            // Act - Check the accounts overview
            const isTableDisplayed = await accountsPage.isAccountsTableDisplayed();
            expect(isTableDisplayed, 'Accounts table should be displayed').toBeTruthy();

            const accounts = await accountsPage.getAllAccountsInfo();
            console.log(`Found ${accounts.length} accounts`);

            const savingsAccount = accounts.find(account => account.id === savingsAccountId);
            
            // Assert
            expect(savingsAccount, `Savings account with ID ${savingsAccountId} should exist in accounts list`).toBeTruthy();
            console.log(`Found savings account: ${JSON.stringify(savingsAccount)}`);

            const totalBalance = await accountsPage.getTotalBalance();
            console.log(`Total balance: ${totalBalance}`);

            if (savingsAccount?.balance) {
                initialBalance = parseCurrency(savingsAccount.balance);
                console.log(`Initial balance stored: ${formatCurrency(initialBalance)}`);

                const availableAmount = await accountsPage.getAvailableAmount(savingsAccountId);
                console.log(`Available amount: ${availableAmount}`);
                
                test.info().annotations.push({
                    type: 'info',
                    description: `Initial balance: ${formatCurrency(initialBalance)}`
                });
            }
        });
    });
    
    test.describe('Financial Transactions', () => {
        test('Successfully transfer funds to the savings account', async ({ page }) => {
            // Arrange - Login first
            console.log('Starting funds transfer test');
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            const accountsPage = await loginPage.login(userData.username, userData.password);
            console.log(`Logged in with username: ${userData.username}`);

            const accountIds = await accountsPage.getAccountIds();
            const sourceAccountId = accountIds.find(id => id !== savingsAccountId) || accountIds[0];
            console.log(`Using source account ID: ${sourceAccountId} for transfer`);
            
            // Act - Transfer funds
            const transferPage = new TransferFundsPage(page);
            await transferPage.navigate();
            console.log(`Transferring ${transferAmount} from account ${sourceAccountId} to ${savingsAccountId}`);

            const availableAccounts = await transferPage.getAvailableAccounts();
            console.log(`Available accounts for transfer: ${availableAccounts.join(', ')}`);
            
            await transferPage.transferFunds(transferAmount, sourceAccountId, savingsAccountId);
            
            // Assert
            const isSuccess = await transferPage.isTransferSuccessful();
            expect(isSuccess, 'Transfer should complete successfully with confirmation message').toBeTruthy();
            console.log('Transfer completed successfully');

            const transferDetails = await transferPage.getTransferDetails();
            expect(transferDetails.amount, `Transfer amount should be ${transferAmount}`).toContain(transferAmount);
            expect(transferDetails.fromAccountId, `Source account should be ${sourceAccountId}`).toContain(sourceAccountId);
            expect(transferDetails.toAccountId, `Destination account should be ${savingsAccountId}`).toContain(savingsAccountId);
            console.log(`Transfer details verified: ${JSON.stringify(transferDetails)}`);

            expect(await transferPage.hasError(), 'No error should be displayed').toBeFalsy();
        });
        
        test('Successfully pay a bill from the savings account', async ({ page }) => {
            // Arrange - Login first
            console.log('Starting bill payment test');
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            await loginPage.login(userData.username, userData.password);
            console.log(`Logged in with username: ${userData.username}`);

            const payeeData = {
                name: 'John Smith',
                address: '123 Main St',
                city: 'Boston',
                state: 'MA',
                zipCode: '02108',
                phone: '1234567890',
                account: '12345'
            };
            console.log(`Generated payee: ${payeeData.name}`);
            
            // Act - Pay a bill
            const billPayPage = new BillPaymentPage(page);
            await billPayPage.navigate();
            console.log('Navigated to bill payment page');
            
            try {
                await billPayPage.fillPayeeInformation(payeeData);
                console.log('Filled payee information');
                
                await billPayPage.setAmount(billPaymentAmount);
                console.log(`Set payment amount: ${billPaymentAmount}`);
                
                await billPayPage.selectFromAccount(savingsAccountId);
                console.log(`Selected source account: ${savingsAccountId}`);

                await billPayPage.clickSendPayment();
                console.log('Sent payment');
                
                // Assert success
                const isSuccess = await billPayPage.isPaymentSuccessful();
                expect(isSuccess, 'Bill payment should complete successfully with confirmation message').toBeTruthy();
                console.log('Payment was successful');
                
                const paymentAmount = await billPayPage.getPaymentAmount();
                expect(paymentAmount, `Payment amount should be ${billPaymentAmount}`).toContain(billPaymentAmount);
                
                const payeeName = await billPayPage.getPayeeName();
                expect(payeeName, `Payee name should be ${payeeData.name}`).toEqual(payeeData.name);
                
                const fromAccountId = await billPayPage.getFromAccountId();
                expect(fromAccountId, `From account ID should be ${savingsAccountId}`).toEqual(savingsAccountId);
                
                console.log(`Payment details verified - Amount: ${paymentAmount}, Payee: ${payeeName}, Account: ${fromAccountId}`);
                
                expect(await billPayPage.hasError(), 'No error should be displayed').toBeFalsy();
                expect(await billPayPage.hasValidationErrors(), 'No validation errors should be displayed').toBeFalsy();
            } catch (error: any) {
                console.error(`Bill payment failed: ${error.message}`);
                await page.screenshot({ path: 'billpay-error.png' });
                throw error;
            }
        });
    });
    
    test.describe('Account Verification', () => {
        test('Verify updated balance after transactions is calculated correctly', async ({ page }) => {
            // Arrange - Login first
            console.log('Starting balance verification after transactions test');
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            const accountsPage = await loginPage.login(userData.username, userData.password);
            console.log(`Logged in with username: ${userData.username}`);
            
            // Act - Check the accounts overview again
            expect(await accountsPage.isErrorDisplayed(), 'No error should be displayed').toBeFalsy();
            
            const loggedInUsername = await accountsPage.getLoggedInUsername();
            console.log(`Logged in as: ${loggedInUsername}`);
            expect(loggedInUsername).toContain(userData.firstName);
            
            const accounts = await accountsPage.getAllAccountsInfo();
            console.log(`Found ${accounts.length} accounts`);
            const savingsAccount = accounts.find(account => account.id === savingsAccountId);
            
            // Assert
            expect(savingsAccount, `Savings account with ID ${savingsAccountId} should still exist`).toBeTruthy();
            console.log(`Found savings account: ${JSON.stringify(savingsAccount)}`);
            
            if (savingsAccount?.balance) {
                const updatedBalance = parseCurrency(savingsAccount.balance);
                
                const expectedBalance = initialBalance + 
                                       parseFloat(transferAmount) - 
                                       parseFloat(billPaymentAmount);
                
                console.log(`Final balance check - Actual: ${formatCurrency(updatedBalance)}, Expected: ${formatCurrency(expectedBalance)}`);
                
                expect(updatedBalance, `Account balance should be approximately ${formatCurrency(expectedBalance)} after transactions`).toBeCloseTo(expectedBalance, 1);
                console.log('Balance verification successful');
                
                const availableAmount = savingsAccount.availableAmount;
                console.log(`Available amount: ${availableAmount}`);
                
                const totalBalance = await accountsPage.getTotalBalance();
                console.log(`Total balance: ${totalBalance}`);
                
                test.info().annotations.push({
                    type: 'info',
                    description: `Updated balance: ${formatCurrency(updatedBalance)}, Expected: ${formatCurrency(expectedBalance)}`
                });
            }
        });
    });
}); 