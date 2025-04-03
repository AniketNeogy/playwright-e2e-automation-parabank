/**
 * Authentication Tests
 * 
 * This file contains test scenarios for user registration and login functionality.
 */

import { expect, Page } from '@playwright/test';
import { test } from '../utils/global-setup';
import { LoginPage } from '../page-objects/login.page';
import { RegistrationPage } from '../page-objects/registration.page';
import { generateUserData } from '../utils/data-generator';

// Store user data for use across tests
interface TestUser {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

// Sequential tests for registration and login as we need to create a user first
test.describe.serial('User Registration and Login Flow', () => {
    let userData: TestUser;

    test('User Registration - Create a new user with random credentials', async ({ page }) => {
        // Increase timeout for this test
        test.setTimeout(120000);
        
        // Arrange
        console.log('Starting user registration test');
        const registrationPage = new RegistrationPage(page);
        
        const generatedUser = generateUserData();
        console.log(`Generated username: ${generatedUser.username}`);
        
        userData = {
            username: generatedUser.username,
            password: generatedUser.password,
            firstName: generatedUser.firstName,
            lastName: generatedUser.lastName
        };
        
        console.log(`Test data: Username=${userData.username}, Password=${userData.password}`);
        
        // Act
        await registrationPage.goto();
        console.log('Navigated to registration page');
        
        await page.waitForLoadState('networkidle');
        console.log('Page loaded');
        
        console.log(`Page title: ${await page.title()}`);
        
        await registrationPage.fillRegistrationForm(generatedUser);
        console.log('Filled registration form');
        
        await registrationPage.submitRegistration();
        console.log('Submitted registration form');
        
        const welcomeLocator = page.locator('div#rightPanel h1');
        await welcomeLocator.waitFor({ state: 'visible', timeout: 30000 });
        
        // Assert
        const welcomeMessage = await welcomeLocator.textContent();
        console.log(`Welcome message: ${welcomeMessage}`);
        
        const isSuccessful = await registrationPage.isRegistrationSuccessful(userData.username);
        expect(isSuccessful, `User registration should be successful for username: ${userData.username}`).toBeTruthy();
        console.log('Registration successful');
    });
    
    test('User Login - Login with the newly created user', async ({ page }) => {
        // This test depends on the previous test having run
        test.skip(!userData, 'This test depends on a successfully registered user');
        
        // Arrange
        console.log('Starting user login test');
        const loginPage = new LoginPage(page);
        
        // Act
        await loginPage.goto();
        console.log('Navigated to login page');
        
        await loginPage.login(userData.username, userData.password);
        console.log(`Logged in with username: ${userData.username}`);
        
        // Assert
        const isLoggedIn = await loginPage.isLoggedIn();
        expect(isLoggedIn, 'User should be logged in successfully').toBeTruthy();
        console.log('Login successful');
        
        expect(page.url()).toContain('overview.htm');
        console.log(`Current URL: ${page.url()}`);
    });
});


test.describe('Registration page - Negative Tests', () => {
    test('Should display error when attempting to register with an existing username', async ({ page }) => {
        // Arrange - First create a user that we'll try to duplicate
        const registrationPage = new RegistrationPage(page);
        const userData = generateUserData();
        const username = userData.username;
        
        console.log(`Creating initial user with username: ${username}`);
        
        await registrationPage.goto();
        await registrationPage.fillRegistrationForm(userData);
        await registrationPage.submitRegistration();
        
        console.log('Attempting to register with the same username again');
        await registrationPage.goto();
        await registrationPage.fillRegistrationForm({
            ...generateUserData(), // New user data
            username: username // But same username
        });
        await registrationPage.submitRegistration();
        
        // Assert - Should show username already exists error
        const errorMessages = await registrationPage.getErrorMessages();
        expect(errorMessages[0]).toEqual('This username already exists.');
    });
    
    test('Should display error when passwords do not match', async ({ page }) => {
        // Arrange
        const registrationPage = new RegistrationPage(page);
        const userData = generateUserData();
        
        // Act - Modify the userData to have mismatched passwords
        userData.confirmPassword = 'DifferentPassword123';
        
        await registrationPage.goto();
        await registrationPage.fillRegistrationForm(userData);
        await registrationPage.submitRegistration();
        
        // Assert - Should show password mismatch error
        const errorMessages = await registrationPage.getErrorMessages();
        expect(errorMessages[0]).toEqual('Passwords did not match.');
    });
    
    test('Should display errors when required fields are missing', async ({ page }) => {
        // Arrange
        const registrationPage = new RegistrationPage(page);
        
        // Act - Submit form with no data filled in
        await registrationPage.goto();
        await registrationPage.submitRegistration();
        
        // Assert - Should show required field errors
        const errorMessages = await registrationPage.getErrorMessages();
        expect(errorMessages.length).toBe(10);
        expect(errorMessages.some(msg => msg.includes('required')), 
            'At least one error message about required fields should be displayed').toBeTruthy();
    });
});

test.describe('Login page -Negative Tests', () => {

    test('Login with invalid credentials', async ({ page }) => {
        // Arrange
        console.log('Starting invalid login test');
        const loginPage = new LoginPage(page);
        const invalidUsername = 'invalid_user';
        const invalidPassword = 'invalid_password';
        
        // Act
        await loginPage.goto();
        console.log('Navigated to login page');
        
        await loginPage.login(invalidUsername, invalidPassword);
        console.log('Attempted login with invalid credentials');
        
        // Assert
        const hasError = await loginPage.hasLoginError();
        expect(hasError, 'Error message should be displayed for invalid login').toBeTruthy();
        console.log('Error message displayed as expected');
        
        const errorMessage = await loginPage.getErrorMessage();
        console.log(`Error message: ${errorMessage}`);
        
        expect(errorMessage).toEqual('The username and password could not be verified.');
        console.log('Error message content verified');
    });

    test('Login with empty credentials should display error', async ({ page }) => {
        // Arrange
        const loginPage = new LoginPage(page);
        
        // Act - Login with empty username and password
        await loginPage.goto();
        await loginPage.login('', '');
        
        // Assert
        const hasError = await loginPage.hasLoginError();
        expect(hasError, 'Error message should be displayed for empty credentials').toBeTruthy();
        
        const errorMessage = await loginPage.getErrorMessage();
        console.log(`Error message for empty credentials: ${errorMessage}`);
        
        expect(errorMessage).toEqual('Please enter a username and password.');
        console.log('Error message content verified');
    });
    
    test('Login with empty username should display error', async ({ page }) => {
        // Arrange
        const loginPage = new LoginPage(page);
        
        // Act - Login with empty username but valid password
        await loginPage.goto();
        await loginPage.login('', 'Password123');
        
        // Assert
        const hasError = await loginPage.hasLoginError();
        expect(hasError, 'Error message should be displayed for empty username').toBeTruthy();
        
        const errorMessage = await loginPage.getErrorMessage();
        console.log(`Error message for empty username: ${errorMessage}`);
        
        expect(errorMessage).toEqual('Please enter a username and password.');
        console.log('Error message content verified');
    });
    
    test('Login with empty password should display error', async ({ page }) => {
        // Arrange
        const loginPage = new LoginPage(page);
        
        // Act - Login with valid username but empty password
        await loginPage.goto();
        await loginPage.login('validUsername', '');
        
        // Assert
        const hasError = await loginPage.hasLoginError();
        expect(hasError, 'Error message should be displayed for empty password').toBeTruthy();
        
        const errorMessage = await loginPage.getErrorMessage();
        console.log(`Error message for empty password: ${errorMessage}`);
       
        expect(errorMessage).toEqual('Please enter a username and password.');
        console.log('Error message content verified');
    });

});