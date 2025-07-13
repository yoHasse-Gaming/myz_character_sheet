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
export const dialogues = new SvelteMap<DialogueOption, HTMLDialogElement>();

// Convert to reactive state

// Dialogue management functions
export function isDialogueOpen(dialogue: DialogueOption | undefined = undefined) {
    if (!dialogue) {
        return Array.from(dialogues.values()).some((value) => value.open);
    }
    return dialogues.get(dialogue) ?? false;
}

export function toggleDialogueOption(dialogue: DialogueOption) {
    const currentValue = dialogues.get(dialogue)?.open ?? false;
    if (currentValue) {
        dialogues.get(dialogue)?.close();
    } else {
        openDialogueOption(dialogue);
    }
}

export function openDialogueOption(dialogue: DialogueOption) {
    // Close all other dialogues first
    console.log(`Opening dialogue: ${dialogue}`);
    // close all open dialogues except the one being opened
    dialogues.forEach((value, key) => {
        if (key !== dialogue) {
            value.close();
        }
    });
    if (!dialogues.has(dialogue)) {
        console.warn(`Dialogue ${dialogue} not found in dialogues map.`);
        return;
    }
    dialogues.get(dialogue)?.showModal();
}

export function closeDialogueOption(dialogue: DialogueOption | undefined = undefined) {
    if (!dialogue) {
        // Close all dialogues
        dialogues.forEach((value, key) => {
            value.close();
        });
        return;
    }
    dialogues.get(dialogue)?.close();
}

// Function to open info modal with specific content
export function openInfoModal(title: string, content: string, type: 'skill' | 'trauma' | 'mutation' | 'talent' = 'skill') {
    infoModalState.title = title;
    infoModalState.content = content;
    infoModalState.type = type;
    openDialogueOption('info');
}

