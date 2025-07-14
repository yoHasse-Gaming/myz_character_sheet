import OBR from "@owlbear-rodeo/sdk";
import { diceStates, type AvailabilityRequest, type AvailabilityResponse, type DiceRollConfig } from "../states/dice.svelte";



export function getDiceRollerPluginId(path: string) {
    return `rodeo.owlbear.dice/${path}`;
}


export async function focusDiceTray(): Promise<void> {
    // Get player connection ID
    const playerConnectionId = await OBR.player.getConnectionId();
    if (!playerConnectionId) {
        throw new Error("Player ID not available - cannot focus dice tray");
    }

    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel(getDiceRollerPluginId("focused-dice-tray"));
        channel.postMessage(playerConnectionId);
        channel.close();
    }
}

export async function checkDicePluginAvailability(): Promise<void> {
    try {
        console.log("🎲 Checking MYZ Dice plugin availability...");
        // Use broadcast channel to check availability instead of direct window API calls
        const metadataCheck = await checkDiceExtensionMetadata();
        if (!metadataCheck.available) {
            console.log(`🎲 MYZ Dice plugin detected (version: ${metadataCheck.version || 'unknown'})`);
            diceStates.isDicePluginAvailable = false;
            return;
        }

        console.log("🎲 MYZ Dice plugin metadata check passed");

        diceStates.isDicePluginAvailable = true;

        if(metadataCheck.available && !diceStates.broadCastAvailabilityCheck) {
            // Wait 3 seconds before checking broadcast availability
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            
            const broadcastCheck = await checkUsingBroadcastChannel();
            if (!broadcastCheck.available) {
                console.log("🎲 MYZ Dice plugin not found via broadcast");
                diceStates.broadCastAvailabilityCheck = false;
                return;
            }
            diceStates.broadCastAvailabilityCheck = true;
        }

        
        if (metadataCheck.available) {
            console.log(`🎲 MYZ Dice plugin detected (version: ${metadataCheck.version || 'unknown'})`);
        } else {
            console.log("🎲 MYZ Dice plugin not found via broadcast");
        }
    } catch (error) {
        console.warn("🎲 Failed to check dice plugin availability:", error);
        diceStates.isDicePluginAvailable = false;
    }
}

export async function triggerRoll(config: DiceRollConfig): Promise<void> {
    if (!diceStates.isDicePluginAvailable) {
        await checkDicePluginAvailability();
        if (!diceStates.isDicePluginAvailable) {
            throw new Error("MYZ Dice plugin is not available");
        }
    }

    if (!window.BroadcastChannel) {
        throw new Error("BroadcastChannel not supported");
    }

    await focusDiceTray();


    const rollId = `roll-${Date.now()}-${Math.random()}`;

    // Send roll request to dice plugin
    const channel = new BroadcastChannel(getDiceRollerPluginId("myz-dice-integration"));
    channel.postMessage({
        type: "TRIGGER_ROLL",
        rollId,
        config
    });
    channel.close();
}

async function checkDiceExtensionMetadata(): Promise<{ available: boolean; version?: string }> {
    const metadata = await OBR.room?.getMetadata();
    if (!metadata) {
        console.warn("[MYZDiceIntegration] No room metadata found", metadata);
        return { available: false };
    }
    const key = getDiceRollerPluginId("diceRollerReady");
    const metadataValue = metadata[key] as { timestamp?: number; version?: string };
    const { timestamp, version } = metadataValue;
    if (!metadataValue || (!timestamp || !version)) {
        console.warn("[MYZDiceIntegration] MYZ Dice metadata not found:", metadata[key]);
        return { available: false };
    }
    if (Date.now() - timestamp > 60000) { // 1 minute timeout
        console.warn("[MYZDiceIntegration] MYZ Dice metadata is outdated");
        return { available: false };
    }
    return { available: true, version: version };
}

async function checkMYZDiceAvailability(): Promise<{ available: boolean; version?: string }> {
    const metadata = await OBR.room?.getMetadata();
    if (!metadata) {
        console.warn("[MYZDiceIntegration] No room metadata found", metadata);
        return { available: false };
    }

    const key = getDiceRollerPluginId("diceRollerReady");

    const metadataValue = metadata[key] as { timestamp?: number; version?: string };
    const { timestamp, version } = metadataValue;

    
    if (!metadataValue || (!timestamp || !version)) {
        console.warn("[MYZDiceIntegration] MYZ Dice metadata not found:", metadata[key]);
        // Check using BroadcastChannel as fallback
        return await checkUsingBroadcastChannel();
    }

    if( Date.now() - timestamp > 60000) { // 1 minute timeout
        console.warn("[MYZDiceIntegration] MYZ Dice metadata is outdated, checking using BroadcastChannel");
        // Check using BroadcastChannel as fallback
        return await checkUsingBroadcastChannel();
    }


    return { available: true, version: version };

}

async function checkUsingBroadcastChannel(): Promise<{ available: boolean; version?: string }> {
    const timeoutMs = 10000; // Default timeout for availability check
    return new Promise((resolve) => {
        if (!window.BroadcastChannel) {
            console.warn("[MYZDiceIntegration] BroadcastChannel not supported");
            resolve({ available: false });
            return;
        }

        const channel = new BroadcastChannel(getDiceRollerPluginId("myz-dice-integration"));
        const requestId = `availability-${Date.now()}-${Math.random()}`;
        let resolved = false;

        console.log("[MYZDiceIntegration] Checking MYZ Dice availability...");

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                console.log("[MYZDiceIntegration] Availability check timed out");
                channel.close();
                resolve({ available: false });
            }}, timeoutMs);

        channel.onmessage = (event) => {
            const response = event.data as AvailabilityResponse;
            if (response.type !== "AVAILABILITY_RESPONSE" || response.requestId !== requestId) {
                return;
            }

            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                console.log("[MYZDiceIntegration] MYZ Dice availability confirmed:", response);
                channel.close();
                resolve({ available: response.available, version: response.version });
            }
        };

        const request: AvailabilityRequest = {
            type: "CHECK_AVAILABILITY",
            requestId: requestId
        };

        console.log("[MYZDiceIntegration] Sending availability check request:", request);
            channel.postMessage(request);
    });
}
