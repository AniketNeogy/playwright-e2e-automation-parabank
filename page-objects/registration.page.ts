import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RegistrationPage extends BasePage {
    // Registration form elements
    private readonly firstNameInput = 'input[id="customer.firstName"]';
    private readonly lastNameInput = 'input[id="customer.lastName"]';
    private readonly addressInput = 'input[id="customer.address.street"]';
    private readonly cityInput = 'input[id="customer.address.city"]';
    private readonly stateInput = 'input[id="customer.address.state"]';
    private readonly zipCodeInput = 'input[id="customer.address.zipCode"]';
    private readonly phoneInput = 'input[id="customer.phoneNumber"]';
    private readonly ssnInput = 'input[id="customer.ssn"]';
    private readonly usernameInput = 'input[id="customer.username"]';
    private readonly passwordInput = 'input[id="customer.password"]';
    private readonly confirmPasswordInput = 'input[id="repeatedPassword"]';
    private readonly registerButton = 'input[value="Register"]';
    
    // Result elements
    private readonly successMessage = 'div#rightPanel h1';
    private readonly errorMessages = 'span.error';

    /**
     * Navigate to the registration page
     */
    async goto() {
        await super.navigate('parabank/register.htm');
    }

    /**
     * Navigate to the registration page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Fill registration form with user data
     */
    async fillRegistrationForm(userData: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
        ssn: string;
        username: string;
        password: string;
        confirmPassword: string;
    }) {
        await this.locator(this.firstNameInput).fill(userData.firstName);
        await this.locator(this.lastNameInput).fill(userData.lastName);
        await this.locator(this.addressInput).fill(userData.address);
        await this.locator(this.cityInput).fill(userData.city);
        await this.locator(this.stateInput).fill(userData.state);
        await this.locator(this.zipCodeInput).fill(userData.zipCode);
        await this.locator(this.phoneInput).fill(userData.phone);
        await this.locator(this.ssnInput).fill(userData.ssn);
        await this.locator(this.usernameInput).fill(userData.username);
        await this.locator(this.passwordInput).fill(userData.password);
        await this.locator(this.confirmPasswordInput).fill(userData.confirmPassword);
    }

    /**
     * Submit registration form
     */
    async submitRegistration() {
        await this.locator(this.registerButton).click();
        // Wait for navigation to complete after form submission
        await this.waitForNavigation();
    }

    /**
     * Register a new user with the provided data
     */
    async registerUser(userData: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
        ssn: string;
        username: string;
        password: string;
        confirmPassword: string;
    }) {
        await this.fillRegistrationForm(userData);
        await this.submitRegistration();
        
        // Check if registration was successful
        return await this.isRegistrationSuccessful(userData.username);
    }

    /**
     * Check if registration was successful by verifying the welcome message includes the username
     */
    async isRegistrationSuccessful(username?: string): Promise<boolean> {
        try {
            // Wait for the success message element to be visible
            await this.page.waitForSelector(this.successMessage, { state: 'visible', timeout: 10000 });
            
            // Get the text content of the welcome message
            const message = await this.getTextContent(this.successMessage);
            console.log(`Registration result message: ${message}`);
            
            // Check if the message contains 'Welcome'
            const hasWelcome = message.includes('Welcome');
            
            // If username is provided, also check if it contains the username
            if (username && hasWelcome) {
                const includesUsername = message.includes(username);
                if (!includesUsername) {
                    console.log(`Expected username "${username}" in message but not found`);
                }
                return includesUsername;
            }
            
            return hasWelcome;
        } catch (error) {
            console.error('Error while checking registration success:', error);
            return false;
        }
    }

    /**
     * Get registration error messages
     */
    async getErrorMessages(): Promise<string[]> {
        const errors = await this.page.locator(this.errorMessages).all();
        const errorMessages: string[] = [];
        
        for (const error of errors) {
            const text = await error.textContent();
            if (text) {
                errorMessages.push(text);
            }
        }
        
        return errorMessages;
    }
} 