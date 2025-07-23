import { sheetState, type CharacterSheetData } from "../states/character_sheet.svelte";
import { googleDriveIntegration } from "./googleDriveIntegration";
import { oneDriveIntegration } from "./oneDriveIntegration";



export interface StorageOptions {
    autoSaveInterval: number;
    storageKey: string;
    currentCharacterKey: string;
    cloudProvider?: 'none' | 'google-drive' | 'onedrive';
    syncWithCloud?: boolean;
    autoSaveToFile?: boolean;
}


class StorageHandler {
    private autoSaveTimer: number | null = null;
    private fileHandle: FileSystemFileHandle | null = null;
    private storageOptions: StorageOptions = {
        autoSaveInterval: 5000,
        storageKey: 'myz-character-sheet-data',
        currentCharacterKey: 'current-character-id',
        cloudProvider: 'none',
        syncWithCloud: false,
        autoSaveToFile: true
    };
    private static readonly TIMER_ID_KEY = 'myz-autosave-timer-id';

    constructor() {
        this.clearExistingTimers();
    }

    private clearExistingTimers(): void {
        const savedTimerId = localStorage.getItem(StorageHandler.TIMER_ID_KEY);
        if (savedTimerId) {
            clearInterval(parseInt(savedTimerId));
            localStorage.removeItem(StorageHandler.TIMER_ID_KEY);
        }
    }

        // Storage methods
    public configureStorage(options: Partial<StorageOptions>): void {
        this.storageOptions = { ...this.storageOptions, ...options };
        

    }

    public getStorageConfig(): StorageOptions {
        return { ...this.storageOptions };
    }

    public async save(): Promise<void> {
        sheetState.lastUpdated = Date.now();
        const data = JSON.parse(JSON.stringify(sheetState));
        
        // Primary save method: save to file if available
        if (this.storageOptions.autoSaveToFile && this.fileHandle) {
            await this.saveToFile(data);
        }
        
        // Optionally sync to cloud storage
        if (this.storageOptions.syncWithCloud) {
            await this.syncToCloud(data);
        }
    }

    private saveToLocalStorage(data: CharacterSheetData): void {
        try {
            data.lastUpdated = Date.now();
            localStorage.setItem(this.storageOptions.storageKey + sheetState.id, JSON.stringify(data));
            localStorage.setItem(this.storageOptions.currentCharacterKey, sheetState.id);
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    public async load(characterId: string): Promise<CharacterSheetData | null> {
        // For file-based workflow, we don't need to load from localStorage
        // The character data will be loaded from file when user selects "Load from File"
        // This method is now mainly for backward compatibility
        try {
            const savedData = localStorage.getItem(this.storageOptions.storageKey + characterId);
            return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return null;
        }
    }


    public importFromJSON(): Promise<CharacterSheetData | null> {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (!file) {
                    resolve(null);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const jsonData = JSON.parse(e.target?.result as string);
                        resolve(jsonData);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            };

            input.click();
        });
    }

    // File System Access API methods (for browsers that support it)
    public get supportsFileSystemAccess(): boolean {
        return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
    }

    public async saveToFile(data: CharacterSheetData): Promise<boolean> {
        if (!this.fileHandle || !this.supportsFileSystemAccess) {
            return false;
        }

        try {
            const dataToExport = {
                ...data,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const writable = await this.fileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            
            return true;
        } catch (error) {
            console.warn('Failed to save to file:', error);
            return false;
        }
    }

    public async loadFromFile(): Promise<CharacterSheetData | null> {
        if (!this.supportsFileSystemAccess) {
            console.warn('File System Access API not supported');
            return null;
        }

        try {
            const [fileHandle] = await (window as any).showOpenFilePicker({
                types: [{
                    description: 'JSON files',
                    accept: {
                        'application/json': ['.json']
                    }
                }]
            });

            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Store the file handle for future auto-saves
            this.fileHandle = fileHandle;
            
            return data;
        } catch (error) {
            console.warn('Failed to load from file:', error);
            return null;
        }
    }

    public async createNewCharacterFile(data: CharacterSheetData): Promise<boolean> {
        if (!this.supportsFileSystemAccess) {
            console.warn('File System Access API not supported');
            return false;
        }

        try {
            const filename = `${data.name || 'unnamed'}-character-sheet.json`;
            const fileHandle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'JSON files',
                    accept: {
                        'application/json': ['.json']
                    }
                }]
            });

            this.fileHandle = fileHandle;
            
            // Immediately save to the selected file
            await this.saveToFile(data);
            
            return true;
        } catch (error) {
            console.warn('Failed to create new character file:', error);
            return false;
        }
    }

    public clearFileHandle(): void {
        this.fileHandle = null;
    }

    public get hasActiveFile(): boolean {
        return this.fileHandle !== null;
    }

    // Auto-save methods
    public startAutoSave(onSavingStarted: () => Promise<void>, onSavingCompleted: () => Promise<void>): void {
        if (this.autoSaveTimer) return;

        this.autoSaveTimer = window.setInterval(async () => {
            await onSavingStarted();
            await this.save();
            await onSavingCompleted();
        }, this.storageOptions.autoSaveInterval);

        try {
            localStorage.setItem(StorageHandler.TIMER_ID_KEY, this.autoSaveTimer.toString());
        } catch (error) {
            console.warn('Failed to store timer ID:', error);
        }
    }

    public stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            localStorage.removeItem(StorageHandler.TIMER_ID_KEY);
        }
    }

    // Cloud storage integration methods
    private async syncToCloud(data: CharacterSheetData): Promise<void> {
        try {
            switch (this.storageOptions.cloudProvider) {
                case 'google-drive':
                    if (googleDriveIntegration.isAvailable) {
                        await googleDriveIntegration.saveCharacterSheet(data);
                    }
                    break;
                case 'onedrive':
                    if (oneDriveIntegration.isAvailable) {
                        await oneDriveIntegration.saveCharacterSheet(data);
                    }
                    break;
                default:
                    // No cloud sync
                    break;
            }
        } catch (error) {
            console.warn('Failed to sync to cloud:', error);
            // Don't throw error - localStorage save should still work
        }
    }

    public async loadFromCloud(characterId: string): Promise<CharacterSheetData | null> {
        try {
            switch (this.storageOptions.cloudProvider) {
                case 'google-drive':
                    if (googleDriveIntegration.isAvailable) {
                        const files = await googleDriveIntegration.listCharacterSheets();
                        const targetFile = files.find(file => file.name.includes(characterId));
                        if (targetFile) {
                            return await googleDriveIntegration.loadCharacterSheet(targetFile.id);
                        }
                    }
                    break;
                case 'onedrive':
                    if (oneDriveIntegration.isAvailable) {
                        const files = await oneDriveIntegration.listCharacterSheets();
                        const targetFile = files.find(file => file.name.includes(characterId));
                        if (targetFile) {
                            return await oneDriveIntegration.loadCharacterSheet(targetFile.id);
                        }
                    }
                    break;
                default:
                    return null;
            }
        } catch (error) {
            console.warn('Failed to load from cloud:', error);
            return null;
        }
        return null;
    }

    public async getCloudCharacters(): Promise<{id: string, name: string, source: string, lastModified: string}[]> {
        const characters: {id: string, name: string, source: string, lastModified: string}[] = [];
        
        try {
            switch (this.storageOptions.cloudProvider) {
                case 'google-drive':
                    if (googleDriveIntegration.isAvailable) {
                        const files = await googleDriveIntegration.listCharacterSheets();
                        for (const file of files) {
                            const match = file.name.match(/^(.+)_([a-f0-9-]+)\.json$/);
                            if (match) {
                                characters.push({
                                    id: match[2],
                                    name: match[1],
                                    source: 'Google Drive',
                                    lastModified: file.modifiedTime
                                });
                            }
                        }
                    }
                    break;
                case 'onedrive':
                    if (oneDriveIntegration.isAvailable) {
                        const files = await oneDriveIntegration.listCharacterSheets();
                        for (const file of files) {
                            const match = file.name.match(/^(.+)_([a-f0-9-]+)\.json$/);
                            if (match) {
                                characters.push({
                                    id: match[2],
                                    name: match[1],
                                    source: 'OneDrive',
                                    lastModified: file.lastModifiedDateTime
                                });
                            }
                        }
                    }
                    break;
            }
        } catch (error) {
            console.warn('Failed to get cloud characters:', error);
        }
        
        return characters;
    }

    public async deleteFromCloud(characterId: string): Promise<boolean> {
        try {
            switch (this.storageOptions.cloudProvider) {
                case 'google-drive':
                    if (googleDriveIntegration.isAvailable) {
                        const files = await googleDriveIntegration.listCharacterSheets();
                        const targetFile = files.find(file => file.name.includes(characterId));
                        if (targetFile) {
                            return await googleDriveIntegration.deleteCharacterSheet(targetFile.id);
                        }
                    }
                    break;
                case 'onedrive':
                    if (oneDriveIntegration.isAvailable) {
                        const files = await oneDriveIntegration.listCharacterSheets();
                        const targetFile = files.find(file => file.name.includes(characterId));
                        if (targetFile) {
                            return await oneDriveIntegration.deleteCharacterSheet(targetFile.id);
                        }
                    }
                    break;
            }
        } catch (error) {
            console.warn('Failed to delete from cloud:', error);
            return false;
        }
        return false;
    }

    // Cloud provider initialization methods
    public async initializeGoogleDrive(): Promise<boolean> {
        try {
            const success = await googleDriveIntegration.initialize();
            if (success) {
                this.storageOptions.cloudProvider = 'google-drive';
                this.storageOptions.syncWithCloud = true;
            }
            return success;
        } catch (error) {
            console.error('Failed to initialize Google Drive:', error);
            return false;
        }
    }

    public async initializeOneDrive(): Promise<boolean> {
        try {
            const success = await oneDriveIntegration.initialize();
            if (success) {
                this.storageOptions.cloudProvider = 'onedrive';
                this.storageOptions.syncWithCloud = true;
            }
            return success;
        } catch (error) {
            console.error('Failed to initialize OneDrive:', error);
            return false;
        }
    }

    public async signInToGoogleDrive(): Promise<boolean> {
        return await googleDriveIntegration.signIn();
    }

    public async signInToOneDrive(): Promise<boolean> {
        return await oneDriveIntegration.signIn();
    }

    public async signOutFromCloud(): Promise<void> {
        switch (this.storageOptions.cloudProvider) {
            case 'google-drive':
                await googleDriveIntegration.signOut();
                break;
            case 'onedrive':
                await oneDriveIntegration.signOut();
                break;
        }
        this.storageOptions.cloudProvider = 'none';
        this.storageOptions.syncWithCloud = false;
    }

    public getCloudUser(): any {
        switch (this.storageOptions.cloudProvider) {
            case 'google-drive':
                return googleDriveIntegration.getCurrentUser();
            case 'onedrive':
                return oneDriveIntegration.getCurrentUser();
            default:
                return null;
        }
    }

    public get isCloudAvailable(): boolean {
        switch (this.storageOptions.cloudProvider) {
            case 'google-drive':
                return googleDriveIntegration.isAvailable;
            case 'onedrive':
                return oneDriveIntegration.isAvailable;
            default:
                return false;
        }
    }

    public get cloudProviderName(): string {
        switch (this.storageOptions.cloudProvider) {
            case 'google-drive':
                return 'Google Drive';
            case 'onedrive':
                return 'OneDrive';
            default:
                return 'None';
        }
    }
}

export const storageHandler = new StorageHandler();
export default storageHandler;