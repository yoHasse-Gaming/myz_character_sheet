import OBR from "@owlbear-rodeo/sdk";
import { sheetState, type CharacterSheetData } from "../states/character_sheet.svelte";
import { googleDriveIntegration } from "./googleDriveIntegration";
import { oneDriveIntegration } from "./oneDriveIntegration";
import { supabaseIntegration } from "./supaBaseIntegration";



export interface StorageOptions {
    autoSaveInterval: number;
    storageKey: string;
    currentCharacterKey: string;
    cloudProvider?: 'none' | 'google-drive' | 'onedrive' | 'supabase';
    syncWithCloud?: boolean;
    autoSaveToFile?: boolean;
}


class StorageHandler {
    private autoSaveTimer: number | null = null;
    private fileHandle: FileSystemFileHandle | null = null;
    private opfsFileHandle: FileSystemFileHandle | null = null;
    private opfsRoot: FileSystemDirectoryHandle | null = null;
    private storageOptions: StorageOptions = {
        autoSaveInterval: 5000,
        storageKey: 'myz-character-sheet-data',
        currentCharacterKey: 'current-character-id',
        cloudProvider: 'none',
        syncWithCloud: false,
        autoSaveToFile: true
    };
    private static readonly TIMER_ID_KEY = 'myz-autosave-timer-id';
    private static readonly OPFS_FILENAME = 'character-sheet.json';
    private static readonly OPFS_CHARACTERS_DIR = 'characters';
    private static readonly STATE_COMPARISON_KEY = 'myz-last-saved-state';

    constructor() {
        this.clearExistingTimers();
        this.initializeOPFS();
    }

    private async initializeOPFS(): Promise<void> {
        try {
            if ('storage' in navigator && 'getDirectory' in navigator.storage) {
                this.opfsRoot = await navigator.storage.getDirectory();
            }
        } catch (error) {
            console.warn('Failed to initialize OPFS:', error);
        }
    }

    private clearExistingTimers(): void {
        const savedTimerId = localStorage.getItem(StorageHandler.TIMER_ID_KEY);
        if (savedTimerId) {
            clearInterval(parseInt(savedTimerId));
            localStorage.removeItem(StorageHandler.TIMER_ID_KEY);
        }
        // Also clean up any leftover comparison state
        localStorage.removeItem(StorageHandler.STATE_COMPARISON_KEY);
    }

        // Storage methods
    public configureStorage(options: Partial<StorageOptions>): void {
        this.storageOptions = { ...this.storageOptions, ...options };
    }

    /**
     * Auto-configure storage based on environment
     */
    public async autoConfigureStorage(): Promise<void> {
        // If in Owlbear environment, enable Supabase cloud sync
        if (OBR.isAvailable && supabaseIntegration.isAvailable) {
            this.configureStorage({
                cloudProvider: 'supabase',
                syncWithCloud: true
            });
        }
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
        // Fallback to OPFS if File System Access API is not available
        else if (this.storageOptions.autoSaveToFile && this.supportsOPFS) {
            await this.saveToOPFS(data);
        }
        
        // Optionally sync to cloud storage
        if (this.storageOptions.syncWithCloud && false) {
            await this.syncToCloud(data);
        }

        // Update comparison state after successful save
        this.storeCurrentStateForComparison();
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

    public async exportToJSON(data: CharacterSheetData): Promise<void> {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name || 'character-sheet'}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // File System Access API methods (for browsers that support it)
    public get supportsFileSystemAccess(): boolean {
        return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window && !OBR.isAvailable;
    }

    public get supportsOPFS(): boolean {
        return 'storage' in navigator && 'getDirectory' in navigator.storage;
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
        this.opfsFileHandle = null;
    }

    public get hasActiveFile(): boolean {
        return this.fileHandle !== null || this.opfsFileHandle !== null;
    }

    // OPFS (Origin Private File System) methods
    public async saveToOPFS(data: CharacterSheetData): Promise<boolean> {
        if (!data.id) {
            console.warn('Cannot save character without ID to OPFS');
            return false;
        }
        return await this.saveToOPFSWithId(data, data.id);
    }

    public async loadFromOPFS(): Promise<CharacterSheetData | null> {
        if (!this.supportsOPFS || !this.opfsRoot) {
            console.warn('OPFS not supported');
            return null;
        }

        try {
            // First try to load from the old single file format for backward compatibility
            try {
                const fileHandle = await this.opfsRoot.getFileHandle(StorageHandler.OPFS_FILENAME);
                const file = await fileHandle.getFile();
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Migrate to new format if successful
                if (data.id) {
                    await this.saveToOPFSWithId(data, data.id);
                    // Remove old file
                    await this.opfsRoot.removeEntry(StorageHandler.OPFS_FILENAME);
                }
                
                return data;
            } catch {
                // Old format doesn't exist, try to load the most recent character
                const characters = await this.getOPFSCharacters();
                if (characters.length > 0) {
                    return await this.loadFromOPFSWithId(characters[0].id);
                }
                return null;
            }
        } catch (error) {
            console.warn('Failed to load from OPFS:', error);
            return null;
        }
    }

    public async createNewCharacterOPFS(data: CharacterSheetData): Promise<boolean> {
        if (!data.id) {
            console.warn('Cannot create character without ID in OPFS');
            return false;
        }
        return await this.saveToOPFSWithId(data, data.id);
    }

    public clearOPFSHandle(): void {
        this.opfsFileHandle = null;
    }

    // Multiple character support for OPFS
    public async getOPFSCharacters(): Promise<{id: string, name: string, lastModified: string}[]> {
        if (!this.supportsOPFS || !this.opfsRoot) {
            return [];
        }

        try {
            const characters: {id: string, name: string, lastModified: string}[] = [];
            
            // Try to get the characters directory
            let charactersDir: FileSystemDirectoryHandle;
            try {
                charactersDir = await this.opfsRoot.getDirectoryHandle(StorageHandler.OPFS_CHARACTERS_DIR);
            } catch {
                // Directory doesn't exist, no characters saved yet
                return [];
            }

            // List all character files
            for await (const [fileName, handle] of charactersDir.entries()) {
                if (handle.kind === 'file' && fileName.endsWith('.json')) {
                    try {
                        const file = await (handle as FileSystemFileHandle).getFile();
                        const text = await file.text();
                        const data = JSON.parse(text);
                        
                        characters.push({
                            id: data.id || fileName.replace('.json', ''),
                            name: data.name || 'Unnamed Character',
                            lastModified: new Date(file.lastModified).toISOString()
                        });
                    } catch (error) {
                        console.warn(`Failed to read character file ${fileName}:`, error);
                    }
                }
            }

            // Sort by last modified date (newest first)
            return characters.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
        } catch (error) {
            console.warn('Failed to get OPFS characters:', error);
            return [];
        }
    }

    public async saveToOPFSWithId(data: CharacterSheetData, characterId: string): Promise<boolean> {
        if (!this.supportsOPFS || !this.opfsRoot) {
            return false;
        }

        try {
            const dataToExport = {
                ...data,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            
            // Create characters directory if it doesn't exist
            const charactersDir = await this.opfsRoot.getDirectoryHandle(
                StorageHandler.OPFS_CHARACTERS_DIR, 
                { create: true }
            );

            // Create or get character file
            const fileName = `${characterId}.json`;
            const fileHandle = await charactersDir.getFileHandle(fileName, { create: true });

            const writable = await fileHandle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            
            return true;
        } catch (error) {
            console.warn('Failed to save to OPFS with ID:', error);
            return false;
        }
    }

    public async loadFromOPFSWithId(characterId: string): Promise<CharacterSheetData | null> {
        if (!this.supportsOPFS || !this.opfsRoot) {
            return null;
        }

        try {
            const charactersDir = await this.opfsRoot.getDirectoryHandle(StorageHandler.OPFS_CHARACTERS_DIR);
            const fileName = `${characterId}.json`;
            const fileHandle = await charactersDir.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Store the file handle for future auto-saves
            this.opfsFileHandle = fileHandle;
            
            return data;
        } catch (error) {
            console.warn('Failed to load from OPFS with ID:', error);
            return null;
        }
    }

    public async deleteFromOPFS(characterId: string): Promise<boolean> {
        if (!this.supportsOPFS || !this.opfsRoot) {
            return false;
        }

        try {
            const charactersDir = await this.opfsRoot.getDirectoryHandle(StorageHandler.OPFS_CHARACTERS_DIR);
            const fileName = `${characterId}.json`;
            await charactersDir.removeEntry(fileName);
            return true;
        } catch (error) {
            console.warn('Failed to delete from OPFS:', error);
            return false;
        }
    }

    // State comparison methods for optimized auto-save
    private storeCurrentStateForComparison(): void {
        try {
            const currentState = JSON.stringify(sheetState);
            localStorage.setItem(StorageHandler.STATE_COMPARISON_KEY, currentState);
        } catch (error) {
            console.warn('Failed to store state for comparison:', error);
        }
    }

    private hasStateChanged(): boolean {
        try {
            const currentState = JSON.stringify(sheetState);
            const lastSavedState = localStorage.getItem(StorageHandler.STATE_COMPARISON_KEY);
            return currentState !== lastSavedState;
        } catch (error) {
            console.warn('Failed to compare state changes:', error);
            // If we can't compare, assume state has changed to be safe
            return true;
        }
    }

    /**
     * Update the stored state for comparison after loading from external sources
     * Call this after loading a character from file, OPFS, or cloud storage
     */
    public updateComparisonState(): void {
        this.storeCurrentStateForComparison();
    }

    // Auto-save methods
    public startAutoSave(onSavingStarted: () => Promise<void>, onSavingCompleted: () => Promise<void>): void {
        if (this.autoSaveTimer) return;

        // Store initial state for comparison
        this.storeCurrentStateForComparison();

        this.autoSaveTimer = window.setInterval(async () => {
            // Only save if there are actual changes
            if (this.hasStateChanged()) {
                await onSavingStarted();
                await this.save();
                await onSavingCompleted();
                // Update stored state after successful save
                this.storeCurrentStateForComparison();
            }
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
            // Clean up comparison state
            localStorage.removeItem(StorageHandler.STATE_COMPARISON_KEY);
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
                case 'supabase':
                    if (supabaseIntegration.isAvailable) {
                        await supabaseIntegration.saveCharacterSheet(data);
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