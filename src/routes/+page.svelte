<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import GroundAbility from '$lib/components/BaseAbility.svelte';
    import Skills from '$lib/components/Skills.svelte';
    import AbilitiesTab from '$lib/components/tabs/AbilitiesTab.svelte';
    import CharacterTab from '$lib/components/tabs/CharacterTab.svelte';
    import { onMount } from 'svelte';
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

</script>

<main class="sheet-container">
<!-- <div class="text-center mb-8">
    <h2 class="h2 mb-2">☢️ ROLLFORMULÄR ☢️</h2>
    <h3 class="text-lg text-surface-400 uppercase tracking-wider">Mutant: År Noll</h3>
    <div class="border-t-2 border-primary-500 w-32 mx-auto mt-4"></div>
</div> -->

<!-- Tab Navigation using post-apocalyptic styling -->
<div class="flex border-b-2 border-primary-600 mb-0 bg-surface-200 dark:bg-surface-900 p-1">
    {#each tabs as tab}
        <button 
            class="px-6 py-3 font-bold text-sm uppercase tracking-wide transition-all duration-200 {activeTab === tab.id ? 'bg-primary-500 text-surface-50 shadow-lg' : 'text-surface-400 hover:dark:text-surface-100 hover:text-surface-800 hover:bg-surface-300 hover:dark:bg-surface-700'}"
            onclick={() => activeTab = tab.id}
        >
            {tab.label}
        </button>
    {/each}
</div>

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

