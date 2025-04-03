/**
 * Type Definitions
 * 
 * This file contains type definitions for the ParaBank application.
 */

/**
 * User registration data
 */
export interface UserData {
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
    [key: string]: string;
}

/**
 * Account information
 */
export interface Account {
    id: string;
    customerId?: string;
    type?: string;
    balance?: string;
}

/**
 * Transaction information
 */
export interface Transaction {
    id?: string;
    date: string;
    description: string;
    amount: string;
    type?: string;
}

/**
 * Payee information for bill payment
 */
export interface PayeeData {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    account: string;
}

/**
 * API Response Interfaces
 */

/**
 * Account API response
 */
export interface AccountResponse {
    id: number;
    customerId: number;
    type: string;
    balance: number;
}

/**
 * Transaction API response
 */
export interface TransactionResponse {
    id: number;
    accountId: number;
    type: string;
    date: string;
    amount: number;
    description: string;
}

/**
 * Customer API response
 */
export interface CustomerResponse {
    id: number;
    firstName: string;
    lastName: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    phoneNumber: string;
    ssn: string;
    username: string;
    accounts: AccountResponse[];
} 