import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountsOverviewPage extends BasePage {
    // Account overview elements
    private readonly accountsTable = '#accountTable';
    private readonly accountIdLinks = `${this.accountsTable} tbody tr:not(:last-child) td:first-child a`;
    private readonly accountRows = `${this.accountsTable} tbody tr:not(:last-child)`;
    private readonly totalBalanceCell = `${this.accountsTable} tbody tr:last-child td:nth-child(2) b`;
    private readonly welcomeMessage = 'p.smallText';
    private readonly pageTitle = '#rightPanel h1.title';
    
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
        const accountElements = await this.locator(this.accountIdLinks).all();
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
        const accountLink = this.page.locator(`${this.accountsTable} tbody tr td:first-child a:text("${accountId}")`);
        
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
     * Get available amount by account ID
     */
    async getAvailableAmount(accountId: string): Promise<string | null> {
        // Locate the specific account row
        const accountLink = this.page.locator(`${this.accountsTable} tbody tr td:first-child a:text("${accountId}")`);
        
        // Check if the account exists
        if (await accountLink.count() === 0) {
            return null;
        }
        
        // Find the parent row and then the available amount cell
        const row = accountLink.locator('xpath=ancestor::tr');
        const availableCell = row.locator('td:nth-child(3)');
        
        return await availableCell.textContent();
    }

    /**
     * Get total balance
     */
    async getTotalBalance(): Promise<string> {
        const totalElement = this.locator(this.totalBalanceCell);
        const totalText = await totalElement.textContent() || '';
        return totalText.trim();
    }

    /**
     * Click on an account to view details
     */
    async clickOnAccount(accountId: string) {
        await this.locator(`${this.accountsTable} tbody tr td:first-child a:text("${accountId}")`).click();
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
        return await this.locator(this.accountIdLinks).count();
    }

    /**
     * Get the welcome message text
     */
    async getWelcomeMessage(): Promise<string> {
        return await this.getTextContent(this.welcomeMessage);
    }

    /**
     * Get the username from welcome message
     */
    async getLoggedInUsername(): Promise<string> {
        const welcomeText = await this.getWelcomeMessage();
        // Extract the username after "Welcome"
        const match = welcomeText.match(/Welcome\s+(.+)/);
        return match ? match[1].trim() : '';
    }

    /**
     * Get the page title
     */
    async getPageTitle(): Promise<string> {
        return await this.getTextContent(this.pageTitle);
    }

    /**
     * Check if error message is displayed
     */
    async isErrorDisplayed(): Promise<boolean> {
        return await this.isVisible('#showError');
    }

    /**
     * Get error message if displayed
     */
    async getErrorMessage(): Promise<string | null> {
        if (await this.isErrorDisplayed()) {
            return await this.getTextContent('#showError p.error');
        }
        return null;
    }

    /**
     * Get all account information as an array of objects
     */
    async getAllAccountsInfo(): Promise<Array<{id: string, balance: string, availableAmount: string}>> {
        const accountRows = await this.locator(this.accountRows).all();
        const accounts = [];
        
        for (const row of accountRows) {
            const id = await row.locator('td:first-child a').textContent() || '';
            const balance = await row.locator('td:nth-child(2)').textContent() || '';
            const availableAmount = await row.locator('td:nth-child(3)').textContent() || '';
            
            accounts.push({
                id: id.trim(),
                balance: balance.trim(),
                availableAmount: availableAmount.trim()
            });
        }
        
        return accounts;
    }
} 