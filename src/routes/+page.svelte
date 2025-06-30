<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import GroundAbility from '$lib/components/BaseAbility.svelte';
    import Skills from '$lib/components/Skills.svelte';
    import AbilitiesTab from '$lib/components/tabs/AbilitiesTab.svelte';
    import CharacterTab from '$lib/components/tabs/CharacterTab.svelte';
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '$lib';
    import type { MyCharSheet, KeyValuePair } from '$lib/types';

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

    // Generate unique variants for tabs
    const tabVariants = ['tab-variant-1', 'tab-variant-2', 'tab-variant-3', 'tab-variant-4'];

</script>



<main class="sheet-container">
<!-- <div class="text-center mb-8">
    <h2 class="h2 mb-2">☢️ ROLLFORMULÄR ☢️</h2>
    <h3 class="text-lg text-surface-400 uppercase tracking-wider">Mutant: År Noll</h3>
    <div class="border-t-2 border-primary-500 w-32 mx-auto mt-4"></div>
</div> -->

<svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    height="0"
    width="0"
>
    <defs>
        <filter id="squiggle">
            <feTurbulence
                type="fractalNoise"
                id="turbulence"
                baseFrequency=".06"
                numOctaves="4"
                seed="2"
            />
            <feDisplacementMap
                id="displacement"
                in="SourceGraphic"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    </defs>
</svg>

<svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    height="0"
    width="0"
>
    <defs>
        <filter id="squiggle_lines">
            <feTurbulence
                type="fractalNoise"
                id="turbulence"
                baseFrequency=".05"
                numOctaves="4"
                seed="1"
            />
            <feDisplacementMap
                id="displacement"
                in="SourceGraphic"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    </defs>
</svg>

<!-- Tab Navigation with torn paper styling -->
<div class="tab-nav">
    {#each tabs as tab, index}
        <div class="tab-button-wrapper {tabVariants[index]} {activeTab === tab.id ? 'active' : ''}">
            <button 
                class="tab-button {activeTab === tab.id ? 'active' : ''}"
                onclick={() => activeTab = tab.id}
            >
                {tab.label}
            </button>
        </div>
    {/each}
</div>


<!-- Tab Content -->
<div class="tab-content relative overflow-hidden">
    
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
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormSection header="⚡ TALANGER">
                    <div class="text-center py-8 text-surface-400">
                        <div class="text-4xl mb-2">🎯</div>
                        <p class="italic">Överlevnadsfärdigheter från Zonen...</p>
                        <p class="text-sm mt-2">Kommer implementeras</p>
                    </div>
                </FormSection>
                <FormSection header="🧬 MUTATIONER">
                    <div class="text-center py-8 text-surface-400">
                        <div class="text-4xl mb-2">☢️</div>
                        <p class="italic">Zonens gåva... eller förbannelse</p>
                        <p class="text-sm mt-2">Kommer implementeras</p>
                    </div>
                </FormSection>
            </div>
        </div>
    {/if}

    <!-- Tab 4: Övrigt -->
    {#if activeTab === 4}
        <div class="other-tab space-y-6">
            <FormSection header="🎒 UTRUSTNING">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">📦</div>
                    <p class="italic">Skrot och rost som håller dig vid liv...</p>
                </div>
            </FormSection>
            <FormSection header="⚔️ VAPEN & RUSTNING">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">🛡️</div>
                    <p class="italic">Ditt skydd mot Zonens faror</p>
                </div>
            </FormSection>
            <FormSection header="👥 RELATIONER">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">🤝</div>
                    <p class="italic">Vänner och fiender i ödemarken</p>
                </div>
            </FormSection>
            <FormSection header="📝 ANTECKNINGAR">
                <div class="text-center py-6 text-surface-400">
                    <div class="text-3xl mb-2">📋</div>
                    <p class="italic">Minnen från den gamla världen...</p>
                </div>
            </FormSection>
        </div>
    {/if}

</div>

</main>

<style>
    /* Tab content styling */


    /* Sheet container with torn paper background */
    .sheet-container {
        position: relative;
        width: 100%;
        max-width: 100%;
        min-width: 320px; /* Mobile minimum */
        margin: 0 auto;
        /* Ensure content stays above the background */
        z-index: 1;
        /* Make it responsive */
        overflow-x: auto;
        container-type: inline-size;
    }
</style>