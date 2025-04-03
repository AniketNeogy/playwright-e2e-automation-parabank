import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BillPaymentPage extends BasePage {
    // Base selectors
    private readonly rightPanel = 'div#rightPanel';
    private readonly payeeBase = 'payee';
    
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
    private readonly sendPaymentButton = 'input[value="Send Payment"]';
    
    // Result elements
    private readonly paymentCompleteTitle = `${this.rightPanel} h1.title`;
    private readonly paymentSuccessMessage = `${this.rightPanel} div.ng-scope`;
    private readonly paymentAmount = `${this.rightPanel} span#amount`;
    private readonly errorMessage = `${this.rightPanel} span.error`;

    /**
     * Navigate to the bill payment page
     */
    async goto() {
        await super.navigate('parabank/billpay.htm');
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
        await this.waitForNavigation();
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
    }

    /**
     * Check if payment was successful
     */
    async isPaymentSuccessful(): Promise<boolean> {
        const title = await this.isVisible(this.paymentCompleteTitle);
        const message = await this.getTextContent(this.paymentSuccessMessage);
        return title && message?.includes('successful') || false;
    }

    /**
     * Get payment amount from confirmation
     */
    async getPaymentAmount(): Promise<string> {
        return await this.getTextContent(this.paymentAmount);
    }

    /**
     * Get error message if payment failed
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