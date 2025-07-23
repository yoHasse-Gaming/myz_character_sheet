/**
 * Google Drive Integration for Character Sheet Storage
 * Provides client-side integration with Google Drive API
 */

import type { CharacterSheetData } from "../states/character_sheet.svelte";

interface GoogleDriveConfig {
    apiKey: string;
    clientId: string;
    discoveryDocs: string[];
    scope: string;
}

interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
    size: string;
    parents?: string[];
}

class GoogleDriveIntegration {
    private config: GoogleDriveConfig;
    private isInitialized = false;
    private isSignedIn = false;
    private gapi: any;
    private folderName = 'MYZ Character Sheets';
    private folderId: string | null = null;

    constructor(config: GoogleDriveConfig) {
        this.config = config;
    }

    /**
     * Initialize Google API client
     */
    public async initialize(): Promise<boolean> {
        try {
            // Load Google API script dynamically
            if (!window.gapi) {
                await this.loadGoogleAPI();
            }

            this.gapi = window.gapi;

            await new Promise((resolve) => {
                this.gapi.load('auth2:client', resolve);
            });

            await this.gapi.client.init({
                apiKey: this.config.apiKey,
                clientId: this.config.clientId,
                discoveryDocs: this.config.discoveryDocs,
                scope: this.config.scope
            });

            this.isInitialized = true;
            this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();
            
            // Listen for sign-in state changes
            this.gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn: boolean) => {
                this.isSignedIn = signedIn;
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize Google Drive:', error);
            return false;
        }
    }

    private async loadGoogleAPI(): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google API'));
            document.head.appendChild(script);
        });
    }

    /**
     * Sign in to Google
     */
    public async signIn(): Promise<boolean> {
        if (!this.isInitialized) {
            throw new Error('Google Drive not initialized');
        }

        try {
            const authInstance = this.gapi.auth2.getAuthInstance();
            await authInstance.signIn();
            this.isSignedIn = true;
            return true;
        } catch (error) {
            console.error('Google sign-in failed:', error);
            return false;
        }
    }

    /**
     * Sign out from Google
     */
    public async signOut(): Promise<void> {
        if (!this.isInitialized) return;

        try {
            const authInstance = this.gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            this.isSignedIn = false;
        } catch (error) {
            console.error('Google sign-out failed:', error);
        }
    }

    /**
     * Get current user info
     */
    public getCurrentUser(): any {
        if (!this.isSignedIn) return null;
        
        const authInstance = this.gapi.auth2.getAuthInstance();
        const user = authInstance.currentUser.get();
        const profile = user.getBasicProfile();
        
        return {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl()
        };
    }

    /**
     * Create or get the character sheets folder
     */
    private async ensureFolder(): Promise<string> {
        if (this.folderId) return this.folderId;

        try {
            // Search for existing folder
            const response = await this.gapi.client.drive.files.list({
                q: `name='${this.folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                spaces: 'drive'
            });

            if (response.result.files && response.result.files.length > 0) {
                this.folderId = response.result.files[0].id;
                return this.folderId!;
            }

            // Create folder if it doesn't exist
            const createResponse = await this.gapi.client.drive.files.create({
                resource: {
                    name: this.folderName,
                    mimeType: 'application/vnd.google-apps.folder'
                }
            });

            this.folderId = createResponse.result.id;
            return this.folderId!;
        } catch (error) {
            console.error('Failed to ensure folder exists:', error);
            throw error;
        }
    }

    /**
     * Save character sheet to Google Drive
     */
    public async saveCharacterSheet(characterData: CharacterSheetData): Promise<string> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to Google Drive');
        }

        try {
            const folderId = await this.ensureFolder();
            const fileName = `${characterData.name || 'Unnamed'}_${characterData.id}.json`;
            
            // Check if file already exists
            const existingFile = await this.findCharacterFile(characterData.id);
            
            const metadata = {
                name: fileName,
                parents: [folderId],
                description: `MYZ Character Sheet - ${characterData.name || 'Unnamed'} (${characterData.occupation || 'Unknown Occupation'})`
            };

            const dataToSave = {
                ...characterData,
                savedAt: new Date().toISOString(),
                source: 'google-drive'
            };

            const body = JSON.stringify(dataToSave, null, 2);

            let response;
            if (existingFile) {
                // Update existing file
                response = await this.gapi.client.request({
                    path: `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`,
                    method: 'PATCH',
                    params: {
                        uploadType: 'media'
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body
                });
            } else {
                // Create new file
                response = await this.gapi.client.request({
                    path: 'https://www.googleapis.com/upload/drive/v3/files',
                    method: 'POST',
                    params: {
                        uploadType: 'multipart'
                    },
                    headers: {
                        'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
                    },
                    body: this.createMultipartBody(metadata, body)
                });
            }

            return response.result.id;
        } catch (error) {
            console.error('Failed to save to Google Drive:', error);
            throw error;
        }
    }

    /**
     * Load character sheet from Google Drive
     */
    public async loadCharacterSheet(fileId: string): Promise<CharacterSheetData | null> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to Google Drive');
        }

        try {
            const response = await this.gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            return JSON.parse(response.body);
        } catch (error) {
            console.error('Failed to load from Google Drive:', error);
            return null;
        }
    }

    /**
     * List all character sheets in Google Drive
     */
    public async listCharacterSheets(): Promise<DriveFile[]> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to Google Drive');
        }

        try {
            const folderId = await this.ensureFolder();
            
            const response = await this.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false and name contains '.json'`,
                orderBy: 'modifiedTime desc',
                fields: 'files(id,name,modifiedTime,size,parents)'
            });

            return response.result.files || [];
        } catch (error) {
            console.error('Failed to list character sheets:', error);
            return [];
        }
    }

    /**
     * Delete character sheet from Google Drive
     */
    public async deleteCharacterSheet(fileId: string): Promise<boolean> {
        if (!this.isSignedIn) {
            throw new Error('Not signed in to Google Drive');
        }

        try {
            await this.gapi.client.drive.files.delete({
                fileId: fileId
            });
            return true;
        } catch (error) {
            console.error('Failed to delete from Google Drive:', error);
            return false;
        }
    }

    /**
     * Find character file by character ID
     */
    private async findCharacterFile(characterId: string): Promise<DriveFile | null> {
        try {
            const folderId = await this.ensureFolder();
            
            const response = await this.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false and name contains '${characterId}'`,
                fields: 'files(id,name,modifiedTime,size)'
            });

            const files = response.result.files || [];
            return files.length > 0 ? files[0] : null;
        } catch (error) {
            console.error('Failed to find character file:', error);
            return null;
        }
    }

    /**
     * Create multipart body for file upload
     */
    private createMultipartBody(metadata: any, data: string): string {
        const delimiter = 'foo_bar_baz';
        const close_delim = `\r\n--${delimiter}--`;
        
        let body = `--${delimiter}\r\n`;
        body += 'Content-Type: application/json\r\n\r\n';
        body += JSON.stringify(metadata) + '\r\n';
        body += `--${delimiter}\r\n`;
        body += 'Content-Type: application/json\r\n\r\n';
        body += data;
        body += close_delim;
        
        return body;
    }

    /**
     * Check if Google Drive is available and user is signed in
     */
    public get isAvailable(): boolean {
        return this.isInitialized && this.isSignedIn;
    }

    /**
     * Check if Google Drive is initialized
     */
    public get isReady(): boolean {
        return this.isInitialized;
    }
}

// Configuration - You'll need to get these from Google Cloud Console
const googleDriveConfig: GoogleDriveConfig = {
    apiKey: 'YOUR_GOOGLE_API_KEY', // Replace with your API key
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your OAuth client ID
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    scope: 'https://www.googleapis.com/auth/drive.file'
};

export const googleDriveIntegration = new GoogleDriveIntegration(googleDriveConfig);
export default googleDriveIntegration;

// Type declaration for global gapi
declare global {
    interface Window {
        gapi: any;
    }
}
