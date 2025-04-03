import { Page, Locator, expect } from '@playwright/test';
import { EnvironmentConfig } from '../env-config/environment.config';

export class BasePage {
    protected readonly page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }
    
    /**
     * Helper method to create a locator from a selector string
     * @param selector The selector string to use
     * @returns Locator object
     */
    protected locator(selector: string): Locator {
        return this.page.locator(selector);
    }
    
    /**
     * Navigate to a specific endpoint
     * @param endpoint The endpoint to navigate to, relative to the base URL
     */
    async navigate(endpoint: string = '/') {
        const url = new URL(endpoint, EnvironmentConfig.baseUrl).toString();
        await this.page.goto(url);
        await expect(this.page).toHaveTitle(/ParaBank/);
    }
    
    /**
     * Wait for navigation to complete
     */
    async waitForNavigation() {
        await this.page.waitForLoadState('networkidle');
    }
    
    /**
     * Check if an element is visible
     * @param selector The selector string or locator
     */
    async isVisible(selector: string | Locator): Promise<boolean> {
        if (typeof selector === 'string') {
            return await this.page.locator(selector).isVisible();
        }
        return await selector.isVisible();
    }
    
    /**
     * Get text content of an element
     * @param selector The selector string or locator
     */
    async getTextContent(selector: string | Locator): Promise<string> {
        if (typeof selector === 'string') {
            return (await this.page.locator(selector).textContent()) || '';
        }
        return (await selector.textContent()) || '';
    }
} 