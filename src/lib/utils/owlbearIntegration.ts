/**
 * Owlbear Rodeo Integration utilities
 * Provides methods to communicate with Owlbear Rodeo using the official SDK
 * Also includes localStorage failsafe and JSON export/import functionality
 */

import OBR from "@owlbear-rodeo/sdk";
import { checkDicePluginAvailability } from "./diceUtils";

export function getExtensionId(path: string): string {
    return `rodeo.owlbear.myz_character_sheet/${path}`;
}

export interface CharacterData {
    name: string;
    baseAbilities: any[];
    skills: any[];
    conditions: any;
    // Add other character sheet properties as needed
}

export interface StorageOptions {
    useLocalStorage: boolean;
    autoSaveInterval: number; // in milliseconds
    storageKey: string;
}

class OwlbearIntegration {
    private characterData: CharacterData | null = null;
    private autoSaveTimer: number | null = null;
    private storageOptions: StorageOptions = {
        useLocalStorage: true,
        autoSaveInterval: 5000, // Auto-save every 5 seconds
        storageKey: 'myz-character-sheet-data'
    };

    constructor() {
        this.initializeOBR();
        // Always try to load from localStorage first
        this.loadFromLocalStorage();
    }

    /**
     * Initialize Owlbear Rodeo SDK
     */
    private async initializeOBR(): Promise<void> {
        
        
        try {
            // Dynamic import to avoid SSR issues

            if(!OBR.isAvailable) {
                console.warn('Owlbear Rodeo SDK is not available in this environment');
                return;
            }
            
            // Wait for OBR to be ready
            OBR.onReady(async () => {
                
                
                // Listen for character data updates
                this.setupCharacterDataListener();

                await checkDicePluginAvailability()

                // Initialize dice integration, if available
                
            });

        } catch (error) {
            console.warn('Owlbear Rodeo SDK not available:', error);
        }
    }

    

    /**
     * Set up listener for character data changes
     */
    private setupCharacterDataListener(): void {
        if (!OBR.isAvailable) return;
        console.log('Setting up character data listener');
        // Listen for room metadata changes where character data might be stored
        OBR.room.onMetadataChange(async (metadata: any) => {
            console.log('Character data metadata changed:', metadata);
            const characterKey = getExtensionId(await OBR.player.getId());
            if (metadata[characterKey]) {
                this.characterData = metadata[characterKey] as CharacterData;
            }
        });
    }

    /**
     * Save character data to Owlbear room metadata
     */
    public async saveCharacterData(characterData: CharacterData): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            const characterKey = getExtensionId(await OBR.player.getId());
            await OBR.room.setMetadata({
                [characterKey]: {
                    ...characterData,
                    lastUpdated: Date.now()
                }
            });
            
        } catch (error) {
            console.warn('Failed to save character data:', error);
        }
    }

    /**
     * Load character data from Owlbear room metadata
     */
    public async loadCharacterData(): Promise<CharacterData | null> {
        if (!OBR.isAvailable) return null;

        try {
            const metadata = await OBR.room.getMetadata();
            const characterKey = getExtensionId(await OBR.player.getId());
            return metadata[characterKey] as CharacterData || null;
        } catch (error) {
            console.warn('Failed to load character data:', error);
            return null;
        }
    }

    /**
     * Set the popover size
     */
    public async setSize(width: number, height: number): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            await OBR.action.setWidth(width);
            await OBR.action.setHeight(height);
            
        } catch (error) {
            console.warn('Failed to set popover size:', error);
        }
    }

    /**
     * Close the popover
     */
    public async close(): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            await OBR.action.close();
        } catch (error) {
            console.warn('Failed to close popover:', error);
        }
    }

    /**
     * Check if we're running in Owlbear Rodeo
     */
    public get isOwlbearEnvironment(): boolean {
        return OBR.isAvailable;
    }

    /**
     * Set up automatic character data sync
     */
    public setupAutoSync(getCharacterData: () => CharacterData, interval: number = 30000): void {
        if (!OBR.isAvailable) return;

        // Send initial data
        this.saveCharacterData(getCharacterData());

        // Set up periodic sync
        setInterval(() => {
            this.saveCharacterData(getCharacterData());
        }, interval);
    }

    /**
     * Get player info
     */
    public async getPlayerInfo() {
        if (!OBR.isAvailable) return null;

        try {
            const name = await OBR.player.getName();
            const role = await OBR.player.getRole();
            const id = await OBR.player.getId();
            const connectionId = await OBR.player.getConnectionId();
            return { name, role, id };
        } catch (error) {
            console.warn('Failed to get player info:', error);
            return null;
        }
    }

    /**
     * Notify other players of character updates
     */
    public async notifyCharacterUpdate(characterData: CharacterData): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            // Use the broadcast API to notify other players
            await OBR.broadcast.sendMessage('character-sheet-update', {
                characterData,
                timestamp: Date.now()
            });
        } catch (error) {
            console.warn('Failed to broadcast character update:', error);
        }
    }

    /**
     * LOCALSTORAGE METHODS
     */

    /**
     * Save character data to localStorage
     */
    public saveToLocalStorage(characterData: CharacterData): void {
        if (!this.storageOptions.useLocalStorage) return;

        try {
            const dataToSave = {
                ...characterData,
                lastUpdated: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(this.storageOptions.storageKey, JSON.stringify(dataToSave));
            
        } catch (error) {
            console.warn('Failed to save character data to localStorage:', error);
        }
    }

    /**
     * Load character data from localStorage
     */
    public loadFromLocalStorage(): CharacterData | null {
        if (!this.storageOptions.useLocalStorage) return null;

        try {
            const savedData = localStorage.getItem(this.storageOptions.storageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                return parsedData;
            }
        } catch (error) {
            console.warn('Failed to load character data from localStorage:', error);
        }
        return null;
    }

    /**
     * Clear character data from localStorage
     */
    public clearLocalStorage(): void {

        try {
            localStorage.removeItem(this.storageOptions.storageKey);
            
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }

    /**
     * Export character data as JSON file
     */
    public exportToJSON(characterData: CharacterData, filename?: string): void {

        try {
            const dataToExport = {
                ...characterData,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `myz-character-${characterData.name || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            
        } catch (error) {
            console.warn('Failed to export character data:', error);
        }
    }

    /**
     * Import character data from JSON file
     */
    public importFromJSON(): Promise<CharacterData | null> {
        return new Promise((resolve, reject) => {
            try {
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
                            console.warn('Failed to parse imported JSON:', error);
                            reject(error);
                        }
                    };
                    reader.onerror = () => {
                        reject(new Error('Failed to read file'));
                    };
                    reader.readAsText(file);
                };

                input.click();
            } catch (error) {
                console.warn('Failed to import character data:', error);
                reject(error);
            }
        });
    }

    /**
     * Start automatic saving to localStorage
     */
    public startAutoSave(getCharacterData: () => CharacterData): void {
        if (this.autoSaveTimer) return;

        this.autoSaveTimer = window.setInterval(() => {
            const data = getCharacterData();
            this.saveToLocalStorage(data);
            
            // Also save to Owlbear if available
            if (OBR.isAvailable) {
                this.saveCharacterData(data);
            }
        }, this.storageOptions.autoSaveInterval);

        
    }

    /**
     * Stop automatic saving
     */
    public stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            
        }
    }

    /**
     * Configure storage options
     */
    public configureStorage(options: Partial<StorageOptions>): void {
        this.storageOptions = { ...this.storageOptions, ...options };
        
        // Restart auto-save if interval changed and auto-save is active
        if (this.autoSaveTimer && options.autoSaveInterval) {
            this.stopAutoSave();
            // Note: startAutoSave will need to be called again with the getCharacterData function
        }
    }

    /**
     * Get current storage configuration
     */
    public getStorageConfig(): StorageOptions {
        return { ...this.storageOptions };
    }

    /**
     * Save character data using the best available method
     */
    public async saveCharacterDataUniversal(characterData: CharacterData): Promise<void> {
        // Always save to localStorage as backup
        this.saveToLocalStorage(characterData);
        
        // Also save to Owlbear if available
        if (OBR.isAvailable) {
            await this.saveCharacterData(characterData);
        }
    }

    /**
     * Load character data using the best available method
     */
    public async loadCharacterDataUniversal(): Promise<CharacterData | null> {
        let data: CharacterData | null = null;
        
        // Try to load from Owlbear first (if available)
        if (OBR.isAvailable) {
            data = await this.loadCharacterData();
        }
        
        // Fall back to localStorage if no Owlbear data
        if (!data) {
            data = this.loadFromLocalStorage();
        }
        
        return data;
    }

    /**
     * Clean up resources (call this when the component is destroyed)
     */
    public cleanup(): void {
        this.stopAutoSave();
        
    }
}

// Create singleton instance
export const owlbearIntegration = new OwlbearIntegration();

// Utility functions for common operations
export function useOwlbearResize() {
    return {
        setSize: async (width: number, height: number) => {
            await owlbearIntegration.setSize(width, height);
        },
        isInOwlbear: owlbearIntegration.isOwlbearEnvironment
    };
}

export function useOwlbearSync(getCharacterData: () => CharacterData) {
    return {
        syncNow: () => owlbearIntegration.saveCharacterData(getCharacterData()),
        loadData: () => owlbearIntegration.loadCharacterData(),
        setupAutoSync: (interval?: number) => owlbearIntegration.setupAutoSync(getCharacterData, interval),
        isInOwlbear: owlbearIntegration.isOwlbearEnvironment,
        
        // Universal storage methods (localStorage + Owlbear)
        saveUniversal: () => owlbearIntegration.saveCharacterDataUniversal(getCharacterData()),
        loadUniversal: () => owlbearIntegration.loadCharacterDataUniversal(),
        startAutoSave: () => owlbearIntegration.startAutoSave(getCharacterData),
        stopAutoSave: () => owlbearIntegration.stopAutoSave(),
        
        // localStorage specific methods
        saveLocal: () => owlbearIntegration.saveToLocalStorage(getCharacterData()),
        loadLocal: () => owlbearIntegration.loadFromLocalStorage(),
        clearLocal: () => owlbearIntegration.clearLocalStorage(),
        
        // JSON export/import
        exportJSON: (filename?: string) => owlbearIntegration.exportToJSON(getCharacterData(), filename),
        importJSON: () => owlbearIntegration.importFromJSON(),
        
        // Storage configuration
        configureStorage: (options: Partial<StorageOptions>) => owlbearIntegration.configureStorage(options),
        getStorageConfig: () => owlbearIntegration.getStorageConfig()
    };
}

export function useLocalStorage(getCharacterData: () => CharacterData) {
    return {
        save: () => owlbearIntegration.saveToLocalStorage(getCharacterData()),
        load: () => owlbearIntegration.loadFromLocalStorage(),
        clear: () => owlbearIntegration.clearLocalStorage(),
        exportJSON: (filename?: string) => owlbearIntegration.exportToJSON(getCharacterData(), filename),
        importJSON: () => owlbearIntegration.importFromJSON(),
        startAutoSave: () => owlbearIntegration.startAutoSave(getCharacterData),
        stopAutoSave: () => owlbearIntegration.stopAutoSave(),
        configureStorage: (options: Partial<StorageOptions>) => owlbearIntegration.configureStorage(options),
        getStorageConfig: () => owlbearIntegration.getStorageConfig()
    };
}

export default owlbearIntegration;
