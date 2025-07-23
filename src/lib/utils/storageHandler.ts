import { sheetState, type CharacterSheetData } from "../states/character_sheet.svelte";



export interface StorageOptions {
    autoSaveInterval: number;
    storageKey: string;
    currentCharacterKey: string;
}


class StorageHandler {
    private autoSaveTimer: number | null = null;
    private storageOptions: StorageOptions = {
        autoSaveInterval: 5000,
        storageKey: 'myz-character-sheet-data',
        currentCharacterKey: 'current-character-id'
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
        
        // Restart auto-save if interval changed and auto-save is active
        if (this.autoSaveTimer && options.autoSaveInterval) {
            this.stopAutoSave();
        }
    }

    public getStorageConfig(): StorageOptions {
        return { ...this.storageOptions };
    }

    public async save(): Promise<void> {
        sheetState.lastUpdated = Date.now();
        const data = JSON.parse(JSON.stringify(sheetState));
        this.saveToLocalStorage(data);
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
        try {
            const savedData = localStorage.getItem(this.storageOptions.storageKey + characterId);
            return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return null;
        }
    }

    public async getStoredCharacters(): Promise<{id: string, name: string, occupation: string}[]> {
        const characters: {id: string, name: string, occupation: string}[] = [];
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storageOptions.storageKey));
            for (const key of keys) {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                if (data?.id && data?.name) {
                    characters.push({
                        id: data.id,
                        name: data.name,
                        occupation: data.occupation || ''
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to get stored characters:', error);
        }
        return characters;
    }

    public async deleteCharacter(characterId: string): Promise<void> {
        try {
            localStorage.removeItem(this.storageOptions.storageKey + characterId);
        } catch (error) {
            console.warn(`Failed to delete character ${characterId}:`, error);
        }
    }

    public async resetData(): Promise<void> {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storageOptions.storageKey));
            keys.forEach(key => localStorage.removeItem(key));
            localStorage.removeItem(this.storageOptions.currentCharacterKey);
        } catch (error) {
            console.warn('Failed to reset data:', error);
        }
    }



        // Export/Import methods
    public exportToJSON(data: CharacterSheetData, filename?: string): void {
        try {
            const dataToExport = {
                ...data,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `myz-character-${data.name || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.warn('Failed to export character data:', error);
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

    // Auto-save methods
    public startAutoSave(): void {
        if (this.autoSaveTimer) return;

        this.autoSaveTimer = window.setInterval(() => {
            this.save();
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
}

export const storageHandler = new StorageHandler();
export default storageHandler;