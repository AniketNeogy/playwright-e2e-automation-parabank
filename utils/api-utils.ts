/**
 * API Utilities
 * 
 * This utility provides functions for working with ParaBank's RESTful APIs.
 */

import { APIRequestContext, request } from '@playwright/test';
import { EnvironmentConfig } from '../env-config/environment.config';

/**
 * API endpoints
 */
export const ApiEndpoints = {
    login: '/login',
    accounts: '/accounts',
    customers: '/customers',
    transactions: '/transactions',
    transfers: '/transfer'
};

/**
 * Create an authenticated API context with the user's credentials
 */
export async function createAuthenticatedContext(
    username: string, 
    password: string
): Promise<APIRequestContext> {
    const context = await request.newContext({
        baseURL: EnvironmentConfig.apiBaseUrl,
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    
    // Store authentication for future requests
    await context.get(`${ApiEndpoints.login}?username=${username}&password=${password}`);
    
    return context;
}

/**
 * Get all accounts for a customer
 */
export async function getAccounts(
    apiContext: APIRequestContext,
    customerId: string
): Promise<any> {
    const response = await apiContext.get(`${ApiEndpoints.customers}/${customerId}${ApiEndpoints.accounts}`);
    
    if (response.ok()) {
        return await response.json();
    } else {
        throw new Error(`Failed to get accounts: ${response.statusText()}`);
    }
}

/**
 * Get account details by ID
 */
export async function getAccountDetails(
    apiContext: APIRequestContext,
    accountId: string
): Promise<any> {
    const response = await apiContext.get(`${ApiEndpoints.accounts}/${accountId}`);
    
    if (response.ok()) {
        return await response.json();
    } else {
        throw new Error(`Failed to get account details: ${response.statusText()}`);
    }
}

/**
 * Get transactions for an account
 */
export async function getTransactions(
    apiContext: APIRequestContext,
    accountId: string
): Promise<any> {
    const response = await apiContext.get(`${ApiEndpoints.accounts}/${accountId}${ApiEndpoints.transactions}`);
    
    if (response.ok()) {
        return await response.json();
    } else {
        throw new Error(`Failed to get transactions: ${response.statusText()}`);
    }
}

/**
 * Find transactions by criteria
 */
export async function findTransactions(
    apiContext: APIRequestContext,
    accountId: string,
    criteria: {
        amount?: string;
        transactionId?: string;
        onDate?: string;
        fromDate?: string;
        toDate?: string;
    }
): Promise<any> {
    const params = new URLSearchParams();
    if (criteria.amount) params.append('amount', criteria.amount);
    if (criteria.transactionId) params.append('transactionId', criteria.transactionId);
    if (criteria.onDate) params.append('onDate', criteria.onDate);
    if (criteria.fromDate) params.append('fromDate', criteria.fromDate);
    if (criteria.toDate) params.append('toDate', criteria.toDate);
    
    const queryString = params.toString();
    const endpoint = `${ApiEndpoints.accounts}/${accountId}${ApiEndpoints.transactions}${queryString ? '?' + queryString : ''}`;
    
    const response = await apiContext.get(endpoint);
    
    if (response.ok()) {
        return await response.json();
    } else {
        throw new Error(`Failed to find transactions: ${response.statusText()}`);
    }
}

/**
 * Create a new account via API
 */
export async function createAccount(
    apiContext: APIRequestContext,
    customerId: string,
    fromAccountId: string,
    accountType: 'CHECKING' | 'SAVINGS'
): Promise<any> {
    const params = new URLSearchParams();
    params.append('customerId', customerId);
    params.append('newAccountType', accountType);
    params.append('fromAccountId', fromAccountId);
    
    const response = await apiContext.post(`${ApiEndpoints.accounts}?${params.toString()}`);
    
    if (response.ok()) {
        return await response.json();
    } else {
        throw new Error(`Failed to create account: ${response.statusText()}`);
    }
}

/**
 * Transfer funds between accounts via API
 */
export async function transferFunds(
    apiContext: APIRequestContext,
    fromAccountId: string,
    toAccountId: string,
    amount: string
): Promise<any> {
    const params = new URLSearchParams();
    params.append('fromAccountId', fromAccountId);
    params.append('toAccountId', toAccountId);
    params.append('amount', amount);
    
    const response = await apiContext.post(`${ApiEndpoints.transfers}?${params.toString()}`);
    
    if (response.ok()) {
        return await response.json();
    } else {
        throw new Error(`Failed to transfer funds: ${response.statusText()}`);
    }
}

/**
 * Helper to validate response schema and properties
 */
export function validateResponseSchema(response: any, requiredProperties: string[]): boolean {
    if (!response || typeof response !== 'object') {
        return false;
    }
    
    for (const prop of requiredProperties) {
        if (!(prop in response)) {
            return false;
        }
    }
    
    return true;
} 