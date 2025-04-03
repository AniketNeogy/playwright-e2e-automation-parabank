/**
 * Data Generator Utility
 * 
 * This utility provides functions to generate random test data for the ParaBank application.
 */

import { faker } from '@faker-js/faker';

/**
 * Generate a random username with a timestamp to ensure uniqueness
 */
export function generateUniqueUsername(prefix: string = 'user'): string {
    //generate uuid string
    const uuid = new Date().getTime().toString().substring(4, 8);
    return `${prefix}_${uuid}_${"aniket"}`;
}

/**
 * Generate a random email address
 */
export function generateEmail(username?: string): string {
    if (username) {
        return `${username}@${faker.internet.domainName()}`;
    }
    return faker.internet.email();
}

/**
 * Generate a random US phone number
 */
export function generatePhoneNumber(): string {
    // Generate a phone number in the format XXX-XXX-XXXX
    const areaCode = faker.number.int({ min: 100, max: 999 });
    const prefix = faker.number.int({ min: 100, max: 999 });
    const lineNumber = faker.number.int({ min: 1000, max: 9999 });
    return `${areaCode}-${prefix}-${lineNumber}`;
}

/**
 * Generate a random SSN (Social Security Number)
 */
export function generateSSN(): string {
    return faker.number.int({ min: 100, max: 999 }) + '-' + 
           faker.number.int({ min: 10, max: 99 }) + '-' + 
           faker.number.int({ min: 1000, max: 9999 });
}

/**
 * Generate a random US address
 */
export function generateAddress(): {
    street: string;
    city: string;
    state: string;
    zipCode: string;
} {
    return {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode('#####')
    };
}

/**
 * Generate a random amount of money (in dollars)
 */
export function generateAmount(min: number = 10, max: number = 1000): string {
    return faker.number.float({ min, max, fractionDigits: 2 }).toFixed(2);
}

/**
 * Generate complete user registration data
 */
export function generateUserData(customUsername?: string): {
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
} {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const address = generateAddress();
    // Generate a unique username with timestamp to avoid conflicts
    const username = customUsername || generateUniqueUsername(`${firstName.toLowerCase()}`);
    const password = 'Password123'; // Fixed password for testing simplicity
    
    return {
        firstName,
        lastName,
        address: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: generatePhoneNumber(),
        ssn: generateSSN(),
        username,
        password,
        confirmPassword: password
    };
}

/**
 * Generate data for bill payment
 */
export function generatePayeeData(): {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    account: string;
} {
    const name = faker.company.name();
    const address = generateAddress();
    
    return {
        name,
        address: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: generatePhoneNumber(),
        account: `AC${faker.number.int({ min: 1000000, max: 9999999 })}`
    };
}

/**
 * Generate a random date string in MM/DD/YYYY format
 */
export function generateDate(minDaysAgo: number = 1, maxDaysAgo: number = 30): string {
    const date = faker.date.recent({ days: maxDaysAgo });
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
} 