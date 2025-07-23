/**
 * Owlbear Rodeo Integration utilities
 * Provides Owlbear Rodeo SDK integration and localStorage-based character data management
 */

import OBR from "@owlbear-rodeo/sdk";
import { checkDicePluginAvailability } from "./diceUtils";


class OwlbearIntegration {

    constructor() {
        this.initializeOBR();
    }

    private async initializeOBR(): Promise<void> {
        if (OBR.isAvailable) {
            OBR.onReady(async () => {
                await checkDicePluginAvailability();
            });
        }
    }



    public get isOwlbearEnvironment(): boolean {
        return OBR.isAvailable;
    }

    public async getPlayerInfo() {
        if (!OBR.isAvailable) return null;
        try {
            const name = await OBR.player.getName();
            const role = await OBR.player.getRole();
            const id = await OBR.player.getId();
            return { name, role, id };
        } catch (error) {
            console.warn('Failed to get player info:', error);
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

    public async close(): Promise<void> {
        if (!OBR.isAvailable) return;
        try {
            await OBR.action.close();
        } catch (error) {
            console.warn('Failed to close popover:', error);
        }
    }

}

    // Utility functions for common operations
export function useOwlbearResize() {
    return {
        setSize: async (width: number, height: number) => {
            await owlbearIntegration.setSize(width, height);
        },
        isInOwlbear: OBR.isAvailable
    };
}


export const owlbearIntegration = new OwlbearIntegration();
export default owlbearIntegration;
