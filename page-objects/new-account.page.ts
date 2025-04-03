import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class NewAccountPage extends BasePage {
    // Base selectors
    private readonly rightPanel = 'div#rightPanel';
    
    // New account form elements
    private readonly accountFormContainer = '#openAccountForm';
    private readonly accountTypeSelect = '#type';
    private readonly fromAccountSelect = '#fromAccountId';
    private readonly openAccountButton = 'input.button[value="Open New Account"]';
    
    // Result elements
    private readonly resultContainer = '#openAccountResult';
    private readonly accountOpenedTitle = `${this.resultContainer} h1.title`;
    private readonly newAccountId = `${this.resultContainer} a#newAccountId`;
    
    // Error elements
    private readonly errorContainer = '#openAccountError';
    private readonly errorTitle = `${this.errorContainer} h1.title`;
    private readonly errorMessage = `${this.errorContainer} p.error`;

    /**
     * Navigate to the new account page
     */
    async goto() {
        await super.navigate('parabank/openaccount.htm');
        await this.page.waitForSelector(this.accountFormContainer);
    }

    /**
     * Navigate to the new account page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Select account type (CHECKING or SAVINGS)
     */
    async selectAccountType(accountType: 'CHECKING' | 'SAVINGS') {
        const value = accountType === 'CHECKING' ? '0' : '1';
        await this.locator(this.accountTypeSelect).selectOption(value);
    }

    /**
     * Select account to transfer funds from
     */
    async selectFromAccount(accountId: string) {
        await this.locator(this.fromAccountSelect).selectOption(accountId);
    }

    /**
     * Click the open account button
     */
    async clickOpenAccount() {
        await this.locator(this.openAccountButton).click();
        
        // Wait for either success or error result
        await Promise.race([
            this.page.waitForSelector(`${this.resultContainer}:visible`),
            this.page.waitForSelector(`${this.errorContainer}:visible`)
        ]);
    }

    /**
     * Open a new account with the specified type and funding account
     */
    async openNewAccount(accountType: 'CHECKING' | 'SAVINGS', fromAccountId: string): Promise<string> {
        await this.selectAccountType(accountType);
        console.log(`Selected account type: ${accountType}`);
        
        console.log(`Selected funding account: ${fromAccountId}`);
        await this.selectFromAccount(fromAccountId);
        await this.clickOpenAccount();
        
        // Check if there was an error
        if (await this.hasError()) {
            const errorText = await this.getErrorMessage();
            console.error(`Error opening account: ${errorText}`);
            throw new Error(`Failed to open account: ${errorText}`);
        }
        
        return await this.getNewAccountId();
    }

    /**
     * Get the new account ID after successful account creation
     */
    async getNewAccountId(): Promise<string> {
        await this.page.waitForSelector(`${this.newAccountId}:visible`);
        return await this.getTextContent(this.newAccountId);
    }

    /**
     * Check if account was successfully created
     */
    async isAccountCreated(): Promise<boolean> {
        return await this.isVisible(this.resultContainer);
    }
    
    /**
     * Check if there was an error during account creation
     */
    async hasError(): Promise<boolean> {
        return await this.isVisible(this.errorContainer);
    }
    
    /**
     * Get error message if there was an error
     */
    async getErrorMessage(): Promise<string> {
        if (await this.hasError()) {
            return await this.getTextContent(this.errorMessage);
        }
        return '';
    }
    
    /**
     * Get available account types
     */
    async getAvailableAccountTypes(): Promise<string[]> {
        const options = await this.locator(`${this.accountTypeSelect} option`).all();
        const types: string[] = [];
        
        for (const option of options) {
            const text = await option.textContent();
            if (text) {
                types.push(text.trim());
            }
        }
        
        return types;
    }
    
    /**
     * Get available funding accounts
     */
    async getAvailableFundingAccounts(): Promise<string[]> {
        const options = await this.locator(`${this.fromAccountSelect} option`).all();
        const accounts: string[] = [];
        
        for (const option of options) {
            const text = await option.textContent();
            if (text) {
                accounts.push(text.trim());
            }
        }
        
        return accounts;
    }
    
    /**
     * Click on the new account ID link to view account details
     */
    async clickOnNewAccountId() {
        await this.locator(this.newAccountId).click();
        await this.waitForNavigation();
    }
} 