import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TransferFundsPage extends BasePage {
    // Base selectors
    private readonly rightPanel = 'div#rightPanel';
    
    // Form containers
    private readonly formContainer = '#showForm';
    private readonly resultContainer = '#showResult';
    private readonly errorContainer = '#showError';
    
    // Transfer form elements
    private readonly transferForm = '#transferForm';
    private readonly amountInput = 'input#amount';
    private readonly fromAccountSelect = 'select#fromAccountId';
    private readonly toAccountSelect = 'select#toAccountId';
    private readonly transferButton = 'input[value="Transfer"]';
    private readonly amountError = 'p#amount\\.errors';
    
    // Result elements
    private readonly transferCompleteTitle = `${this.resultContainer} h1.title`;
    private readonly transferAmount = `${this.resultContainer} span#amountResult`;
    private readonly fromAccountId = `${this.resultContainer} span#fromAccountIdResult`;
    private readonly toAccountId = `${this.resultContainer} span#toAccountIdResult`;
    
    // Error elements
    private readonly errorTitle = `${this.errorContainer} h1.title`;
    private readonly errorMessage = `${this.errorContainer} p.error`;

    /**
     * Navigate to the transfer funds page
     */
    async goto() {
        await super.navigate('parabank/transfer.htm');
        await this.page.waitForSelector(this.formContainer);
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
     * Submit the transfer form
     */
    async submitTransfer() {
        await this.locator(this.transferForm).evaluate(form => {
            const submitEvent = new Event('submit');
            form.dispatchEvent(submitEvent);
        });
        
        // Wait for either success or error result
        await Promise.race([
            this.page.waitForSelector(`${this.resultContainer}:visible`),
            this.page.waitForSelector(`${this.errorContainer}:visible`),
            this.page.waitForSelector(`${this.amountError}:visible`)
        ]);
    }

    /**
     * Click transfer button (alternative to form submission)
     */
    async clickTransfer() {
        await this.locator(this.transferButton).click();
        
        // Wait for either success or error result
        await Promise.race([
            this.page.waitForSelector(`${this.resultContainer}:visible`),
            this.page.waitForSelector(`${this.errorContainer}:visible`),
            this.page.waitForSelector(`${this.amountError}:visible`)
        ]);
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
        return await this.isVisible(this.resultContainer);
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
     * Check if error message is displayed
     */
    async hasError(): Promise<boolean> {
        return await this.isVisible(this.errorContainer);
    }
    
    /**
     * Get error message if transfer failed
     */
    async getErrorMessage(): Promise<string> {
        if (await this.hasError()) {
            return await this.getTextContent(this.errorMessage);
        }
        return '';
    }
    
    /**
     * Check if validation error is displayed
     */
    async hasValidationError(): Promise<boolean> {
        return await this.isVisible(this.amountError);
    }
    
    /**
     * Get validation error message
     */
    async getValidationErrorMessage(): Promise<string> {
        if (await this.hasValidationError()) {
            return await this.getTextContent(this.amountError);
        }
        return '';
    }
    
    /**
     * Get all available accounts
     */
    async getAvailableAccounts(): Promise<string[]> {
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
} 