/**
 * Owlbear Rodeo Integration utilities
 * Provides methods to communicate with Owlbear Rodeo using the official SDK
 * Also includes localStorage failsafe and JSON export/import functionality
 */

import OBR from "@owlbear-rodeo/sdk";
import { checkDicePluginAvailability } from "./diceUtils";
import { sheetState } from "../states/character_sheet.svelte";
import type { CharacterSheetData } from "../states/character_sheet.svelte";

export function getExtensionId(path: string): string {
    return `rodeo.owlbear.myz_character_sheet/${path}`;
}


export interface StorageOptions {
    useLocalStorage: boolean;
    autoSaveInterval: number; // in milliseconds
    storageKey: string;
    currentCharacterKey: string; // Last character ID used for auto-save
}

class OwlbearIntegration {
    private characterData: CharacterSheetData | null = null;
    private autoSaveTimer: number | null = null;
    private storageOptions: StorageOptions = {
        useLocalStorage: true,
        autoSaveInterval: 5000, // Auto-save every 5 seconds
        storageKey: 'myz-character-sheet-data',
        currentCharacterKey: 'current-character-id'
    };
    private static readonly TIMER_ID_KEY = 'myz-autosave-timer-id';

    constructor() {
        // Clear any existing auto-save timers from previous sessions
        this.clearExistingTimers();
        
        this.initializeOBR();
    }

    /**
     * Clear any existing auto-save timers from previous page sessions
     */
    private clearExistingTimers(): void {
        try {
            const savedTimerId = localStorage.getItem(OwlbearIntegration.TIMER_ID_KEY);
            if (savedTimerId) {
                const timerId = parseInt(savedTimerId);
                clearInterval(timerId);
                localStorage.removeItem(OwlbearIntegration.TIMER_ID_KEY);
                console.log('Cleared existing auto-save timer from previous session:', timerId);
            }
        } catch (error) {
            console.warn('Failed to clear existing timers:', error);
        }
    }


    /**
     * Initialize Owlbear Rodeo SDK
     */
    private async initializeOBR(): Promise<void> {
        try {
            if(!OBR.isAvailable) {
                console.warn('Owlbear Rodeo SDK is not available in this environment');
                return;
            }
            
            OBR.onReady(async () => {
                this.setupCharacterDataListener();
                await checkDicePluginAvailability();
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
                this.characterData = metadata[characterKey] as CharacterSheetData;
            }
        });
    }

    /**
     * Smart save - saves to both Owlbear (if available) and localStorage
     */
    public async save(): Promise<void> {
        sheetState.lastUpdated = Date.now(); // Update timestamp in state
        const data = JSON.parse(JSON.stringify(sheetState)); // Deep copy to avoid reactivity issues

        
        // Also save to Owlbear if available
        if (OBR.isAvailable) {
            try {
                const characterKey = getExtensionId(await OBR.player.getId() + '-' + sheetState.id);
                await OBR.room.setMetadata({
                    [characterKey]: data
                });
            } catch (error) {
                console.warn('Failed to save to Owlbear, but saved to localStorage:', error);
            }
        } else {
            this.saveToLocalStorage(data);
        }
    }

    public configureStorage(options: Partial<StorageOptions>): void {
        this.storageOptions = { ...this.storageOptions, ...options };
        
        // Restart auto-save if interval changed and auto-save is active
        if (this.autoSaveTimer && options.autoSaveInterval) {
            this.stopAutoSave();
        }
    }

        /**
     * Get current storage configuration
     */
    public getStorageConfig(): StorageOptions {
        return { ...this.storageOptions };
    }


    saveToLocalStorage(CharacterSheetData: CharacterSheetData): void {
        try {
            CharacterSheetData.lastUpdated = Date.now();
            localStorage.setItem(this.storageOptions.storageKey + sheetState.id, JSON.stringify(CharacterSheetData));
            localStorage.setItem(this.storageOptions.currentCharacterKey, sheetState.id);
            console.log('Character data saved to localStorage');
        } catch (error) {
            console.warn('Failed to save character data to localStorage:', error);
        }
    }

    /**
     * Load character data from localStorage
     */
    loadFromLocalStorage(characterId: string): CharacterSheetData | null {
        try {
            const savedData = localStorage.getItem(this.storageOptions.storageKey + characterId);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                return parsedData;
            }
        } catch (error) {
            console.warn('Failed to load character data from localStorage:', error);
        }
        return null;
    }

    getStoredCharactersFromLocalStorage(): {id: string, name: string, occupation: string}[] {
        const characters: {id: string, name: string, occupation: string}[] = [];
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storageOptions.storageKey));
            for (const key of keys) {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                if (data && data.id && data.name) {
                    characters.push({
                        id: data.id,
                        name: data.name,
                        occupation: data.occupation || ''
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to get stored characters from localStorage:', error);
        }
        return characters;
    }

    /**
     * Smart load - loads from Owlbear first, then falls back to localStorage
     */
    public async load(characterId: string): Promise<CharacterSheetData | null> {
        // Try to load from Owlbear first (if available)
        if (!OBR.isAvailable || !OBR.isReady) {
            console.debug('Owlbear not available, falling back to localStorage');
            return this.loadFromLocalStorage(characterId);
        }

        try {
            const metadata = await OBR.room.getMetadata();
            const characterKey = getExtensionId(await OBR.player.getId()) + '-' + characterId;
            const owlBearData = metadata[characterKey] as CharacterSheetData || null;

            if (owlBearData) {
                console.log('Loaded from Owlbear');
                return owlBearData;
            }
            return null;
        } catch (error) {
            console.warn('Failed to load from Owlbear:', error);
            return null;
        }
        

    }

    public async getStoredCharacters(): Promise<{id: string, name: string, occupation: string}[]> {
        if (!OBR.isAvailable || !OBR.isReady) {
            console.debug('Owlbear not available, falling back to localStorage');
            return this.getStoredCharactersFromLocalStorage();
        }

        try {
            const metadata = await OBR.room.getMetadata();
            const characters: {id: string, name: string, occupation: string}[] = [];
            const characterKeyPrefix = getExtensionId(await OBR.player.getId());

            for (const key in metadata) {
                if (key.startsWith(characterKeyPrefix)) {
                    const characterData = metadata[key] as CharacterSheetData;
                    if (characterData) {
                        characters.push({
                            id: characterData.id,
                            name: characterData.name,
                            occupation: characterData.occupation || ''
                        });
                    }
                }
            }

            return characters;
        } catch (error) {
            console.warn('Failed to get stored characters:', error);
            return [];
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
    public async notifyCharacterUpdate(CharacterSheetData: CharacterSheetData): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            // Use the broadcast API to notify other players
            await OBR.broadcast.sendMessage('character-sheet-update', {
                CharacterSheetData,
                timestamp: Date.now()
            });
        } catch (error) {
            console.warn('Failed to broadcast character update:', error);
        }
    }

    /**
     * Export character data as JSON file
     */
    public exportToJSON(CharacterSheetData: CharacterSheetData, filename?: string): void {

        try {
            const dataToExport = {
                ...CharacterSheetData,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `myz-character-${CharacterSheetData.name || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
            
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
    public importFromJSON(): Promise<CharacterSheetData | null> {
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
    public startAutoSave(): void {
        if (this.autoSaveTimer) return;

        this.autoSaveTimer = window.setInterval(() => {
            console.log('Auto-saving character data to localStorage');
            this.save();
        }, this.storageOptions.autoSaveInterval);

        // Store the timer ID in localStorage so we can clear it on page reload
        try {
            localStorage.setItem(OwlbearIntegration.TIMER_ID_KEY, this.autoSaveTimer.toString());
        } catch (error) {
            console.warn('Failed to store timer ID:', error);
        }

        console.log('Auto-save started with interval:', this.storageOptions.autoSaveInterval);
    }

    /**
     * Stop automatic saving
     */
    public stopAutoSave(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            
            // Remove the stored timer ID
            try {
                localStorage.removeItem(OwlbearIntegration.TIMER_ID_KEY);
            } catch (error) {
                console.warn('Failed to remove timer ID from localStorage:', error);
            }
            
            console.log('Auto-save stopped');
        }
    }

    public async deleteCharacter(characterId: string): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            const characterKey = getExtensionId(await OBR.player.getId()) + '-' + characterId;
            await OBR.room.setMetadata({
                [characterKey]: null // Set to null to delete
            });
            console.log(`Character ${characterId} deleted from Owlbear`);
        } catch (error) {
            console.warn(`Failed to delete character ${characterId}:`, error);
        }
    }


    public async resetData(): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            // Clear all character data in Owlbear
            const metadata = await OBR.room.getMetadata();
            const characterKeyPrefix = getExtensionId(await OBR.player.getId());
            for (const key in metadata) {
                if (key.startsWith(characterKeyPrefix)) {
                    await OBR.room.setMetadata({
                        [key]: null // Set to null to delete
                    });
                }
            }
            console.log('All character data reset in Owlbear');
        } catch (error) {
            console.warn('Failed to reset character data:', error);
        }
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



export default owlbearIntegration;
