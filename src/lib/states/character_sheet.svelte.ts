import type { BaseAbilityType, OptionalSkill, Mutation, Equipment, EquipmentTableItem, Weapon, Armor, RPRelation, Talent, Skill, SkillType, AbilityType } from '../types';
import type { LayoutType } from '../utils/interactjsUtils';
import skills from '../data/skills.json';
import { openDiceRollModal } from '../states/modals.svelte';

// Main character data interface - this is the primary type for the entire app

export const initialCardPositions: Record<string, { x: number; y: number }> = {
    "character-basic-info": { x: 20, y: 10 },
    "character-looks": { x: 640, y: 10 },
    "character-dream": { x: 640, y: 320 },
    "experience-points": { x: 20, y: 550 },
    "conditions": { x: 10, y: 340 },
    "base-abilities": { x: 10, y: 110 },
    "skills-core": { x: 320, y: 10 },
    "mutations": { x: 310, y: 510 },
    "mutation-points": { x: 0, y: 640 },
    "equipment": { x: 570, y: 500 },
    "armors": { x: 570, y: 660 },
    "weapons": { x: 570, y: 790 },
    "talents": { x: 275, y: 660 },
    "occupational-talents": { x: 275, y: 790 },
    // Relations positioning (base position for stacking)
    "relations-start": { x: 20, y: 1035 },
    "relations-additional": { x: 1495, y: 10 },
    "zone-rot": { x: 20, y: 730 },
    // Notes positioning (base position for stacking)
    "notes-start": { x: 20, y: 20 },
};

export interface CharacterSheetData {
    id: string;
    name: string;
    occupation: string;
    appearance: {
        face: string;
        body: string;
        clothes: string;
    };
    dream: string;
    baseAbilities: BaseAbilityType[];
    skills: SkillType[];
    optionalSkills: OptionalSkill[];
    mutations: Mutation[];
    mutationPoints: number;
    experiencePoints: number;
    zoneRot: number;
    talents: Talent[];
    conditions: {
        isStarving: boolean;
        isSleepDeprived: boolean;
        isDehydrated: boolean;
        isFreezing: boolean;
    };
    criticalInjuries: string;
    equipment: Equipment[];
    equipmentTable: EquipmentTableItem[];
    weapons: Weapon[];
    armor: Armor[];
    relations: RPRelation[];
    additionalRelations: RPRelation[];
    notes: string[];
    paperLayouts: Record<string, { x: number; y: number; width?: number; height?: number }>;
    lastUpdated?: number; // Timestamp for last update
    isSaving?: boolean; // Flag to indicate if saving is in progress
    isLocked?: boolean; // Flag to indicate if the sheet is locked for editing
}

export const sheetState: CharacterSheetData = $state({
    // Character basic info
    id: "",
    name: "",
    occupation: "",
    appearance: {
        face: "",
        body: "",
        clothes: ""
    },
    dream: "",
    // Base abilities with damage tracking
    baseAbilities: [
        { label: 'Styrka', damageLabel: 'Skada', value: 1, damage: 0, type: 'STRENGTH', description: "Din råa kroppsstyrka. Avgör hur mycket skada du tål. Återhämtas med krubb." },
        { label: 'Kyla', damageLabel: 'Stress', value: 1, damage: 0, type: 'AGILITY', description: "Avgör hur kall och kontrollerad du är i livshotande situationer. Avgör hur mycket stress du tål. Återhämtas med vatten." },
        { label: 'Skärpa', damageLabel: 'Förvirring', value: 1, damage: 0, type: 'WITS', description: " Intelligens, vaksamhet och sinnesskärpa. Avgör hur mycket förvirring du tål. Återhämtas med sömn." },
        { label: 'Känsla', damageLabel: 'Tvivel', value: 1, damage: 0, type: 'EMPATHY', description: "Din personliga utstrålning, empati och förmåga att manipulera andra. Avgör hur mycket tvivel du tål. Återhämtas med närhet." }
    ],
    
    // Skills with their values and descriptions
    skills: skills.skills as SkillType[],
    
    // Optional skills selected by the user
    optionalSkills: [] ,
    
    // Mutations selected by the user
    mutations: [],
    
    // Mutation points available to spend
    mutationPoints: 0,

    // Experience points for character progression
    experiencePoints: 0,

    // Zone rot level
    zoneRot: 0,
    // Talents selected by the user
    talents: [],
    
    // Character conditions
    conditions: {
        isStarving: false,
        isSleepDeprived: false,
        isDehydrated: false,
        isFreezing: false
    },
    
    // Critical injuries
    criticalInjuries: "",
    
    // Equipment and inventory
    equipment: [],
    equipmentTable: [],
    
    // Weapons
    weapons: [],
    
    // Armor
    armor: [],

    // Relations with other characters
    relations: [
        {id: 'RP1', name: 'RP 1', description: '', isClose: true},
        {id: 'RP2', name: 'RP 2', description: '', isClose: false},
        {id: 'RP3', name: 'RP 3', description: '', isClose: false},
        {id: 'RP4', name: 'RP 4', description: '', isClose: false},
        {id: 'SL1', name: 'Jag Hatar', description: '', isClose: false},
        {id: 'SL2', name: 'Jag vill skydda', description: '', isClose: false}
    ],
    additionalRelations: [],
    
    // Notes or miscellaneous information
    notes: [],
    
    // Paper layout data for preserving positions and sizes across tab switches
    paperLayouts: {},
    
    // Track unsaved changes
    hasUnsavedChanges: false,
    
    // Layout lock state
    isLocked: false
});

// Helper functions for managing the state
export const characterActions = {

    // Create a subscribable function to track when Character is loaded
    

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
        const test = sheetState.optionalSkills;
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

    // Experience points management
    setTotalExperiencePoints(points: number) {
        sheetState.experiencePoints = Math.max(0, points);
    },

    setTotalZoneRot(rot: number) {
        sheetState.zoneRot = Math.max(0, rot);
    },

    // Talents management
    addTalent(talent: Talent) {
        // Check if talent is already added
        const existingIndex = sheetState.talents.findIndex(t => t.id === talent.id);
        if (existingIndex === -1) {
            sheetState.talents.push(talent);
        }
    },
    
    removeTalent(talentId: string) {
        const index = sheetState.talents.findIndex(t => t.id === talentId);
        if (index !== -1) {
            sheetState.talents.splice(index, 1);
        }
    },
    
    // Helper functions for talent validation
    canAddOccupationalTalent(): boolean {
        const occupationalTalents = sheetState.talents.filter(t => t.occupation !== 'generic');
        return occupationalTalents.length < 2;
    },
    
    canAddSecondOccupationalTalent(): boolean {
        const occupationalTalents = sheetState.talents.filter(t => t.occupation !== 'generic');
        const genericTalents = sheetState.talents.filter(t => t.occupation === 'generic');
        return occupationalTalents.length < 2 && genericTalents.length >= 3;
    },
    
    canAddGenericTalent(): boolean {
        const genericTalents = sheetState.talents.filter(t => t.occupation === 'generic');
        return genericTalents.length < 5;
    },
    
    getOccupationalTalentCount(): number {
        return sheetState.talents.filter(t => t.occupation !== 'generic').length;
    },
    
    getGenericTalentCount(): number {
        return sheetState.talents.filter(t => t.occupation === 'generic').length;
    },
    
    // Character info functions
    setName(name: string) {
        sheetState.name = name;
    },
    
    setOccupation(occupation: string) {
        sheetState.occupation = occupation;
    },
    
    setAppearanceFace(face: string) {
        sheetState.appearance.face = face;
    },
    
    setAppearanceBody(body: string) {
        sheetState.appearance.body = body;
    },
    
    setAppearanceClothes(clothes: string) {
        sheetState.appearance.clothes = clothes;
    },
    
    setDream(dream: string) {
        sheetState.dream = dream;
    },
    
    // Condition functions
    toggleCondition(condition: keyof typeof sheetState.conditions) {
        sheetState.conditions[condition] = !sheetState.conditions[condition];
    },
    
    setCriticalInjuries(injuries: string) {
        sheetState.criticalInjuries = injuries;
    },
    
    // Equipment management
    addEquipment(equipment: Equipment) {
        // Check if equipment is already added
        const existingIndex = sheetState.equipment.findIndex(e => e.id === equipment.id);
        if (existingIndex === -1) {
            sheetState.equipment.push(equipment);
        }
    },
    
    removeEquipment(equipmentId: string) {
        const index = sheetState.equipment.findIndex(e => e.id === equipmentId);
        if (index !== -1) {
            sheetState.equipment.splice(index, 1);
        }
    },
    
    // Weapons management
    addWeapon(weapon: Weapon) {
        // Check if weapon is already added
        const existingIndex = sheetState.weapons.findIndex(w => w.id === weapon.id);
        if (existingIndex === -1) {
            sheetState.weapons.push(weapon);
        }
    },
    
    removeWeapon(weaponId: string) {
        const index = sheetState.weapons.findIndex(w => w.id === weaponId);
        if (index !== -1) {
            sheetState.weapons.splice(index, 1);
        }
    },
    
    // Armor management
    addArmor(armor: Armor) {
        // Check if armor is already added
        const existingIndex = sheetState.armor.findIndex(a => a.id === armor.id);
        if (existingIndex === -1) {
            sheetState.armor.push(armor);
        }
    },
    
    removeArmor(armorId: string) {
        const index = sheetState.armor.findIndex(a => a.id === armorId);
        if (index !== -1) {
            sheetState.armor.splice(index, 1);
        }
    },
    
    // Relations management
    addRelation(relation: RPRelation) {
        // Check if relation is already added
        const existingIndex = sheetState.relations.findIndex(r => r.id === relation.id);
        if (existingIndex === -1) {
            sheetState.relations.push(relation);
        }
    },
    
    removeRelation(relationId: string) {
        const index = sheetState.relations.findIndex(r => r.id === relationId);
        const additionalIndex = sheetState.additionalRelations.findIndex(r => r.id === relationId);

        if (index === -1 && additionalIndex === -1) {
            return;
        }

        if (index !== -1) {
            sheetState.relations.splice(index, 1);
            return;
        }

        if (additionalIndex !== -1) {
            sheetState.additionalRelations.splice(additionalIndex, 1);
            return;
        }

    },

    updateRelation(relationId: string, updates: Partial<RPRelation>) {
        const index = sheetState.relations.findIndex(r => r.id === relationId);
        if (index !== -1) {
            Object.assign(sheetState.relations[index], updates);
        }
    },
    
    // Notes management
    addNote(note: string) {
        sheetState.notes.push(note.trim());
    },
    
    removeNote(index: number) {
        if (index >= 0 && index < sheetState.notes.length) {
            sheetState.notes.splice(index, 1);
        }
    },
    
    updateNote(index: number, note: string) {
        if (index >= 0 && index < sheetState.notes.length) {
            sheetState.notes[index] = note.trim();
        }
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
    
    
    // Paper layout management
    savePaperLayout(paperId: string, layout: LayoutType) {
        sheetState.paperLayouts[paperId] = layout;
    },
    
    getPaperLayout(paperId: string) {
        return sheetState.paperLayouts[paperId] || null;
    },
    
    clearPaperLayouts() {
        sheetState.paperLayouts = {};
    },

    // Dice rolling functions
    openSkillRollModal(
        skillName: string, 
        skillValue: number, 
        baseAbilityLabel: string, 
        baseAbilityType: AbilityType, 
        baseAbilityValue: number, 
        baseAbilityDamage: number) {
        // Import the function dynamically to avoid circular dependencies
    
        const effectiveAbilityValue = Math.max(0, baseAbilityValue - baseAbilityDamage);
        
        openDiceRollModal({
            rollName: `${skillName}`,
            baseDice: effectiveAbilityValue,
            skillDice: skillValue,
            gearDice: 0,
            skillName: skillName,
            abilityName: baseAbilityLabel,
            abilityType: baseAbilityType
        });
    },

    openWeaponRollModal(
        weapon: Weapon, 
        skill: SkillType, 
        baseAbility: BaseAbilityType
        ) {
        // Import the function dynamically to avoid circular dependencies
        const effectiveAbilityValue = Math.max(0, baseAbility.value - baseAbility.damage);

        openDiceRollModal({
            rollName: `${weapon.name} - ${skill.name}`,
            baseDice: effectiveAbilityValue,
            skillDice: skill.value,
            gearDice: weapon.bonus,
            abilityName: baseAbility.label,
            skillName: skill.name,
            abilityType: baseAbility.type
        });
    },

    openAbilityRollModal(abilityLabel: string, abilityValue: number, abilityDamage: number) {
        // Import the function dynamically to avoid circular dependencies
        const effectiveAbilityValue = Math.max(0, abilityValue - abilityDamage);
        
        openDiceRollModal({
            rollName: `${abilityLabel}`,
            baseDice: effectiveAbilityValue,
            skillDice: 0,
            gearDice: 0,
            abilityName: abilityLabel
        });
    },

    // Position helper functions for relations and notes
    getRelationPosition(index: number): { x: number; y: number } {
        const basePosition = initialCardPositions["relations-start"];
        return {
            x: basePosition.x,
            y: basePosition.y + (index * 120)
        };
    },

    getNotePosition(index: number): { x: number; y: number } {
        const basePosition = initialCardPositions["notes-start"];
        const relationCount = sheetState.relations.length;
        return {
            x: basePosition.x,
            y: basePosition.y + (relationCount * 100) + (index * 100)
        };
    },

};

// Export types for TypeScript support
export type CharacterSheet = typeof sheetState;
export type CharacterActions = typeof characterActions;
