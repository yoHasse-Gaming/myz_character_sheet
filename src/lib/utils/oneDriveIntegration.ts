/**
 * OneDrive Integration for Character Sheet Storage
 * Provides client-side integration with Microsoft Graph API
 */

import type { CharacterSheetData } from "../states/character_sheet.svelte";

interface OneDriveConfig {
    clientId: string;
    authority: string;
    redirectUri: string;
    scopes: string[];
}

interface OneDriveFile {
    id: string;
    name: string;
    lastModifiedDateTime: string;
    size: number;
    parentReference?: {
        id: string;
        path: string;
    };
}

interface AuthResponse {
    accessToken: string;
    account: {
        username: string;
        name: string;
        localAccountId: string;
    };
}

class OneDriveIntegration {
    private config: OneDriveConfig;
    private isInitialized = false;
    private isSignedIn = false;
    private msalInstance: any = null;
    private accessToken: string | null = null;
    private folderName = 'MYZ Character Sheets';
    private folderId: string | null = null;

    constructor(config: OneDriveConfig) {
        this.config = config;
    }

    /**
     * Initialize MSAL (Microsoft Authentication Library)
     */
    public async initialize(): Promise<boolean> {
        try {
            // Load MSAL script dynamically
            if (!window.msal) {
                await this.loadMSAL();
            }

            const msalConfig = {
                auth: {
                    clientId: this.config.clientId,
                    authority: this.config.authority,
                    redirectUri: this.config.redirectUri
                },
                cache: {
                    cacheLocation: 'localStorage',
                    storeAuthStateInCookie: false
                }
            };

            this.msalInstance = new window.msal.PublicClientApplication(msalConfig);
            await this.msalInstance.initialize();

            // Check if user is already signed in
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                this.isSignedIn = true;
                await this.acquireTokenSilent();
            }

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize OneDrive:', error);
            return false;
        }
    }

    private async loadMSAL(): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load MSAL'));
            document.head.appendChild(script);
        });
    }

    /**
     * Sign in to Microsoft
     */
    public async signIn(): Promise<boolean> {
        if (!this.isInitialized) {
            throw new Error('OneDrive not initialized');
        }

        try {
            const loginRequest = {
                scopes: this.config.scopes,
                prompt: 'select_account'
            };

            const response = await this.msalInstance.loginPopup(loginRequest);
            this.isSignedIn = true;
            this.accessToken = response.accessToken;
            return true;
        } catch (error) {
            console.error('OneDrive sign-in failed:', error);
            return false;
        }
    }

    /**
     * Sign out from Microsoft
     */
    public async signOut(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                await this.msalInstance.logoutPopup({
                    account: accounts[0]
                });
            }
            this.isSignedIn = false;
            this.accessToken = null;
        } catch (error) {
            console.error('OneDrive sign-out failed:', error);
        }
    }

    /**
     * Acquire token silently
     */
    private async acquireTokenSilent(): Promise<string> {
        try {
            const accounts = this.msalInstance.getAllAccounts();
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const silentRequest = {
                scopes: this.config.scopes,
                account: accounts[0]
            };

            const response = await this.msalInstance.acquireTokenSilent(silentRequest);
            this.accessToken = response.accessToken;
            return response.accessToken;
        } catch (error) {
            console.error('Failed to acquire token silently:', error);
            throw error;
        }
    }

    /**
     * Get current user info
     */
    public getCurrentUser(): any {
        if (!this.isSignedIn) return null;
        
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length === 0) return null;

        const account = accounts[0];
        return {
            id: account.localAccountId,
            name: account.name,
            username: account.username
        };
    }

    /**
     * Make authenticated request to Microsoft Graph
     */
    private async makeGraphRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
        if (!this.accessToken) {
            await this.acquireTokenSilent();
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };

        const options: RequestInit = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create or get the character sheets folder
     */
    private async ensureFolder(): Promise<string> {
        if (this.folderId) return this.folderId;

        try {
            // Search for existing folder
            const searchResponse = await this.makeGraphRequest(
                `/me/drive/root/children?$filter=name eq '${this.folderName}' and folder ne null`
            );

            if (searchResponse.value && searchResponse.value.length > 0) {
                this.folderId = searchResponse.value[0].id;
                return this.folderId!;
            }

            // Create folder if it doesn't exist
            const createResponse = await this.makeGraphRequest('/me/drive/root/children', 'POST', {
                name: this.folderName,
                folder: {},
                "@microsoft.graph.conflictBehavior": "rename"
            });

            this.folderId = createResponse.id;
            return this.folderId!;
        } catch (error) {
            console.error('Failed to ensure folder exists:', error);
            throw error;
        }
    }

    /**
     * Save character sheet to OneDrive
     */
    public async saveCharacterSheet(characterData: CharacterSheetData): Promise<string> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to OneDrive');
        }

        try {
            const folderId = await this.ensureFolder();
            const fileName = `${characterData.name || 'Unnamed'}_${characterData.id}.json`;
            
            const dataToSave = {
                ...characterData,
                savedAt: new Date().toISOString(),
                source: 'onedrive'
            };

            const content = JSON.stringify(dataToSave, null, 2);
            
            // Upload file content
            const uploadResponse = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${fileName}:/content`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: content
                }
            );

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            const result = await uploadResponse.json();
            return result.id;
        } catch (error) {
            console.error('Failed to save to OneDrive:', error);
            throw error;
        }
    }

    /**
     * Load character sheet from OneDrive
     */
    public async loadCharacterSheet(fileId: string): Promise<CharacterSheetData | null> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to OneDrive');
        }

        try {
            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
            }

            const content = await response.text();
            return JSON.parse(content);
        } catch (error) {
            console.error('Failed to load from OneDrive:', error);
            return null;
        }
    }

    /**
     * List all character sheets in OneDrive
     */
    public async listCharacterSheets(): Promise<OneDriveFile[]> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to OneDrive');
        }

        try {
            const folderId = await this.ensureFolder();
            
            const response = await this.makeGraphRequest(
                `/me/drive/items/${folderId}/children?$filter=endswith(name,'.json')&$orderby=lastModifiedDateTime desc`
            );

            return response.value || [];
        } catch (error) {
            console.error('Failed to list character sheets:', error);
            return [];
        }
    }

    /**
     * Delete character sheet from OneDrive
     */
    public async deleteCharacterSheet(fileId: string): Promise<boolean> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to OneDrive');
        }

        try {
            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            return response.ok;
        } catch (error) {
            console.error('Failed to delete from OneDrive:', error);
            return false;
        }
    }

    /**
     * Check if OneDrive is available and user is signed in
     */
    public get isAvailable(): boolean {
        return this.isInitialized && this.isSignedIn;
    }

    /**
     * Check if OneDrive is initialized
     */
    public get isReady(): boolean {
        return this.isInitialized;
    }
}

// Configuration - You'll need to register your app in Azure AD
const oneDriveConfig: OneDriveConfig = {
    clientId: 'YOUR_AZURE_CLIENT_ID', // Replace with your Azure AD app client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin, // Your app's URL
    scopes: ['Files.ReadWrite', 'User.Read']
};

export const oneDriveIntegration = new OneDriveIntegration(oneDriveConfig);
export default oneDriveIntegration;

// Type declaration for global msal
declare global {
    interface Window {
        msal: any;
    }
}
