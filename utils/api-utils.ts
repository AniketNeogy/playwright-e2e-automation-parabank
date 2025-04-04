import { APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://parabank.parasoft.com/parabank/services_proxy/bank';

export class ApiUtils {
    private request: APIRequestContext;
    private sessionId: string = '';

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    /**
     * Set the session ID directly
     * @param sessionId Session ID in the format 'JSESSIONID=value'
     */
    setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }

    async getAccounts(customerId: number, accountId: number): Promise<number> {
        const response = await this.request.get(`${BASE_URL}/customers/${customerId}/accounts/${accountId}`, {
            headers: {
                'Cookie': this.sessionId,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }
        });
        const data = await response.json();
        return data.id;
    }

    async getAllAccounts(customerId: number): Promise<Array<{id: number, type?: string, balance?: number}>> {
        const response = await this.request.get(`${BASE_URL}/customers/${customerId}/accounts`, {
            headers: {
                'Cookie': this.sessionId,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }
        });
        return await response.json();
    }

    async createAccount(customerId: number, fromAccountId: number, accountType: 'CHECKING' | 'SAVINGS'): Promise<{id: number}> {
        const accountTypeId = accountType === 'CHECKING' ? 0 : 1;
        const response = await this.request.post(`${BASE_URL}/createAccount?customerId=${customerId}&newAccountType=${accountTypeId}&fromAccountId=${fromAccountId}`, {
            headers: { 'Cookie': this.sessionId }
        });
        const data = await response.json();
        return { id: data.id };
    }

    async transferFunds(fromAccountId: number, toAccountId: number, amount: number) {
        const url = `${BASE_URL}/transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}`;
        const response = await this.request.post(url, {
            headers: { 'Cookie': this.sessionId }
        });
        
        return await response.text();
    }

    async findTransaction(accountId: number, amount: number) {
        const response = await this.request.get(`${BASE_URL}/accounts/${accountId}/transactions/amount/${amount}?timeout=30000`, {
            headers: { 'Cookie': this.sessionId }
        });
        return await response.json();
    }

    async login(username: string, password: string): Promise<{id: number, customerId: number}> {
        // Get the session ID by posting to the login form
        const loginResponse = await this.request.post('https://parabank.parasoft.com/parabank/login.htm', {
            form: {
                username,
                password
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!loginResponse.ok()) {
            throw new Error(`Login failed with status: ${loginResponse.status()}`);
        }
        
        // Extract the session ID from cookies
        const cookies = loginResponse.headers()['set-cookie'];
        if (cookies) {
            const match = cookies.match(/JSESSIONID=([^;]+)/);
            if (match) {
                this.sessionId = `JSESSIONID=${match[1]}`;
            }
        }
        
        // Make a request to get customer accounts which will return customer ID and account ID
        const accountsResponse = await this.request.get('https://parabank.parasoft.com/parabank/overview.htm', {
            headers: {
                'Cookie': this.sessionId
            }
        });
        
        const html = await accountsResponse.text();
        
        // Extract customer ID from the overview page
        const customerIdMatch = html.match(/href="customer\.htm\?id=(\d+)"/);
        let customerId = 0;
        if (customerIdMatch && customerIdMatch[1]) {
            customerId = parseInt(customerIdMatch[1], 10);
        }
        
        // Extract the first account ID 
        const accountIdMatch = html.match(/href="activity\.htm\?id=(\d+)"/);
        let accountId = 0;
        if (accountIdMatch && accountIdMatch[1]) {
            accountId = parseInt(accountIdMatch[1], 10);
        }
        
        return {
            id: accountId,
            customerId: customerId
        };
    }
}   