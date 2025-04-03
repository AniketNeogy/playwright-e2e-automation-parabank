import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TransferFundsPage extends BasePage {
    // Base selectors
    private readonly rightPanel = 'div#rightPanel';
    
    // Transfer form elements
    private readonly amountInput = 'input#amount';
    private readonly fromAccountSelect = 'select#fromAccountId';
    private readonly toAccountSelect = 'select#toAccountId';
    private readonly transferButton = 'input[value="Transfer"]';
    
    // Result elements
    private readonly transferCompleteTitle = `${this.rightPanel} h1.title`;
    private readonly transferAmount = `${this.rightPanel} span#amount`;
    private readonly fromAccountId = `${this.rightPanel} span#fromAccountId`;
    private readonly toAccountId = `${this.rightPanel} span#toAccountId`;
    private readonly errorMessage = `${this.rightPanel} p.error`;

    /**
     * Navigate to the transfer funds page
     */
    async goto() {
        await super.navigate('parabank/transfer.htm');
    }

    /**
     * Navigate to the transfer funds page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Set transfer amount
     */
    async setAmount(amount: string | number) {
        await this.locator(this.amountInput).fill(amount.toString());
    }

    /**
     * Select source account
     */
    async selectFromAccount(accountId: string) {
        await this.locator(this.fromAccountSelect).selectOption(accountId);
    }

    /**
     * Select destination account
     */
    async selectToAccount(accountId: string) {
        await this.locator(this.toAccountSelect).selectOption(accountId);
    }

    /**
     * Click transfer button
     */
    async clickTransfer() {
        await this.locator(this.transferButton).click();
        await this.waitForNavigation();
    }

    /**
     * Perform a fund transfer
     */
    async transferFunds(amount: string | number, fromAccountId: string, toAccountId: string) {
        await this.setAmount(amount);
        await this.selectFromAccount(fromAccountId);
        await this.selectToAccount(toAccountId);
        await this.clickTransfer();
    }

    /**
     * Check if transfer was successful
     */
    async isTransferSuccessful(): Promise<boolean> {
        const title = await this.getTextContent(this.transferCompleteTitle);
        return title.includes('Transfer Complete') || false;
    }

    /**
     * Get the transfer details
     */
    async getTransferDetails(): Promise<{
        amount: string;
        fromAccountId: string;
        toAccountId: string;
    }> {
        return {
            amount: await this.getTextContent(this.transferAmount),
            fromAccountId: await this.getTextContent(this.fromAccountId),
            toAccountId: await this.getTextContent(this.toAccountId)
        };
    }

    /**
     * Get error message if transfer failed
     */
    async getErrorMessage(): Promise<string> {
        return await this.getTextContent(this.errorMessage);
    }

    /**
     * Check if error message is displayed
     */
    async hasError(): Promise<boolean> {
        return await this.isVisible(this.errorMessage);
    }
} 