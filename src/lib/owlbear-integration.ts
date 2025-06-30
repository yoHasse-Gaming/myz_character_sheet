/**
 * Owlbear Rodeo Integration utilities
 * Provides methods to communicate with Owlbear Rodeo using the official SDK
 */

interface CharacterData {
    name: string;
    baseAbilities: any[];
    skills: any[];
    conditions: any;
    // Add other character sheet properties as needed
}

class OwlbearIntegration {
    private isInitialized: boolean = false;
    private characterData: CharacterData | null = null;
    private isBrowser: boolean = false;
    private OBR: any = null;

    constructor() {
        this.isBrowser = typeof window !== 'undefined';
        if (this.isBrowser) {
            this.initializeOBR();
        }
    }

    /**
     * Initialize Owlbear Rodeo SDK
     */
    private async initializeOBR(): Promise<void> {
        console.log('Initializing Owlbear Rodeo SDK...');
        if (!this.isBrowser) return;
        
        try {
            // Dynamic import to avoid SSR issues
            const { default: OBR } = await import('@owlbear-rodeo/sdk');
            this.OBR = OBR;

            console.log('Owlbear Rodeo SDK loaded:', this.OBR);

            if(!OBR.isAvailable) {
                console.warn('Owlbear Rodeo SDK is not available in this environment');
                return;
            }
            
            // Wait for OBR to be ready
            await this.OBR.onReady(() => {
                this.isInitialized = true;
                console.log('🦉 Owlbear Rodeo SDK initialized successfully');
                
                // Set up the extension metadata
                this.setupExtension();
                
                // Listen for character data updates
                this.setupCharacterDataListener();
                console.log('Character data listener set up');
            });
        } catch (error) {
            console.warn('Owlbear Rodeo SDK not available:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Set up extension metadata
     */
    private async setupExtension(): Promise<void> {
        if (!this.isInitialized || !this.OBR) return;

        try {
            // Set the extension metadata for action/popover
            await this.OBR.action.setTitle('Mutant: Year Zero Character Sheet');
            await this.OBR.action.setIcon('/favicon.png');
            await this.OBR.action.setWidth(800);
            await this.OBR.action.setHeight(600);
        } catch (error) {
            console.warn('Failed to set up extension metadata:', error);
        }
    }

    /**
     * Set up listener for character data changes
     */
    private setupCharacterDataListener(): void {
        if (!this.isInitialized || !this.OBR) return;

        // Listen for room metadata changes where character data might be stored
        this.OBR.room.onMetadataChange((metadata: any) => {
            const characterKey = `myz-character-sheet`;
            if (metadata[characterKey]) {
                this.characterData = metadata[characterKey] as CharacterData;
                console.log('Character data updated from Owlbear:', this.characterData);
            }
        });
    }

    /**
     * Save character data to Owlbear room metadata
     */
    public async saveCharacterData(characterData: CharacterData): Promise<void> {
        if (!this.isInitialized || !this.OBR) return;

        try {
            const characterKey = `myz-character-sheet`;
            await this.OBR.room.setMetadata({
                [characterKey]: {
                    ...characterData,
                    lastUpdated: Date.now()
                }
            });
            console.log('Character data saved to Owlbear room');
        } catch (error) {
            console.warn('Failed to save character data:', error);
        }
    }

    /**
     * Load character data from Owlbear room metadata
     */
    public async loadCharacterData(): Promise<CharacterData | null> {
        if (!this.isInitialized || !this.OBR) return null;

        try {
            const metadata = await this.OBR.room.getMetadata();
            const characterKey = `myz-character-sheet`;
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
        if (!this.isInitialized || !this.OBR) return;

        try {
            await this.OBR.action.setWidth(width);
            await this.OBR.action.setHeight(height);
            console.log(`Popover size set to ${width}x${height}`);
        } catch (error) {
            console.warn('Failed to set popover size:', error);
        }
    }

    /**
     * Close the popover
     */
    public async close(): Promise<void> {
        if (!this.isInitialized || !this.OBR) return;

        try {
            await this.OBR.action.close();
        } catch (error) {
            console.warn('Failed to close popover:', error);
        }
    }

    /**
     * Check if we're running in Owlbear Rodeo
     */
    public get isOwlbearEnvironment(): boolean {
        return this.isInitialized;
    }

    /**
     * Set up automatic character data sync
     */
    public setupAutoSync(getCharacterData: () => CharacterData, interval: number = 30000): void {
        if (!this.isInitialized || !this.isBrowser) return;

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
        if (!this.isInitialized || !this.OBR) return null;

        try {
            const name = await this.OBR.player.getName();
            const role = await this.OBR.player.getRole();
            const id = await this.OBR.player.getId();
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
        if (!this.isInitialized || !this.OBR) return;

        try {
            // Use the broadcast API to notify other players
            await this.OBR.broadcast.sendMessage('character-sheet-update', {
                characterData,
                timestamp: Date.now()
            });
        } catch (error) {
            console.warn('Failed to broadcast character update:', error);
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

export function useOwlbearSync(getCharacterData: () => CharacterData) {
    return {
        syncNow: () => owlbearIntegration.saveCharacterData(getCharacterData()),
        loadData: () => owlbearIntegration.loadCharacterData(),
        setupAutoSync: (interval?: number) => owlbearIntegration.setupAutoSync(getCharacterData, interval),
        isInOwlbear: owlbearIntegration.isOwlbearEnvironment
    };
}

export default owlbearIntegration;
