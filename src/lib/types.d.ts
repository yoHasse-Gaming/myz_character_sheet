import type { Icon as IconType } from '@lucide/svelte';
// Character-related types
export type Talent = {
    id: string;
    name: string;
    description: string;
    occupation: string;
}

export type Mutation = {
    id: string;
    name: string;
    description: string;
    trigger_when: string;
}

export type Skill = {
    name: string;
    description: string;
    value: number;
    groundAbility: string;
}

export type SkillsData = {
    skills: Skill[];
    optionalSkills: OptionalSkill[];
    talents: Talent[];
    mutations: Mutation[];
}

export type SkillType = {
    id: string;
    name: string;
    baseAbility: AbilityType;
    value: number;
    description: string;
    bonusEffects: string;
    examples?: string;
}

// New optional skill types
export type OptionalSkill = {
    id: string;
    name: string;
    value: number;
    baseAbility: AbilityType;
    description: string;
    bonusEffects: string;
    examples?: string;
    occupation: string;
}

export type EquipmentTableItem = {
    id: string;
    name: string;
    quantity: number;
    weight: number;
}

export type WeaponDistance = "MELEE" | "CLOSE" | "SHORT" | "LONG";

export type Equipment = {
    id: string;
    name: string;
    description: string;
    quantity: number;
    weight: number;
    bonuses: {
        id: string;
        value: number;
    }[]; 
}

export type Armor = {
    id: string;
    name: string;
    description: string;
    protection: number;
    weight: number;
    equipped: boolean;
}

export type Weapon = {
    id: string;
    name: string;
    description: string;
    bonus: number;
    damage: number;
    range: number;
    weight: number;
    equipped: boolean;
    type: "MELEE" | "RANGED";
}

export type RPRelation = {
    id: string;
    name: string;
    description: string;
    isClose: boolean;
}

export type KeyValuePair = {
    key: string;
    value: string;
}

export type AbilityType = "STRENGTH" | "AGILITY" | "WITS" | "EMPATHY";


export type BaseAbilityType = {
    label: string;
    damageLabel: string;
    value: number;
    damage: number;
    type: AbilityType;
    description: string;
}

export type MyCharSheet = {
    name: string;
    job: string;
    appearance: {
        face: string;
        body: string;
        clothes: string;
    };
    groundAbilities: {
        strength: {
            value: number;
            damage: number;
        };
        coolness: {
            value: number;
            damage: number;
        };
        sharpness: {
            value: number;
            damage: number;
        };
        feeling: {
            value: number;
            damage: number;
        }
    };
    condition: {
        isStarving: boolean;
        isSleepDeprived: boolean;
        isDehydrated: boolean;
        isFreezing: boolean;
    };
    acuteWounds: string[];
    talents: Talent[];
    mutations: Mutation[];
    skills: Skill[];
    talentPoints: number;
    mutationPoints: number;
    equipment: Equipment[];
    equipmentTable: EquipmentTableItem[];
    zoneRot: number;
    shells: number;
    armor: Armor[];
    weapons: Weapon[];
    rPRelations: RPRelation[];
    hates: KeyValuePair;
    loves: KeyValuePair;
    myBiggestDream: KeyValuePair;
    notes: string[];
}


export type OBR = typeof import('@owlbear-rodeo/sdk');
