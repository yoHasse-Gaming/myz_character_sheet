<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import GroundAbility from '$lib/components/GroundAbility.svelte';
    import Skills from '$lib/components/Skills.svelte';
    import AbilitiesTab from '$lib/components/tabs/AbilitiesTab.svelte';
    import CharacterTab from '$lib/components/tabs/CharacterTab.svelte';
    import { onMount } from 'svelte';

    type Talent = {
        name: string;
        description: string;
    }

    type Mutation = {
        name: string;
        description: string;
    }

    type Skill = {
        name: string;
        description: string;
        value: number;
        groundAbility: string;
    }

    type Equipment = {
        name: string;
        description: string;
        total: number;
        weight: number;
    }

    type Armor = {
        name: string;
        description: string;
        protection: number;
        weight: number;
    }

    type Weapon = {
        name: string;
        description: string;
        bonus: number;
        damage: number;
        range: number;
        weight: number;
    }

    type RPRelation = {
        name: string;
        description: string;
        isClose: boolean;
    }

    type KeyValuePair = {
        key: string;
        value: string;
    }

    type MyCharSheet = {
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
        hates: KeyValuePair,
        loves: KeyValuePair,
        myBiggestDream: KeyValuePair,

        notes: string[];
    }

    const formData: MyCharSheet = {
        name: '',
        job: '',
        appearance: {
            face: '',
            body: '',
            clothes: ''
        },
        groundAbilities: {
            strength: { value: 0, damage: 0 },
            coolness: { value: 0, damage: 0 },
            sharpness: { value: 0, damage: 0 },
            feeling: { value: 0, damage: 0 }
        },
        condition: {
            isStarving: false,
            isSleepDeprived: false,
            isDehydrated: false,
            isFreezing: false
        },
        acuteWounds: [],
        talents: [],
        mutations: [],
        skills: [],
        talentPoints: 0,
        mutationPoints: 0,
        equipment: [],
        zoneRot: 0,
        shells: 0,
        armor: [],
        weapons: [],
        rPRelations: [],
        hates: { key:'', value:''},
        loves:{ key:'', value:''},
        myBiggestDream:{ key:'', value:''},
        notes:[]
    };

    const groundAbilities = [
        { label: 'Styrka', damageLabel: 'Skada', value: formData.groundAbilities.strength.value, damage: formData.groundAbilities.strength.damage },
        { label: 'Kyla', damageLabel: 'Stress', value: formData.groundAbilities.coolness.value, damage: formData.groundAbilities.coolness.damage },
        { label: 'Skärpa', damageLabel: 'Förvirring', value: formData.groundAbilities.sharpness.value, damage: formData.groundAbilities.sharpness.damage },
        { label: 'Känsla', damageLabel: 'Tvivel', value: formData.groundAbilities.feeling.value, damage: formData.groundAbilities.feeling.damage }
    ];

    // Tab management
    let activeTab = 1;
    
    const tabs = [
        { id: 1, label: 'Karaktär' },
        { id: 2, label: 'Egenskaper' },
        { id: 3, label: 'Talanger & Mutationer' },
        { id: 4, label: 'Övrigt' }
    ];


</script>

<main class="container">
<h2>Rollformulär Mutant År: Noll</h2>

<!-- Tab Navigation -->
<nav class="tab-nav">
    <div role="group">
    {#each tabs as tab}
        <button 
            class="tab-button {activeTab === tab.id ? 'active' : ''}"
            on:click={() => activeTab = tab.id}
        >
            {tab.label}
        </button>
    {/each}
    </div>
</nav>

<!-- Tab Content -->
<div class="tab-content">
    
    <!-- Tab 1: Karaktär -->
    {#if activeTab === 1}
        <CharacterTab />

    {/if}

    <!-- Tab 2: Egenskaper -->
    {#if activeTab === 2}
        <AbilitiesTab />
    {/if}

    <!-- Tab 3: Talanger & Mutationer -->
    {#if activeTab === 3}
        <div class="talents-mutations-tab">
            <div class="grid">
                <FormSection header="TALANGER">
                    <p></p>
                </FormSection>
                <FormSection header="MUTATIONER">
                    <p>Mutationer kommer här...</p>
                </FormSection>
            </div>
        </div>
    {/if}

    <!-- Tab 4: Övrigt -->
    {#if activeTab === 4}
        <div class="other-tab">
            <FormSection header="UTRUSTNING">
                <p>Utrustning kommer här...</p>
            </FormSection>
            <FormSection header="VAPEN & RUSTNING">
                <p>Vapen och rustning kommer här...</p>
            </FormSection>
            <FormSection header="RELATIONER">
                <p>Relationer kommer här...</p>
            </FormSection>
            <FormSection header="ANTECKNINGAR">
                <p>Anteckningar kommer här...</p>
            </FormSection>
        </div>
    {/if}

</div>

</main>
<style>

    .container {
        min-width: 1024px;
        /* max-width: 1024px; */
        overflow: hidden;
    }

    /* Tab Navigation Styles */
    .tab-nav {
        display: flex;
        gap: 0;
        margin-bottom: 2rem;
        border-bottom: 2px solid #ccc;
    }

    .tab-button {
        background: #f5f5f5;
        border: 1px solid #ccc;
        border-bottom: none;
        padding: 1rem 1.5rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        font-weight: 500;
        color: black;
    }

    .tab-button:hover {
        background: #e9e9e9;
        color: black;
    }

    .tab-button.active {
        background: white;
        border-bottom: 2px solid white;
        margin-bottom: -2px;
        z-index: 1;
        position: relative;
        color: black;
    }

    .tab-content {
        padding: 1rem 0;
    }

</style>
