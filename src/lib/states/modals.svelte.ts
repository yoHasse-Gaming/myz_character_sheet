import { SvelteMap } from 'svelte/reactivity';

// Define dialogue options for modals
export type DialogueOption = 'optionalSkills' | 'mutations' | 'info' | 'occupational-talents' | 'generic-talents' | 'equipment' | 'weapons' | 'armor' | 'relations' | 'notes';

// Info modal state to hold content
export const infoModalState = $state({
    title: '',
    content: '',
    type: '' as 'skill' | 'trauma' | 'mutation' | 'talent' | ''
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
    ['notes', false]
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
export function openInfoModal(title: string, content: string, type: 'skill' | 'trauma' | 'mutation' | 'talent' = 'skill') {
    infoModalState.title = title;
    infoModalState.content = content;
    infoModalState.type = type;
    openDialogueOption('info');
}

