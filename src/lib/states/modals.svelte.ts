import { SvelteMap } from 'svelte/reactivity';
import type { DiceRollConfig } from './dice.svelte';

// Define dialogue options for modals
export type DialogueOption = 'optionalSkills' | 'mutations' | 'info' | 'occupational-talents' | 'generic-talents' | 'equipment' | 'weapons' | 'armor' | 'relations' | 'notes' | 'diceRoll' | 'newEquipment' | 'newWeapon' | 'newArmor' | 'sizeControls';

// Info modal state to hold content
export const infoModalState = $state({
    title: '',
    content: '',
    type: '' as 'skill' | 'trauma' | 'mutation' | 'talent' | 'equipment' | 'weapon' | 'armor'
});

// Dice roll modal state
export const diceRollModalState = $state({
    rollName: '',
    baseRoll: {
        baseDice: 0,
        skillDice: 0,
        gearDice: 0
    },
    modifiers: {
        extraBaseDice: 0,
        extraSkillDice: 0,
        extraGearDice: 0
    },
    selectedEquipment: [] as string[], // IDs of selected equipment/weapons/armor
    skillName: '',
    abilityName: ''
});

// Create a reactive map for dialogue states
const openDialogue = new SvelteMap<DialogueOption, boolean>([
    ['optionalSkills', false],
    ['mutations', false],
    ['info', false],
    ['occupational-talents', false],
    ['generic-talents', false],
    ['equipment', false],
    ['weapons', false],
    ['armor', false],
    ['relations', false],
    ['notes', false],
    ['diceRoll', false],
    ['newEquipment', false],
    ['newWeapon', false],
    ['newArmor', false]
]);

// Convert to reactive state

// Dialogue management functions
export function isDialogueOpen(dialogue: DialogueOption | undefined = undefined) {
    if (!dialogue) {
        return Array.from(openDialogue.values()).some((value) => value === true);
    }
    return openDialogue.get(dialogue) ?? false;
}

export function toggleDialogueOption(dialogue: DialogueOption, open: boolean | undefined = undefined) {
    if (open !== undefined) {
        openDialogue.set(dialogue, open);
        return;
    }
    const currentValue = openDialogue.get(dialogue) ?? false;
    openDialogue.set(dialogue, !currentValue);
}

export function openDialogueOption(dialogue: DialogueOption) {
    // Close all other dialogues first
    console.log(`Opening dialogue: ${dialogue}`);
    openDialogue.forEach((value, key) => {
        if (key !== dialogue) {
            openDialogue.set(key, false);
        }
    });
    openDialogue.set(dialogue, true);
}

export function closeDialogueOption(dialogue: DialogueOption | undefined = undefined) {
    if (!dialogue) {
        // Close all dialogues
        openDialogue.forEach((value, key) => {
            openDialogue.set(key, false);
        });
        return;
    }
    openDialogue.set(dialogue, false);
}

// Function to open info modal with specific content
export function openInfoModal(title: string, content: string, type: 'skill' | 'trauma' | 'mutation' | 'equipment' | 'weapon' | 'armor' | 'talent' = 'skill' ) {
    infoModalState.title = title;
    infoModalState.content = content;
    infoModalState.type = type;
    openDialogueOption('info');
}

// Function to open dice roll modal with initial configuration
export function openDiceRollModal(config: {
    rollName: string;
    baseDice: number;
    skillDice: number;
    gearDice?: number;
    skillName?: string;
    abilityName?: string;
}) {
    diceRollModalState.rollName = config.rollName;
    diceRollModalState.baseRoll.baseDice = config.baseDice;
    diceRollModalState.baseRoll.skillDice = config.skillDice;
    diceRollModalState.baseRoll.gearDice = config.gearDice || 0;
    diceRollModalState.skillName = config.skillName || '';
    diceRollModalState.abilityName = config.abilityName || '';
    
    // Reset modifiers and selections
    diceRollModalState.modifiers.extraBaseDice = 0;
    diceRollModalState.modifiers.extraSkillDice = 0;
    diceRollModalState.modifiers.extraGearDice = 0;
    diceRollModalState.selectedEquipment = [];
    
    openDialogueOption('diceRoll');
}

