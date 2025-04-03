/**
 * Test Helpers
 * 
 * This utility provides common helper functions for test scenarios.
 */

import { Page, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { RegistrationPage } from '../page-objects/registration.page';
import { AccountsOverviewPage } from '../page-objects/accounts-overview.page';
import { NewAccountPage } from '../page-objects/new-account.page';
import { generateUserData } from './data-generator';

/**
 * Register a new user and return the user data
 */
export async function registerNewUser(page: Page): Promise<{
    username: string;
    password: string;
    [key: string]: string;
}> {
    const registrationPage = new RegistrationPage(page);
    const userData = generateUserData();
    
    console.log(`Attempting to register user with username: ${userData.username}`);
    
    await registrationPage.goto();
    const isSuccessful = await registrationPage.registerUser(userData);
    
    // Verify registration was successful
    expect(isSuccessful, `User registration should be successful for username: ${userData.username}`).toBeTruthy();
    
    return userData;
}

/**
 * Login with the given credentials
 */
export async function loginUser(page: Page, username: string, password: string): Promise<void> {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(username, password);
    
    // Verify login was successful
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn, 'User should be logged in successfully').toBeTruthy();
}

/**
 * Create a new account of the specified type
 */
export async function createNewAccount(
    page: Page, 
    accountType: 'CHECKING' | 'SAVINGS',
    fromAccountId?: string
): Promise<string> {
    const accountsPage = new AccountsOverviewPage(page);
    
    // Get the first account ID if none is provided
    if (!fromAccountId) {
        await accountsPage.goto();
        const accountIds = await accountsPage.getAccountIds();
        expect(accountIds.length, 'User should have at least one account').toBeGreaterThan(0);
        fromAccountId = accountIds[0];
    }
    
    const newAccountPage = new NewAccountPage(page);
    
    await newAccountPage.goto();
    const accountId = await newAccountPage.openNewAccount(accountType, fromAccountId);
    
    // Verify account was created
    const isCreated = await newAccountPage.isAccountCreated();
    expect(isCreated, 'Account should be created successfully').toBeTruthy();
    expect(accountId, 'Account ID should be returned').toBeTruthy();
    
    return accountId;
}

/**
 * Wait for a specific amount of time (use sparingly)
 */
export async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function until it succeeds or times out
 */
export async function retry<T>(
    fn: () => Promise<T>, 
    options: { 
        retries?: number, 
        delay?: number,
        errorMessage?: string
    } = {}
): Promise<T> {
    const { retries = 3, delay = 1000, errorMessage = 'Function failed after multiple retries' } = options;
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            await wait(delay);
        }
    }
    
    throw new Error(`${errorMessage}: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Format a currency amount (e.g., $1,234.56)
 */
export function formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

/**
 * Parse a currency string to a number
 */
export function parseCurrency(currency: string): number {
    return parseFloat(currency.replace(/[$,]/g, ''));
}

/**
 * Verify that all navigation links work correctly
 */
export async function verifyNavigation(page: Page): Promise<void> {
    // Define the navigation links and their expected URLs
    const navLinks = [
        { name: 'home', url: '/parabank/index.htm' },
        { name: 'about', url: '/parabank/about.htm' },
        { name: 'contact', url: '/parabank/contact.htm' },
        { name: 'Open New Account', url: '/parabank/openaccount.htm' },
        { name: 'Accounts Overview', url: '/parabank/overview.htm' },
        { name: 'Transfer Funds', url: '/parabank/transfer.htm' },
        { name: 'Bill Pay', url: '/parabank/billpay.htm' },
        { name: 'Find Transactions', url: '/parabank/findtrans.htm' },
        { name: 'Update Contact Info', url: '/parabank/updateprofile.htm' },
        { name: 'Request Loan', url: '/parabank/requestloan.htm' },
        { name: 'Log Out', url: '/parabank/logout.htm' }
    ];
    
    for (const link of navLinks) {
        if (link.name === 'Log Out') {
            // Skip logout for now as it would end the session
            continue;
        }
        
        // Click the link
        await page.getByRole('link', { name: link.name }).click();
        
        // Verify navigation
        await expect(page).toHaveURL(new RegExp(link.url));
    }
} 