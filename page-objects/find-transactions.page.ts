import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class FindTransactionsPage extends BasePage {
    // Base selectors
    private readonly formContainer = 'div#rightPanel';
    private readonly criteriaBase = 'criteria';
    
    // Search form elements
    private readonly accountSelect = '#accountId';
    private readonly findByTransactionIdInput = `input[id="${this.criteriaBase}.transactionId"]`;
    private readonly findByDateFromInput = `input[id="${this.criteriaBase}.onDate"]`;
    private readonly findByDateToInput = `input[id="${this.criteriaBase}.toDate"]`;
    private readonly findByAmountInput = `input[id="${this.criteriaBase}.amount"]`;
    private readonly findTransactionsButton = 'button:has-text("Find Transactions")';
    private readonly findByTransactionIdButton = 'button[ng-click*="ID"]';
    private readonly findByDateButton = 'button[ng-click*="DATE"]';
    private readonly findByAmountButton = 'button[ng-click*="AMOUNT"]';
    
    // Results elements
    private readonly transactionsTable = '#transactionTable';
    private readonly transactionRows = `${this.transactionsTable} tr.ng-scope`;
    private readonly noTransactionsMessage = `${this.formContainer} p.ng-scope`;

    /**
     * Navigate to the find transactions page
     */
    async goto() {
        await super.navigate('parabank/findtrans.htm');
    }
    
    /**
     * Navigate to the find transactions page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Select account for transaction search
     */
    async selectAccount(accountId: string) {
        await this.locator(this.accountSelect).selectOption(accountId);
    }

    /**
     * Search by transaction ID
     */
    async searchByTransactionId(transactionId: string) {
        await this.locator(this.findByTransactionIdInput).fill(transactionId);
        await this.locator(this.findByTransactionIdButton).click();
        await this.waitForNavigation();
    }

    /**
     * Search by date range
     */
    async searchByDateRange(fromDate: string, toDate: string) {
        await this.locator(this.findByDateFromInput).fill(fromDate);
        await this.locator(this.findByDateToInput).fill(toDate);
        await this.locator(this.findByDateButton).click();
        await this.waitForNavigation();
    }

    /**
     * Search by amount
     */
    async searchByAmount(amount: string | number) {
        await this.locator(this.findByAmountInput).fill(amount.toString());
        await this.locator(this.findByAmountButton).click();
        await this.waitForNavigation();
    }

    /**
     * Get all transactions displayed in the results
     */
    async getTransactions(): Promise<any[]> {
        if (await this.isVisible(this.noTransactionsMessage)) {
            return [];
        }
        
        const rows = await this.locator(this.transactionRows).all();
        const transactions = [];
        
        for (const row of rows) {
            const date = await row.locator('td:nth-child(1)').textContent();
            const description = await row.locator('td:nth-child(2)').textContent();
            const amount = await row.locator('td:nth-child(3)').textContent();
            
            transactions.push({
                date: date?.trim() || '',
                description: description?.trim() || '',
                amount: amount?.trim() || ''
            });
        }
        
        return transactions;
    }

    /**
     * Check if any transactions were found
     */
    async hasTransactions(): Promise<boolean> {
        return await this.isVisible(this.transactionsTable) && (await this.locator(this.transactionRows).count()) > 0;
    }
} 