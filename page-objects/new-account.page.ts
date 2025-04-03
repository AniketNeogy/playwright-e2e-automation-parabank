import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class NewAccountPage extends BasePage {
    // Base selectors
    private readonly rightPanel = 'div#rightPanel';
    
    // New account form elements
    private readonly accountTypeSelect = '#type';
    private readonly fromAccountSelect = '#fromAccountId';
    private readonly openAccountButton = 'input[value="Open New Account"]';
    
    // Result elements
    private readonly accountOpenedTitle = `${this.rightPanel} h1.title`;
    private readonly newAccountId = `${this.rightPanel} a#newAccountId`;

    /**
     * Navigate to the new account page
     */
    async goto() {
        await super.navigate('parabank/openaccount.htm');
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
        await this.locator(this.accountTypeSelect).selectOption(accountType);
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
        // Wait for the account to be created
        await this.page.waitForSelector(this.accountOpenedTitle);
    }

    /**
     * Open a new account with the specified type and funding account
     */
    async openNewAccount(accountType: 'CHECKING' | 'SAVINGS', fromAccountId: string): Promise<string> {
        await this.selectAccountType(accountType);
        await this.selectFromAccount(fromAccountId);
        await this.clickOpenAccount();
        
        return await this.getNewAccountId();
    }

    /**
     * Get the new account ID after successful account creation
     */
    async getNewAccountId(): Promise<string> {
        await this.page.waitForSelector(this.newAccountId);
        return await this.getTextContent(this.newAccountId);
    }

    /**
     * Check if account was successfully created
     */
    async isAccountCreated(): Promise<boolean> {
        const title = await this.getTextContent(this.accountOpenedTitle);
        return title.includes('Account Opened!') || false;
    }
    
    /**
     * Click on the new account ID link to view account details
     */
    async clickOnNewAccountId() {
        await this.locator(this.newAccountId).click();
        await this.waitForNavigation();
    }
} 