
export const diceStates = $state({
    isDicePluginAvailable: false,
    isLoading: false,
    error: null as string | null,
    lastRoll: null as DiceResult | null,
});



export interface DiceRollConfig {
    dice: {
        style: "MYZBASE" | "MYZSKILL" | "MYZGEAR";
        count?: number;
    }[];
    hidden?: boolean;
}
export interface DiceResult {
    playerId: string;
    playerName: string;
    individualResults: Record<string, number>;
    finalValue: number;
    timestamp: number;
}

export interface ExternalRollRequest {
    type: "TRIGGER_ROLL";
    rollId: string;
    config: DiceRollConfig;
}

export interface AvailabilityRequest {
    type: "CHECK_AVAILABILITY";
    requestId: string;
}

export interface AvailabilityResponse {
    type: "AVAILABILITY_RESPONSE";
    requestId: string;
    available: boolean;
    version?: string;
}

