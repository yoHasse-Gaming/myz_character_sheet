// Global character sheet state using Svelte 5 runes
// This provides reactive state management across all components

import { BicepsFlexed, Brain, UsersRound, VenetianMask } from '@lucide/svelte';
import type { BaseAbilityType, OptionalSkill, Mutation, Equipment, EquipmentTableItem, Weapon, Armor, RPRelation, Talent, Skill, SkillType } from '../types';
import type { LayoutType } from '../utils/interactjsUtils';
import { useOwlbearSync } from '../utils/owlbearIntegration';
import skills from '../data/skills.json';
import { openDiceRollModal } from '../states/modals.svelte';


// Define the character sheet state structure
export const sheetState = $state({
    // Character basic info
    name: "Okänd Mutant",
    concept: "",
    occupation: "",
    age: 0,
    // Base abilities with damage tracking
    
    baseAbilities: [
        { label: 'Styrka', damageLabel: 'Skada', value: 1, damage: 0, type: 'STRENGTH' },
        { label: 'Kyla', damageLabel: 'Stress', value: 1, damage: 0, type: 'AGILITY' },
        { label: 'Skärpa', damageLabel: 'Förvirring', value: 1, damage: 0, type: 'WITS' },
        { label: 'Känsla', damageLabel: 'Tvivel', value: 1, damage: 0, type: 'EMPATHY' }
    ] as BaseAbilityType[],
    
    // Skills with their values and descriptions
    skills: skills.skills as SkillType[],
    
    // Optional skills selected by the user
    optionalSkills: [] as OptionalSkill[],
    
    // Mutations selected by the user
    mutations: [] as Mutation[],
    
    // Mutation points available to spend
    mutationPoints: 0,
    
    // Talents selected by the user
    talents: [] as Talent[],
    
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
    equipment: [] as Equipment[],
    equipmentTable: [] as EquipmentTableItem[],
    
    // Weapons
    weapons: [] as Weapon[],
    
    // Armor
    armor: [] as Armor[],


    //     const defaultRelations = [
    //     { id: 1, name: 'RP 1', description: 'Beskrivning', initialPosition: { x: 20, y: 20 } },
    //     { id: 2, name: 'RP 2', description: 'Beskrivning', initialPosition: { x: 20, y: 120 } },
    //     { id: 3, name: 'RP 3', description: 'Beskrivning', initialPosition: { x: 20, y: 220 } },
    //     { id: 4, name: 'RP 4', description: 'Beskrivning', initialPosition: { x: 20, y: 320 } },
    //     { id: 5, name: 'Jag Hatar', description: 'Jag hatar...', initialPosition: { x: 20, y: 420 } },
    //     { id: 6, name: 'Jag vill skydda', description: 'Jag vill skydda...', initialPosition: { x: 20, y: 520 } },
    // ];
    
    // Relations with other characters
    relations: [
        {id: 'RP1', name: 'RP 1', description: '', isClose: true},
        {id: 'RP2', name: 'RP 2', description: '', isClose: false},
        {id: 'RP3', name: 'RP 3', description: '', isClose: false},
        {id: 'RP4', name: 'RP 4', description: '', isClose: false},
        {id: 'SL1', name: 'Jag Hatar', description: '', isClose: false},
        {id: 'SL2', name: 'Jag vill skydda', description: '', isClose: false}
    ] as RPRelation[],
    additionalRelations: [] as RPRelation[],
    
    // Notes or miscellaneous information
    notes: [] as string[],
    
    // Paper layout data for preserving positions and sizes across tab switches
    paperLayouts: {} as Record<string, { x: number; y: number; width?: number; height?: number }>
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
        if (index !== -1) {
            sheetState.relations.splice(index, 1);
        }
    },
    
    // Notes management
    addNote(note: string) {
        if (note.trim()) {
            sheetState.notes.push(note.trim());
        }
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
    openSkillRollModal(skillName: string, skillValue: number, baseAbilityLabel: string, baseAbilityValue: number, baseAbilityDamage: number) {
        // Import the function dynamically to avoid circular dependencies
    
        const effectiveAbilityValue = Math.max(0, baseAbilityValue - baseAbilityDamage);
        
        openDiceRollModal({
            rollName: `${skillName}`,
            baseDice: effectiveAbilityValue,
            skillDice: skillValue,
            gearDice: 0,
            skillName: skillName,
            abilityName: baseAbilityLabel
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

};

// Export types for TypeScript support
export type CharacterSheet = typeof sheetState;
export type CharacterActions = typeof characterActions;
