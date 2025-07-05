/**
 * Svelte 5 runes-based state for dice integration
 * This provides reactive state management using Svelte 5 runes
 */

import { DiceHelper, diceIntegration, type DiceResult } from '../integrations/DiceRollerIntegration';

// Core reactive state using Svelte 5 runes
export const diceState = $state({
  isDiceAvailable: false,
  lastResult: null as DiceResult | null,
  isRolling: false
});

// Derived reactive values using Svelte 5 runes
// Note: We cannot export derived state directly from a module in Svelte 5
// Instead, we export a function that returns the derived value
export function getDiceAnalysis() {
  return {
    successes: diceState.lastResult 
      ? Object.values(diceState.lastResult.individualResults).filter(v => v === 6).length 
      : 0,
    ones: diceState.lastResult 
      ? Object.values(diceState.lastResult.individualResults).filter(v => v === 1).length 
      : 0,
    get rollSummary() {
      if (this.successes >= 3) return "Great Success!";
      if (this.successes === 0 && this.ones > 0) return "Mishap!";
      if (this.successes > 0) return `${this.successes} Success${this.successes > 1 ? 'es' : ''}`;
      return "No successes";
    }
  };
}

// Cleanup function storage
let cleanupDiceListener: (() => void) | null = null;

/**
 * Initialize the dice integration state
 * Call this in your main layout or app component
 */
export async function initializeDiceState() {
  if (typeof window === 'undefined') return;
  
  try {
    // Wait for the dice integration to be fully initialized
    await diceIntegration.waitForInitialization();
    
    // Check initial availability
    diceState.isDiceAvailable = await DiceHelper.isAvailable();
    
    // Set up dice result listener
    if (cleanupDiceListener) {
      cleanupDiceListener();
    }
    
    cleanupDiceListener = DiceHelper.onResult((result) => {
      diceState.lastResult = result;
      diceState.isRolling = false;
      console.log(`Dice result: ${result.finalValue}`, result);
    });
  } catch (error) {
    console.warn("Failed to initialize dice state:", error);
    diceState.isDiceAvailable = false;
  }
}

/**
 * Clean up the dice integration state
 * Call this when your app unmounts
 */
export function cleanupDiceState() {
  if (cleanupDiceListener) {
    cleanupDiceListener();
    cleanupDiceListener = null;
  }
}

/**
 * Dice rolling actions
 */
export const diceActions = {
  async rollSkillCheck(skillDice: number = 2, gearDice: number = 1): Promise<DiceResult | null> {
    if (!DiceHelper.isAvailable()) {
      throw new Error("MYZ Dice plugin is not available");
    }

    try {
      diceState.isRolling = true;
      const result = await DiceHelper.rollSkillCheck(skillDice, gearDice);
      return result;
    } catch (error) {
      console.error("Skill check failed:", error);
      throw error;
    } finally {
      diceState.isRolling = false;
    }
  },

  async rollAttribute(attributeValue: number): Promise<DiceResult | null> {
    if (!DiceHelper.isAvailable()) {
      throw new Error("MYZ Dice plugin is not available");
    }

    try {
      diceState.isRolling = true;
      const result = await DiceHelper.rollAttribute(attributeValue);
      return result;
    } catch (error) {
      console.error("Attribute check failed:", error);
      throw error;
    } finally {
      diceState.isRolling = false;
    }
  },

  async rollBaseDice(diceCount: number): Promise<DiceResult | null> {
    if (!DiceHelper.isAvailable()) {
      throw new Error("MYZ Dice plugin is not available");
    }

    try {
      diceState.isRolling = true;
      const result = await DiceHelper.rollBaseDice(diceCount);
      return result;
    } catch (error) {
      console.error("Base dice roll failed:", error);
      throw error;
    } finally {
      diceState.isRolling = false;
    }
  },

  async customRoll(config: Parameters<typeof diceIntegration.triggerRoll>[0]): Promise<DiceResult | null> {
    if (!DiceHelper.isAvailable()) {
      throw new Error("MYZ Dice plugin is not available");
    }

    try {
      diceState.isRolling = true;
      const result = await diceIntegration.triggerRoll(config);
      return result;
    } catch (error) {
      console.error("Custom roll failed:", error);
      throw error;
    } finally {
      diceState.isRolling = false;
    }
  },

  async openManualRoll(): Promise<void> {
    await DiceHelper.openManualRoll();
  }
};

/**
 * Convenience function to check if dice are available
 */
export async function checkDiceAvailability(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const available = await DiceHelper.isAvailable();
  
  diceState.isDiceAvailable = available;
  return available;
}
