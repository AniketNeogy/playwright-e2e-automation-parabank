import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BillPaymentPage extends BasePage {
    // Base selectors
    private readonly rightPanel = 'div#rightPanel';
    private readonly payeeBase = 'payee';
    
    // Form container
    private readonly billPayForm = '#billpayForm';
    
    // Payee information elements
    private readonly payeeNameInput = `input[name="${this.payeeBase}.name"]`;
    private readonly addressInput = `input[name="${this.payeeBase}.address.street"]`;
    private readonly cityInput = `input[name="${this.payeeBase}.address.city"]`;
    private readonly stateInput = `input[name="${this.payeeBase}.address.state"]`;
    private readonly zipCodeInput = `input[name="${this.payeeBase}.address.zipCode"]`;
    private readonly phoneInput = `input[name="${this.payeeBase}.phoneNumber"]`;
    private readonly accountInput = `input[name="${this.payeeBase}.accountNumber"]`;
    private readonly verifyAccountInput = 'input[name="verifyAccount"]';
    private readonly amountInput = 'input[name="amount"]';
    private readonly fromAccountSelect = 'select[name="fromAccountId"]';
    private readonly sendPaymentButton = 'input.button[value="Send Payment"]';
    
    // Result elements
    private readonly resultContainer = '#billpayResult';
    private readonly paymentCompleteTitle = `${this.resultContainer} h1.title`;
    private readonly payeeName = `${this.resultContainer} #payeeName`;
    private readonly paymentAmount = `${this.resultContainer} #amount`;
    private readonly fromAccountId = `${this.resultContainer} #fromAccountId`;
    
    // Error elements
    private readonly errorContainer = '#billpayError';
    private readonly errorTitle = `${this.errorContainer} h1.title`;
    private readonly errorMessage = `${this.errorContainer} p.error`;
    
    // Validation error selectors
    private readonly validationErrors = '[id^=validationModel]:visible';
    private readonly nameValidationError = '#validationModel-name';
    private readonly addressValidationError = '#validationModel-address';
    private readonly cityValidationError = '#validationModel-city';
    private readonly stateValidationError = '#validationModel-state';
    private readonly zipCodeValidationError = '#validationModel-zipCode';
    private readonly phoneValidationError = '#validationModel-phoneNumber';
    private readonly accountEmptyError = '#validationModel-account-empty';
    private readonly accountInvalidError = '#validationModel-account-invalid';
    private readonly verifyAccountEmptyError = '#validationModel-verifyAccount-empty';
    private readonly verifyAccountInvalidError = '#validationModel-verifyAccount-invalid';
    private readonly verifyAccountMismatchError = '#validationModel-verifyAccount-mismatch';
    private readonly amountEmptyError = '#validationModel-amount-empty';
    private readonly amountInvalidError = '#validationModel-amount-invalid';

    /**
     * Navigate to the bill payment page
     */
    async goto() {
        await super.navigate('parabank/billpay.htm');
        await this.page.waitForSelector(this.billPayForm);
    }

    /**
     * Navigate to the bill payment page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Fill payee information
     */
    async fillPayeeInformation(payeeInfo: {
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
        account: string;
    }) {
        await this.locator(this.payeeNameInput).fill(payeeInfo.name);
        await this.locator(this.addressInput).fill(payeeInfo.address);
        await this.locator(this.cityInput).fill(payeeInfo.city);
        await this.locator(this.stateInput).fill(payeeInfo.state);
        await this.locator(this.zipCodeInput).fill(payeeInfo.zipCode);
        await this.locator(this.phoneInput).fill(payeeInfo.phone);
        await this.locator(this.accountInput).fill(payeeInfo.account);
        await this.locator(this.verifyAccountInput).fill(payeeInfo.account);
    }

    /**
     * Set payment amount
     */
    async setAmount(amount: string | number) {
        await this.locator(this.amountInput).fill(amount.toString());
    }

    /**
     * Select account to pay from
     */
    async selectFromAccount(accountId: string) {
        await this.locator(this.fromAccountSelect).selectOption(accountId);
    }

    /**
     * Click send payment button
     */
    async clickSendPayment() {
        await this.locator(this.sendPaymentButton).click();
        
        // Wait for either success or error result
        await Promise.race([
            this.page.waitForSelector(`${this.resultContainer}:visible`),
            this.page.waitForSelector(`${this.errorContainer}:visible`),
            this.page.waitForSelector(this.validationErrors)
        ]);
    }

    /**
     * Make a bill payment
     */
    async makePayment(
        payeeInfo: {
            name: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            phone: string;
            account: string;
        },
        amount: string | number,
        fromAccountId: string
    ) {
        await this.fillPayeeInformation(payeeInfo);
        await this.setAmount(amount);
        await this.selectFromAccount(fromAccountId);
        await this.clickSendPayment();
        
        // Check if there was an error or validation issue
        if (await this.hasError()) {
            const errorText = await this.getErrorMessage();
            console.error(`Error making payment: ${errorText}`);
            throw new Error(`Failed to make payment: ${errorText}`);
        }
        
        if (await this.hasValidationErrors()) {
            const validationErrors = await this.getValidationErrors();
            console.error(`Validation errors: ${validationErrors.join(', ')}`);
            throw new Error(`Payment validation failed: ${validationErrors.join(', ')}`);
        }
    }

    /**
     * Check if payment was successful
     */
    async isPaymentSuccessful(): Promise<boolean> {
        return await this.isVisible(this.resultContainer);
    }

    /**
     * Get payment amount from confirmation
     */
    async getPaymentAmount(): Promise<string> {
        return await this.getTextContent(this.paymentAmount);
    }
    
    /**
     * Get payee name from confirmation
     */
    async getPayeeName(): Promise<string> {
        return await this.getTextContent(this.payeeName);
    }
    
    /**
     * Get from account ID from confirmation
     */
    async getFromAccountId(): Promise<string> {
        return await this.getTextContent(this.fromAccountId);
    }

    /**
     * Check if error message is displayed
     */
    async hasError(): Promise<boolean> {
        return await this.isVisible(this.errorContainer);
    }
    
    /**
     * Get error message if payment failed
     */
    async getErrorMessage(): Promise<string> {
        if (await this.hasError()) {
            return await this.getTextContent(this.errorMessage);
        }
        return '';
    }

    /**
     * Check if validation errors are displayed
     */
    async hasValidationErrors(): Promise<boolean> {
        const errorCount = await this.page.$$eval('[id^=validationModel]', 
            elements => elements.filter(el => window.getComputedStyle(el).display !== 'none').length);
        return errorCount > 0;
    }
    
    /**
     * Get all validation error messages
     */
    async getValidationErrors(): Promise<string[]> {
        const errors = await this.page.$$eval('[id^=validationModel]', 
            elements => elements
                .filter(el => window.getComputedStyle(el).display !== 'none')
                .map(el => el.textContent));
        return errors.filter(error => error !== null) as string[];
    }
    
    /**
     * Check if specific validation error is displayed
     */
    async hasValidationError(fieldName: string): Promise<boolean> {
        const selector = this.getValidationSelector(fieldName);
        if (!selector) return false;
        
        return await this.page.$eval(selector, 
            el => window.getComputedStyle(el).display !== 'none');
    }
    
    /**
     * Get validation selector for a field
     */
    private getValidationSelector(fieldName: string): string | null {
        switch (fieldName) {
            case 'name': return this.nameValidationError;
            case 'address': return this.addressValidationError;
            case 'city': return this.cityValidationError;
            case 'state': return this.stateValidationError;
            case 'zipCode': return this.zipCodeValidationError;
            case 'phone': return this.phoneValidationError;
            case 'account': return this.accountEmptyError;
            case 'accountInvalid': return this.accountInvalidError;
            case 'verifyAccount': return this.verifyAccountEmptyError;
            case 'verifyAccountInvalid': return this.verifyAccountInvalidError;
            case 'verifyAccountMismatch': return this.verifyAccountMismatchError;
            case 'amount': return this.amountEmptyError;
            case 'amountInvalid': return this.amountInvalidError;
            default: return null;
        }
    }
    
    /**
     * Get available accounts for payment
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