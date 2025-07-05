/**
 * Self-contained dice integration for YOUR plugin
 * This file goes in YOUR plugin and can trigger rolls if the MYZ Dice plugin is available
 */

// Type definitions (copy these to your plugin)
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

// SSR-safe dynamic import wrapper
class OBRWrapper {
  private obr: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return this.obr;
    
    if (typeof window === 'undefined') {
      this.initialized = true;
      return null;
    }

    try {
      const { default: OBR } = await import("@owlbear-rodeo/sdk");
      this.obr = OBR;
      this.initialized = true;
      return this.obr;
    } catch (error) {
      console.warn("Failed to load Owlbear Rodeo SDK:", error);
      this.initialized = true;
      return null;
    }
  }

  get instance() {
    return this.obr;
  }

  get isAvailable() {
    return this.obr !== null;
  }
}

const obrWrapper = new OBRWrapper();

// Type definitions (copy these to your plugin)
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

/**
 * Dice integration class for your plugin
 * Detects if MYZ Dice plugin is available and provides roll triggering
 */
export class DiceRollerIntegration {
  private eventTarget = new EventTarget();
  private isDicePluginAvailable = false;
  private pendingRolls = new Map<string, { resolve: (result: DiceResult) => void; reject: (error: Error) => void }>();
  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  private async initialize() {
    // Initialize OBR wrapper
    await obrWrapper.initialize();
    
    if (!obrWrapper.isAvailable) {
      console.warn("OBR SDK not available - dice integration disabled");
      return;
    }

    // Check if dice plugin is available by looking for its metadata keys
    await this.checkDicePluginAvailability();
    
    // Set up listeners if available
    if (this.isDicePluginAvailable) {
      this.setupDiceListeners();
    }
  }

  /**
   * Wait for the integration to be fully initialized
   */
  public async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  /**
   * Check if the MYZ Dice plugin is available
   */
  private async checkDicePluginAvailability(): Promise<void> {
    if (!obrWrapper.isAvailable) return;
    
    try {
      const players = await obrWrapper.instance.party.getPlayers();
      
      // Check if any player has dice plugin metadata (indicates plugin is loaded)
      const hasDiceMetadata = players.some((player: any) => 
        player.metadata["rodeo.owlbear.dice/roll"] !== undefined ||
        player.metadata["rodeo.owlbear.dice/rollValues"] !== undefined
      );
      
      // Also check if we can access the dice plugin's stores (more reliable)
      try {
        // Try to access the dice plugin's window globals (if they exist)
        const hasDiceStores = (window as any).MYZDiceAPI !== undefined;
        this.isDicePluginAvailable = hasDiceMetadata || hasDiceStores;
      } catch {
        this.isDicePluginAvailable = hasDiceMetadata;
      }
      
      console.log(`MYZ Dice plugin ${this.isDicePluginAvailable ? 'detected' : 'not found'}`);
    } catch (error) {
      console.warn("Failed to check dice plugin availability:", error);
      this.isDicePluginAvailable = false;
    }
  }

  /**
   * Set up listeners for dice results
   */
  private setupDiceListeners() {
    if (!obrWrapper.isAvailable) return;
    
    obrWrapper.instance.party.onChange((players: any) => {
      players.forEach((player: any) => {
        const rollValues = player.metadata["rodeo.owlbear.dice/rollValues"] as Record<string, number | null> | undefined;
        
        if (rollValues) {
          const allFinished = Object.values(rollValues).every(value => value !== null);
          
          if (allFinished) {
            const individualResults: Record<string, number> = {};
            let finalValue = 0;
            
            for (const [id, value] of Object.entries(rollValues)) {
              if (value !== null) {
                individualResults[id] = value;
                finalValue += value;
              }
            }
            
            const result: DiceResult = {
              playerId: player.id,
              playerName: player.name,
              individualResults,
              finalValue,
              timestamp: Date.now()
            };
            
            // Resolve pending promises
            const pendingEntries = Array.from(this.pendingRolls.entries());
            pendingEntries.forEach(([rollId, { resolve }]) => {
              resolve(result);
              this.pendingRolls.delete(rollId);
            });
            
            // Emit event
            this.eventTarget.dispatchEvent(new CustomEvent("dice-complete", { detail: result }));
          }
        }
      });
    });
  }

  /**
   * Check if dice plugin is available
   */
  public async isDiceAvailable(): Promise<boolean> {
    await this.checkDicePluginAvailability();
    return this.isDicePluginAvailable;
  }

  /**
   * Trigger a dice roll (only works if dice plugin is available)
   */
  public async triggerRoll(config: DiceRollConfig): Promise<DiceResult> {
    if (!this.isDicePluginAvailable) {
      throw new Error("MYZ Dice plugin is not available");
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Method 1: Try to use global API if exposed
        if ((window as any).MYZDiceAPI) {
          const api = (window as any).MYZDiceAPI;
          const result = await api.triggerRoll(config);
          resolve(result);
          return;
        }

        // Method 2: Use BroadcastChannel to communicate with dice plugin
        await this.triggerRollViaBroadcast(config, resolve, reject);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to trigger dice roll"));
      }
    });
  }

  private async triggerRollViaBroadcast(
    config: DiceRollConfig,
    resolve: (result: DiceResult) => void,
    reject: (error: Error) => void
  ) {
    if (!window.BroadcastChannel) {
      throw new Error("BroadcastChannel not supported");
    }

    const rollId = `roll-${Date.now()}-${Math.random()}`;
    this.pendingRolls.set(rollId, { resolve, reject });

    // Send roll request to dice plugin
    const channel = new BroadcastChannel("myz-dice-integration");
    channel.postMessage({
      type: "TRIGGER_ROLL",
      rollId,
      config
    });
    channel.close();

    // Timeout
    setTimeout(() => {
      if (this.pendingRolls.has(rollId)) {
        this.pendingRolls.delete(rollId);
        reject(new Error("Dice roll timed out"));
      }
    }, 10000);
  }

  /**
   * Listen for dice roll completions
   */
  public onDiceComplete(callback: (result: DiceResult) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<DiceResult>;
      callback(customEvent.detail);
    };
    
    this.eventTarget.addEventListener("dice-complete", handler);
    
    return () => {
      this.eventTarget.removeEventListener("dice-complete", handler);
    };
  }

  /**
   * Trigger roll without waiting for result
   */
  public async triggerRollAsync(config: DiceRollConfig): Promise<void> {
    if (!this.isDicePluginAvailable) {
      throw new Error("MYZ Dice plugin is not available");
    }

    // Just trigger without waiting
    this.triggerRoll(config).catch(error => {
      console.warn("Background dice roll failed:", error);
    });
  }

  /**
   * Show the dice plugin UI for manual rolling
   */
  public async openDicePlugin(): Promise<void> {
    if (!obrWrapper.isAvailable) {
      throw new Error("OBR SDK not available");
    }
    await obrWrapper.instance.action.open();
  }

  /**
   * Get current dice state
   */
  public async getCurrentDiceState(): Promise<any[]> {
    if (!obrWrapper.isAvailable) {
      return [];
    }
    
    const players = await obrWrapper.instance.party.getPlayers();
    
    return players.map((player: any) => {
      const rollValues = player.metadata["rodeo.owlbear.dice/rollValues"];
      const isRolling = rollValues && Object.values(rollValues).some((v: any) => v === null);
      
      let finalValue: number | undefined;
      if (rollValues && Object.values(rollValues).every((v: any) => v !== null)) {
        finalValue = Object.values(rollValues).reduce((sum: number, value: any) => sum + value, 0);
      }
      
      return {
        playerId: player.id,
        playerName: player.name,
        isRolling,
        finalValue
      };
    });
  }
}

// Singleton instance for your plugin
export const diceIntegration = new DiceRollerIntegration();

// Convenient helper functions for your plugin
export const DiceHelper = {
  /**
   * Check if dice functionality is available
   */
  isAvailable: () => diceIntegration.isDiceAvailable(),

  /**
   * Roll skill check (common MYZ pattern)
   */
  async rollSkillCheck(skillDice: number = 2, gearDice: number = 1): Promise<DiceResult> {
    return diceIntegration.triggerRoll({
      dice: [
        { style: "MYZSKILL", count: skillDice },
        { style: "MYZGEAR", count: gearDice }
      ]
    });
  },

  /**
   * Roll attribute check
   */
  async rollAttribute(attributeValue: number): Promise<DiceResult> {
    return diceIntegration.triggerRoll({
      dice: [
        { style: "MYZBASE", count: attributeValue }
      ]
    });
  },

  /**
   * Roll base dice (without gear)
   */
  async rollBaseDice(diceCount: number): Promise<DiceResult> {
    return diceIntegration.triggerRoll({
      dice: [
        { style: "MYZBASE", count: diceCount }
      ]
    });
  },

  /**
   * Listen for dice results
   */
  onResult: (callback: (result: DiceResult) => void) => diceIntegration.onDiceComplete(callback),

  /**
   * Open dice plugin for manual rolling
   */
  openManualRoll: () => diceIntegration.openDicePlugin()
};


