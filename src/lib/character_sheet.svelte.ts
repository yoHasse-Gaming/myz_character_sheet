// Global character sheet state using Svelte 5 runes
// This provides reactive state management across all components

import type { BaseAbilityType, OptionalSkill, Mutation } from './types';
import { useOwlbearSync } from './owlbear-integration';
import { SvelteMap } from 'svelte/reactivity';

// Define the character sheet state structure
export const sheetState = $state({
    // Character basic info
    name: "Okänd Mutant",
    concept: "",
    occupation: "",
    age: 0,
    
    // Base abilities with damage tracking
    baseAbilities: [
        { label: 'Styrka', damageLabel: 'Skada', value: 1, damage: 0 },
        { label: 'Kyla', damageLabel: 'Stress', value: 1, damage: 0 },
        { label: 'Skärpa', damageLabel: 'Förvirring', value: 1, damage: 0 },
        { label: 'Känsla', damageLabel: 'Tvivel', value: 1, damage: 0 }
    ] as BaseAbilityType[],
    
    // Skills with their values and descriptions
    skills: [
        { 
            name: "Kämpa på", 
            baseAbility: "STY", 
            value: 0,
            description: "<p>När Zonen kräver sin tribut - när du måste uthärda kyla, trötthet eller smärta - använder du denna färdighet för att fortsätta framåt.</p>",
            bonusEffects: "<ul><li>För varje extra <strong>☢️</strong> kan du hjälpa en vän i samma situation - de slipper rulla tärning.</li><li>Du kan offra dig själv för att hjälpa en vän, även vid enbart ett lyckat <strong>☢️</strong>.</li></ul>",
            examples: "<p>Används vid marsch i hårt väder, köld, utmattning.</p>"
        },
        { 
            name: "Ta krafttag", 
            baseAbility: "STY", 
            value: 0,
            description: "<p>Används för att lyfta, knuffa eller bryta upp föremål med ren styrka.</p>",
            bonusEffects: "<ul><li>Kasta föremålet så att en fiende tar skada lika med antal extra <strong>☢️</strong>.</li><li>Upptäck en dold passage eller ett dolt föremål (SL avgör vad).</li></ul>",
            examples: "<p>Lyfta bråte, forcera dörrar, dra upp fastklämda vänner.</p>"
        },
        { 
            name: "Slåss", 
            baseAbility: "STY", 
            value: 0,
            description: "<p>Används för närstrid - att slåss mot fiender med knytnävar eller vapen.</p>",
            bonusEffects: "<ul><li>+1 skada (kan upprepas).</li><li>Fienden tar 1 stress.</li><li>+2 initiativ nästa runda.</li><li>Fienden tappar ett föremål.</li><li>Fienden faller eller knuffas bakåt.</li><li>Du greppar fienden (han kan inte agera utan att slå sig fri).</li></ul>",
            examples: "<p>När du slåss i handgemäng, parerar eller tar någon till fånga.</p>"
        },
        { 
            name: "Smyga", 
            baseAbility: "KYL", 
            value: 0,
            description: "<p>Att tyst och osedd ta sig förbi fiender eller positionera sig för bakhåll.</p>",
            bonusEffects: "<ul><li>+1 modifikation per extra <strong>☢️</strong> för smygattack.</li></ul>",
            examples: "<p>Undvika strid, smyga upp på vakter, positionera sig för överraskning.</p>"
        },
        { 
            name: "Fly", 
            baseAbility: "KYL", 
            value: 0,
            description: "<p>För att ta dig ur konflikter, farliga situationer eller fysiskt svåra moment som hopp och balans.</p>",
            bonusEffects: "<ul><li>För varje extra <strong>☢️</strong> kan du hjälpa en vän att fly utan att rulla.</li><li>Du kan offra dig för en vän även vid bara ett <strong>☢️</strong>.</li></ul>",
            examples: "<p>Springa undan, klättra snabbt, kasta sig i skydd.</p>"
        },
        { 
            name: "Skjuta", 
            baseAbility: "KYL", 
            value: 0,
            description: "<p>Används för att träffa fiender med skjutvapen. Kräver ammunition. Lyckat slag gör vapenskada.</p>",
            bonusEffects: "<ul><li>+1 skada per extra <strong>☢️</strong> (kan upprepas).</li><li>Fienden får 1 stress.</li><li>+2 initiativ nästa runda.</li></ul>",
            examples: "<p>Avfyra pistol, gevär, improviserat vapen på avstånd.</p>"
        },
        { 
            name: "Speja", 
            baseAbility: "SKP", 
            value: 0,
            description: "<p>För att aktivt spana efter faror, platser eller individer i omgivningen.</p>",
            bonusEffects: "<ul><li>För varje extra <strong>☢️</strong>, välj en fråga:<br>- Är det ute efter mig?<br>- Finns det fler?<br>- Hur tar jag mig in/förbi/undan?</li></ul>",
            examples: "<p>Observera fiender, planera infallsväg, upptäcka fällor.</p>"
        },
        { 
            name: "Förstå sig på", 
            baseAbility: "SKP", 
            value: 0,
            description: "<p>För att förstå gammal teknologi, texter eller ruiner från den gamla världen.</p>",
            bonusEffects: "<ul><li>För varje extra <strong>☢️</strong> kan du lära någon annan hur man använder artefakten.</li></ul>",
            examples: "<p>Analysera artefakter, läsa forntekniska manualer.</p>"
        },
        { 
            name: "Känna Zonen", 
            baseAbility: "SKP", 
            value: 0,
            description: "<p>För att identifiera faror och fenomen ute i Zonen.</p>",
            bonusEffects: "<ul><li>För varje extra <strong>☢️</strong>, välj en fråga:<br>- Hur kan det skada mig?<br>- Hur kan jag skada det?</li></ul>",
            examples: "<p>Förstå mutantvarelser, farliga växter, zonfenomen.</p>"
        },
        { 
            name: "Genomskåda", 
            baseAbility: "KNS", 
            value: 0,
            description: "<p>För att tolka en annan mutants känslor och avsikter genom närkontakt och observation.</p>",
            bonusEffects: "<ul><li>För varje extra <strong>☢️</strong>, välj en fråga:<br>- Talar han sanning?<br>- Vill han mig illa?<br>- Vill han ha något av mig?</li></ul>",
            examples: "<p>Avläsa lögner, bedöma lojalitet, förstå motivation.</p>"
        },
        { 
            name: "Manipulera", 
            baseAbility: "KNS", 
            value: 0,
            description: "<p>För att övertala, hota eller förföra någon till att göra som du vill. Kräver rimlig motprestation.</p>",
            bonusEffects: "<ul><li>+1 tvivel eller stress på motparten per extra <strong>☢️</strong>. Om de blir brutna går de med på kravet utan motprestation.</li></ul>",
            examples: "<p>Förhandla, ljuga, utöva social press eller charm.</p>"
        },
        { 
            name: "Vårda", 
            baseAbility: "KNS", 
            value: 0,
            description: "<p>För att hela trauma och rädda liv - både fysiska och mentala skador.</p>",
            bonusEffects: "<ul><li>Vid lyckat slag på en bruten vän återfår de antal poäng lika med antalet <strong>☢️</strong>.</li><li>Vid kritiska skador kan ett misslyckat slag innebära döden.</li></ul>",
            examples: "<p>Första hjälpen, psykologisk tröst, stabilisera blödningar.</p>"
        }
    ],
    
    // Optional skills selected by the user
    optionalSkills: [] as OptionalSkill[],
    
    // Mutations selected by the user
    mutations: [] as Mutation[],
    
    // Mutation points available to spend
    mutationPoints: 0,
    
    // Character conditions
    conditions: {
        isStarving: false,
        isSleepDeprived: false,
        isDehydrated: false,
        isFreezing: false
    },
    
    // Critical injuries
    criticalInjuries: ""
});

// Helper functions for managing the state
export const characterActions = {
    // Base ability damage functions
    increaseAbilityDamage(abilityIndex: number) {
        const ability = sheetState.baseAbilities[abilityIndex];
        if (ability && ability.damage < 5) {
            ability.damage++;
        }
    },
    
    decreaseAbilityDamage(abilityIndex: number) {
        const ability = sheetState.baseAbilities[abilityIndex];
        if (ability && ability.damage > 0) {
            ability.damage--;
        }
    },
    
    setAbilityDamage(abilityIndex: number, damage: number) {
        const ability = sheetState.baseAbilities[abilityIndex];
        if (ability) {
            ability.damage = Math.max(0, Math.min(5, damage));
        }
    },
    
    // Set ability value
    setAbilityValue(abilityIndex: number, value: number) {
        const ability = sheetState.baseAbilities[abilityIndex];
        if (ability) {
            ability.value = Math.max(1, Math.min(10, value));
        }
    },
    
    // Set skill value
    setSkillValue(skillIndex: number, value: number) {
        const skill = sheetState.skills[skillIndex];
        if (skill) {
            skill.value = Math.max(0, Math.min(5, value));
        }
    },
    
    // Optional skills management
    addOptionalSkill(optionalSkill: OptionalSkill) {
        // Check if skill is already added
        const existingIndex = sheetState.optionalSkills.findIndex(s => s.id === optionalSkill.id);
        if (existingIndex === -1) {
            sheetState.optionalSkills.push(optionalSkill);
        }
    },
    
    removeOptionalSkill(skillId: string) {
        const index = sheetState.optionalSkills.findIndex(s => s.id === skillId);
        if (index !== -1) {
            sheetState.optionalSkills.splice(index, 1);
        }
    },
    
    setOptionalSkillValue(skillId: string, value: number) {
        const skill = sheetState.optionalSkills.find(s => s.id === skillId);
        if (skill) {
            skill.value = Math.max(0, Math.min(5, value));
        }
    },
    
    // Mutations management
    addMutation(mutation: Mutation) {
        // Check if mutation is already added
        const existingIndex = sheetState.mutations.findIndex(m => m.id === mutation.id);
        if (existingIndex === -1) {
            sheetState.mutations.push(mutation);
        }
    },
    
    removeMutation(mutationId: string) {
        const index = sheetState.mutations.findIndex(m => m.id === mutationId);
        if (index !== -1) {
            sheetState.mutations.splice(index, 1);
        }
    },
    
    setTotalMutationPoints(points: number) {
        sheetState.mutationPoints = Math.max(0, points);
    },
    
    // Character info functions
    setName(name: string) {
        sheetState.name = name;
    },
    
    setConcept(concept: string) {
        sheetState.concept = concept;
    },
    
    setOccupation(occupation: string) {
        sheetState.occupation = occupation;
    },
    
    setAge(age: number) {
        sheetState.age = Math.max(0, age);
    },
    
    // Condition functions
    toggleCondition(condition: keyof typeof sheetState.conditions) {
        sheetState.conditions[condition] = !sheetState.conditions[condition];
    },
    
    setCriticalInjuries(injuries: string) {
        sheetState.criticalInjuries = injuries;
    },
    
    // Utility functions
    getAbilityByLabel(label: string) {
        return sheetState.baseAbilities.find(ability => ability.label === label);
    },
    
    getSkillByName(name: string) {
        return sheetState.skills.find(skill => skill.name === name);
    },
    
    // Save/Load functions (for future persistence)
    exportCharacter() {
        return JSON.stringify(sheetState);
    },
    
    importCharacter(json: string) {
        try {
            const imported = JSON.parse(json);
            Object.assign(sheetState, imported);
        } catch (error) {
            console.error('Failed to import character:', error);
        }
    },
    
    // Owlbear Rodeo integration
    setupOwlbearSync() {
        const owlbearSync = useOwlbearSync(() => ({
            name: sheetState.name,
            baseAbilities: sheetState.baseAbilities,
            skills: sheetState.skills,
            conditions: sheetState.conditions,
            timestamp: Date.now()
        }));
        
        if (owlbearSync.isInOwlbear) {
            owlbearSync.setupAutoSync(60000); // Sync every minute
            console.log('🦉 Owlbear Rodeo sync enabled');
            
            // Load existing character data
            owlbearSync.loadData().then((data) => {
                if (data) {
                    console.log('Loading character data from Owlbear:', data);
                    // Update local state with loaded data
                    Object.assign(sheetState, data);
                }
            });
        }
        
        return owlbearSync;
    },
    
    syncToOwlbear() {
        const owlbearSync = useOwlbearSync(() => ({
            name: sheetState.name,
            baseAbilities: sheetState.baseAbilities,
            skills: sheetState.skills,
            conditions: sheetState.conditions,
            timestamp: Date.now()
        }));
        
        owlbearSync.syncNow();
    }
};

// Define dialogue options for modals
export type DialogueOption = 'optionalSkills' | 'mutations' | 'info';

// Info modal state to hold content
export const infoModalState = $state({
    title: '',
    content: '',
    type: '' as 'skill' | 'trauma' | 'mutation' | ''
});

// Create a reactive map for dialogue states
const openDialogue = new SvelteMap<DialogueOption, boolean>([
    ['optionalSkills', false],
    ['mutations', false],
    ['info', false]
]);

// Convert to reactive state

// Dialogue management functions
export function isDialogueOpen(dialogue: DialogueOption | undefined = undefined) {
    if (!dialogue) {
        return Array.from(openDialogue.values()).some((value) => value === true);
    }
    return openDialogue.get(dialogue) ?? false;
}

export function toggleDialogueOption(dialogue: DialogueOption) {
    const currentValue = openDialogue.get(dialogue) ?? false;
    openDialogue.set(dialogue, !currentValue);
}

export function openDialogueOption(dialogue: DialogueOption) {
    // Close all other dialogues first
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
export function openInfoModal(title: string, content: string, type: 'skill' | 'trauma' | 'mutation' = 'skill') {
    infoModalState.title = title;
    infoModalState.content = content;
    infoModalState.type = type;
    openDialogueOption('info');
}

// Export types for TypeScript support
export type CharacterSheet = typeof sheetState;
export type CharacterActions = typeof characterActions;
