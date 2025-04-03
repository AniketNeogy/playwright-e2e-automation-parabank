import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    // Login form elements
    private readonly usernameInput = 'input[name="username"]';
    private readonly passwordInput = 'input[name="password"]';
    private readonly loginButton = 'input[value="Log In"]';
    private readonly forgotLoginInfoLink = 'text=Forgot login info?';
    private readonly registerLink = 'text=Register';
    private readonly errorMessage = '.error';
    
    // Navigation elements
    private readonly logoutLink = 'text=Log Out';
    private readonly homeLink = 'a:has-text("home")';
    private readonly aboutLink = 'a:has-text("about")';
    private readonly contactLink = 'a:has-text("contact")';

    /**
     * Navigate to the login page
     */
    async goto() {
        await super.navigate('/');
    }

    /**
     * Navigate to the login page - alias for goto() for consistency
     */
    async navigate() {
        await this.goto();
    }

    /**
     * Login with the provided credentials
     * @param username 
     * @param password 
     */
    async login(username: string, password: string) {
        await this.locator(this.usernameInput).fill(username);
        await this.locator(this.passwordInput).fill(password);
        await this.locator(this.loginButton).click();
        await this.waitForNavigation();
    }

    /**
     * Navigate to the registration page
     */
    async navigateToRegistration() {
        await this.locator(this.registerLink).click();
        await this.waitForNavigation();
    }

    /**
     * Check if user is logged in
     */
    async isLoggedIn(): Promise<boolean> {
        return await this.isVisible(this.logoutLink);
    }
    
    /**
     * Check if login error is displayed
     */
    async hasLoginError(): Promise<boolean> {
        return await this.isVisible(this.errorMessage);
    }
    
    /**
     * Get login error message text
     */
    async getErrorMessage(): Promise<string> {
        return await this.getTextContent(this.errorMessage);
    }
} 