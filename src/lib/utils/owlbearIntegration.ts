/**
 * Owlbear Rodeo Integration utilities
 * Provides methods to communicate with Owlbear Rodeo using the official SDK
 * Also includes localStorage failsafe and JSON export/import functionality
 */

import OBR from "@owlbear-rodeo/sdk";
import { checkDicePluginAvailability } from "./diceUtils";
import { sheetState } from "../states/character_sheet.svelte";
import type { Armor, BaseAbilityType, Equipment, EquipmentTableItem, Mutation, OptionalSkill, RPRelation, SkillType, Talent, Weapon } from "../types";
import type { CharacterSheet, CharacterSheetData } from "../states/character_sheet.svelte";

export function getExtensionId(path: string): string {
    return `rodeo.owlbear.myz_character_sheet/${path}`;
}


export interface StorageOptions {
    useLocalStorage: boolean;
    autoSaveInterval: number; // in milliseconds
    storageKey: string;
}

class OwlbearIntegration {
    private CharacterSheetData: CharacterSheetData | null = null;
    private autoSaveTimer: number | null = null;
    private storageOptions: StorageOptions = {
        useLocalStorage: true,
        autoSaveInterval: 5000, // Auto-save every 5 seconds
        storageKey: 'myz-character-sheet-data'
    };
    private static readonly TIMER_ID_KEY = 'myz-autosave-timer-id';

    constructor() {
        // Clear any existing auto-save timers from previous sessions
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
                this.setupCharacterSheetDataListener();

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
    private setupCharacterSheetDataListener(): void {
        if (!OBR.isAvailable) return;
        // Listen for room metadata changes where character data might be stored
        OBR.room.onMetadataChange(async (metadata: any) => {
            const characterKey = getExtensionId(await OBR.player.getId());
            if (metadata[characterKey]) {
                this.CharacterSheetData = metadata[characterKey] as CharacterSheetData;
            }
        });
    }

    /**
     * Save character data to Owlbear room metadata
     */
    public async saveCharacterSheetData(CharacterSheetData: CharacterSheetData): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            const characterKey = getExtensionId(await OBR.player.getId());
            await OBR.room.setMetadata({
                [characterKey]: {
                    ...CharacterSheetData,
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
    public async loadCharacterSheetData(): Promise<CharacterSheetData | null> {
        if (!OBR.isAvailable) return null;

        try {
            const metadata = await OBR.room.getMetadata();
            const characterKey = getExtensionId(await OBR.player.getId());
            return metadata[characterKey] as CharacterSheetData || null;
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
    public setupAutoSync(getCharacterSheetData: () => CharacterSheetData, interval: number = 30000): void {
        if (!OBR.isAvailable) return;

        // Send initial data
        this.saveCharacterSheetData(getCharacterSheetData());

        // Set up periodic sync
        setInterval(() => {
            this.saveCharacterSheetData(getCharacterSheetData());
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
     * LOCALSTORAGE METHODS
     */

    /**
     * Save character data to localStorage
     */
    public saveToLocalStorage(CharacterSheetData: CharacterSheetData): void {
        if (!this.storageOptions.useLocalStorage) return;

        try {
            const dataToSave = {
                ...CharacterSheetData,
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
    public loadFromLocalStorage(): CharacterSheetData | null {
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

            this.saveToLocalStorage(sheetState);
            
            // Also save to Owlbear if available
            if (OBR.isAvailable) {
                this.saveCharacterSheetData(sheetState);
            }
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

    /**
     * Check if auto-save is currently running
     */
    public isAutoSaveRunning(): boolean {
        return this.autoSaveTimer !== null;
    }

    /**
     * Force clear all auto-save timers (for debugging)
     */
    public forceStopAllTimers(): void {
        // Stop current timer
        this.stopAutoSave();
        
        // Clear any stored timer ID and try to clear it
        try {
            const savedTimerId = localStorage.getItem(OwlbearIntegration.TIMER_ID_KEY);
            if (savedTimerId) {
                const timerId = parseInt(savedTimerId);
                clearInterval(timerId);
                localStorage.removeItem(OwlbearIntegration.TIMER_ID_KEY);
                console.log('Force cleared timer:', timerId);
            }
        } catch (error) {
            console.warn('Failed to force clear timers:', error);
        }
        
        console.log('All auto-save timers force stopped');
    }

    /**
     * Configure storage options
     */
    public configureStorage(options: Partial<StorageOptions>): void {
        this.storageOptions = { ...this.storageOptions, ...options };
        
        // Restart auto-save if interval changed and auto-save is active
        if (this.autoSaveTimer && options.autoSaveInterval) {
            this.stopAutoSave();
            // Note: startAutoSave will need to be called again with the getCharacterSheetData function
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
    public async saveCharacterSheetDataUniversal(CharacterSheetData: CharacterSheetData): Promise<void> {
        // Always save to localStorage as backup
        this.saveToLocalStorage(CharacterSheetData);
        
        // Also save to Owlbear if available
        if (OBR.isAvailable) {
            await this.saveCharacterSheetData(CharacterSheetData);
        }
    }

    /**
     * Load character data using the best available method
     */
    public async loadCharacterSheetDataUniversal(): Promise<CharacterSheetData | null> {
        let data: CharacterSheetData | null = null;

        // Try to load from Owlbear first (if available)
        if (OBR.isAvailable) {
            data = await this.loadCharacterSheetData();
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

export function useOwlbearSync() {
    return {
        syncNow: () => owlbearIntegration.saveCharacterSheetData(sheetState),
        loadData: () => owlbearIntegration.loadCharacterSheetData(),
        setupAutoSync: (interval?: number) => owlbearIntegration.setupAutoSync(() => sheetState, interval),
        isInOwlbear: owlbearIntegration.isOwlbearEnvironment,
        
        // Universal storage methods (localStorage + Owlbear)
        saveUniversal: () => owlbearIntegration.saveCharacterSheetDataUniversal(sheetState),
        loadUniversal: () => owlbearIntegration.loadCharacterSheetDataUniversal(),
        startAutoSave: () => owlbearIntegration.startAutoSave(),
        stopAutoSave: () => owlbearIntegration.stopAutoSave(),
        isAutoSaveRunning: () => owlbearIntegration.isAutoSaveRunning(),
        forceStopAllTimers: () => owlbearIntegration.forceStopAllTimers(),
        
        // localStorage specific methods
        saveLocal: () => owlbearIntegration.saveToLocalStorage(sheetState),
        loadLocal: () => owlbearIntegration.loadFromLocalStorage(),
        clearLocal: () => owlbearIntegration.clearLocalStorage(),
        
        // JSON export/import
        exportJSON: (filename?: string) => owlbearIntegration.exportToJSON(sheetState, filename),
        importJSON: () => owlbearIntegration.importFromJSON(),
        
        // Storage configuration
        configureStorage: (options: Partial<StorageOptions>) => owlbearIntegration.configureStorage(options),
        getStorageConfig: () => owlbearIntegration.getStorageConfig()
    };
}

export function useLocalStorage() {
    return {
        save: () => owlbearIntegration.saveToLocalStorage(sheetState),
        load: () => owlbearIntegration.loadFromLocalStorage(),
        clear: () => owlbearIntegration.clearLocalStorage(),
        exportJSON: (filename?: string) => owlbearIntegration.exportToJSON(sheetState, filename),
        importJSON: () => owlbearIntegration.importFromJSON(),
        startAutoSave: () => owlbearIntegration.startAutoSave(),
        stopAutoSave: () => owlbearIntegration.stopAutoSave(),
        isAutoSaveRunning: () => owlbearIntegration.isAutoSaveRunning(),
        forceStopAllTimers: () => owlbearIntegration.forceStopAllTimers(),
        configureStorage: (options: Partial<StorageOptions>) => owlbearIntegration.configureStorage(options),
        getStorageConfig: () => owlbearIntegration.getStorageConfig()
    };
}

export default owlbearIntegration;
