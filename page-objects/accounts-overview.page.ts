import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountsOverviewPage extends BasePage {
    // Account overview elements
    private readonly accountsTable = '#accountTable';
    private readonly accountRows = `${this.accountsTable} tr.ng-scope`;
    private readonly accountIds = `${this.accountsTable} tr.ng-scope td:nth-child(1) a`;
    private readonly accountBalances = `${this.accountsTable} tr.ng-scope td:nth-child(2)`;
    private readonly totalBalance = 'div#rightPanel h1.ng-binding';
    
    /**
     * Navigate to the accounts overview page
     */
    async goto() {
        await super.navigate('parabank/overview.htm');
        await this.page.waitForSelector(this.accountsTable);
    }

    /**
     * Navigate to the accounts overview page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Get all account IDs
     */
    async getAccountIds(): Promise<string[]> {
        const accountElements = await this.locator(this.accountIds).all();
        const accountIds: string[] = [];
        
        for (const account of accountElements) {
            const text = await account.textContent();
            if (text) {
                accountIds.push(text.trim());
            }
        }
        
        return accountIds;
    }

    /**
     * Get account balance by account ID
     */
    async getAccountBalance(accountId: string): Promise<string | null> {
        // Locate the specific account row
        const accountLink = this.page.locator(`${this.accountsTable} a:text("${accountId}")`);
        
        // Check if the account exists
        if (await accountLink.count() === 0) {
            return null;
        }
        
        // Find the parent row and then the balance cell
        const row = accountLink.locator('xpath=ancestor::tr');
        const balanceCell = row.locator('td:nth-child(2)');
        
        return await balanceCell.textContent();
    }

    /**
     * Get total balance
     */
    async getTotalBalance(): Promise<string> {
        const totalText = await this.getTextContent(this.totalBalance);
        // Extract the balance amount from text like "$1,234.56"
        const match = totalText.match(/\$[\d,.]+/);
        return match ? match[0] : '';
    }

    /**
     * Click on an account to view details
     */
    async clickOnAccount(accountId: string) {
        await this.locator(`${this.accountsTable} a:text("${accountId}")`).click();
        await this.waitForNavigation();
    }

    /**
     * Check if accounts table is displayed
     */
    async isAccountsTableDisplayed(): Promise<boolean> {
        return await this.isVisible(this.accountsTable);
    }
    
    /**
     * Get number of accounts
     */
    async getNumberOfAccounts(): Promise<number> {
        return await this.locator(this.accountRows).count();
    }
} 