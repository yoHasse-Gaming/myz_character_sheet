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

// New optional skill types
export type OptionalSkill = {
    id: string;
    name: string;
    value: number;
    baseAbility: string;
    description: string;
    bonusEffects: string;
    examples?: string;
    occupation: string;
}

export type Equipment = {
    name: string;
    description: string;
    total: number;
    weight: number;
}

export type Armor = {
    name: string;
    description: string;
    protection: number;
    weight: number;
}

export type Weapon = {
    name: string;
    description: string;
    bonus: number;
    damage: number;
    range: number;
    weight: number;
}

export type RPRelation = {
    name: string;
    description: string;
    isClose: boolean;
}

export type KeyValuePair = {
    key: string;
    value: string;
}

export type BaseAbilityType = {
    label: string;
    damageLabel: string;
    value: number;
    damage: number;
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
