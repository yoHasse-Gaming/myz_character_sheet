/**
 * Owlbear Rodeo Integration utilities
 * Provides methods to communicate with Owlbear Rodeo when running as a popover
 */

interface OwlbearMessage {
    type: string;
    data?: any;
}

interface SizeData {
    width: number;
    height: number;
}

class OwlbearIntegration {
    private isInOwlbear: boolean = false;
    private callbacks: Map<string, Function[]> = new Map();
    private isBrowser: boolean = false;

    constructor() {
        this.isBrowser = typeof window !== 'undefined';
        if (this.isBrowser) {
            this.isInOwlbear = this.detectOwlbearEnvironment();
            this.setupMessageListener();
        }
    }

    /**
     * Detect if we're running inside Owlbear Rodeo
     */
    private detectOwlbearEnvironment(): boolean {
        if (!this.isBrowser) return false;
        
        try {
            // Check if we're in an iframe and have access to parent
            return window !== window.parent && 
                   window.location !== window.parent.location &&
                   document.referrer.includes('owlbear.rodeo');
        } catch (e) {
            // Cross-origin restrictions mean we're likely in an iframe
            return window !== window.parent;
        }
    }

    /**
     * Setup listener for messages from Owlbear Rodeo
     */
    private setupMessageListener(): void {
        if (!this.isBrowser) return;
        
        window.addEventListener('message', (event) => {
            if (this.isValidOwlbearMessage(event)) {
                this.handleOwlbearMessage(event.data);
            }
        });
    }

    /**
     * Validate that the message is from Owlbear Rodeo
     */
    private isValidOwlbearMessage(event: MessageEvent): boolean {
        // Add validation logic based on Owlbear Rodeo's message format
        return event.data && typeof event.data === 'object' && event.data.type;
    }

    /**
     * Handle messages from Owlbear Rodeo
     */
    private handleOwlbearMessage(message: OwlbearMessage): void {
        const callbacks = this.callbacks.get(message.type) || [];
        callbacks.forEach(callback => callback(message.data));
    }

    /**
     * Register a callback for a specific message type
     */
    public on(messageType: string, callback: Function): void {
        if (!this.callbacks.has(messageType)) {
            this.callbacks.set(messageType, []);
        }
        this.callbacks.get(messageType)!.push(callback);
    }

    /**
     * Remove a callback for a specific message type
     */
    public off(messageType: string, callback: Function): void {
        const callbacks = this.callbacks.get(messageType) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Send a message to Owlbear Rodeo
     */
    public sendMessage(type: string, data?: any): void {
        if (this.isInOwlbear && this.isBrowser && window.parent) {
            try {
                window.parent.postMessage({ type, data }, '*');
            } catch (e) {
                console.warn('Failed to send message to Owlbear Rodeo:', e);
            }
        }
    }

    /**
     * Request to resize the popover
     */
    public requestResize(width: number, height: number): void {
        this.sendMessage('resize', { width, height });
    }

    /**
     * Request to close the popover
     */
    public requestClose(): void {
        this.sendMessage('close');
    }

    /**
     * Send character data to Owlbear Rodeo
     */
    public sendCharacterData(characterData: any): void {
        this.sendMessage('character-update', characterData);
    }

    /**
     * Request character data from Owlbear Rodeo
     */
    public requestCharacterData(): void {
        this.sendMessage('character-request');
    }

    /**
     * Check if we're running in Owlbear Rodeo
     */
    public get isOwlbearEnvironment(): boolean {
        return this.isInOwlbear;
    }

    /**
     * Set up automatic character data sync
     */
    public setupAutoSync(getCharacterData: () => any, interval: number = 30000): void {
        if (!this.isInOwlbear || !this.isBrowser) return;

        // Send initial data
        this.sendCharacterData(getCharacterData());

        // Set up periodic sync
        setInterval(() => {
            this.sendCharacterData(getCharacterData());
        }, interval);
    }
}

// Create singleton instance
export const owlbearIntegration = new OwlbearIntegration();

// Utility functions for common operations
export function useOwlbearResize() {
    return {
        requestResize: (width: number, height: number) => {
            owlbearIntegration.requestResize(width, height);
        },
        isInOwlbear: owlbearIntegration.isOwlbearEnvironment
    };
}

export function useOwlbearSync(getCharacterData: () => any) {
    return {
        syncNow: () => owlbearIntegration.sendCharacterData(getCharacterData()),
        setupAutoSync: (interval?: number) => owlbearIntegration.setupAutoSync(getCharacterData, interval),
        isInOwlbear: owlbearIntegration.isOwlbearEnvironment
    };
}

export default owlbearIntegration;
