<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import GroundAbility from '$lib/components/BaseAbility.svelte';
    import Skills from '$lib/components/Skills.svelte';
    import Mutations from '$lib/components/Mutations.svelte';
    import AbilitiesTab from '$lib/components/tabs/AbilitiesTab.svelte';
    import CharacterTab from '$lib/components/tabs/CharacterTab.svelte';
    import OptionalSkillsModal from '$lib/components/Modals/OptionalSkillsModal.svelte';
    import MutationsModal from '$lib/components/Modals/MutationsModal.svelte';
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '$lib';
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
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
        { id: 3, label: 'Mutationer' },
        { id: 4, label: 'Talanger' },
        { id: 5, label: 'Övrigt' }
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
                
                {#if activeTab === tab.id}
                    <img 
                        src={`/myz_character_sheet/img/stroke.png`} 
                        alt="{tab.label} icon"
                        class="tab-icon stroke-image active" />
                {/if}
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

                <FormSection header="🧬 MUTATIONER">
                    <Mutations />
                </FormSection>
            
            <!-- Mutation Points Section -->
            <div class="mt-6">
                <FormSection header="🔬 MUTATIONSPOÄNG">
                    <div class="mutation-points-container">
                        <div class="mutation-points-display">
                            <span class="mutation-points-label">
                                Mutationspoäng:
                            </span>
                            <div class="mutation-points-controls">
                                <div class="mutation-points-indicators">
                                    {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as idx}
                                        <button 
                                            class="mutation-point-indicator"
                                            onclick={() => {
                                                if (sheetState.mutationPoints > idx) {
                                                    // If this indicator is filled, reduce points to this level
                                                    characterActions.setTotalMutationPoints(idx);
                                                } else {
                                                    // If this indicator is not filled, increase points to include this level
                                                    characterActions.setTotalMutationPoints(idx + 1);
                                                }
                                            }}
                                            aria-label="Toggle mutation point {idx + 1}"
                                        >
                                            <!-- Always show the circle as base layer -->
                                            <img src='/myz_character_sheet/img/strokes/o.svg' alt="No points" class="stroke-image circle-layer" />
                                            <!-- Show X on top if point is spent -->
                                            {#if sheetState.mutationPoints > idx}
                                                <img 
                                                    src='/myz_character_sheet/img/strokes/x.svg' 
                                                    alt="Point available" 
                                                    class="stroke-image x-layer" 
                                                />
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                        <div class="mutation-points-info">
                            <p class="mutation-points-explanation">
                                Mutationspoäng representerar din potentiella kraft från Zonen. 
                                Klicka på cirklarna för att ställa in dina tillgängliga poäng.
                            </p>
                        </div>
                    </div>
                </FormSection>
            </div>
        </div>
    {/if}

    {#if activeTab === 4}
        <FormSection header="⚡ TALANGER">
            <div class="text-center py-8 text-surface-400">
                <div class="text-4xl mb-2">🎯</div>
                <p class="italic">Överlevnadsfärdigheter från Zonen...</p>
                <p class="text-sm mt-2">Kommer implementeras</p>
            </div>
        </FormSection>
    {/if}


    <!-- Tab 4: Övrigt -->
    {#if activeTab === 5}
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

<!-- Modals -->
<OptionalSkillsModal />
<MutationsModal />

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

    /* Mutation points styling */
    .mutation-points-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }

    .mutation-points-display {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .mutation-points-label {
        font-family: var(--form-labels), serif;
        font-size: 0.9rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-surface-800);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
        min-width: 8rem;
    }

    :global(.dark) .mutation-points-label {
        color: var(--color-surface-200);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    .mutation-points-controls {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .mutation-points-indicators {
        display: flex;
        gap: 0.25rem;
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .mutation-point-indicator {
        width: 1.8rem;
        height: 1.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 0;
        transition: transform 0.2s ease;
    }

    .mutation-point-indicator:hover {
        transform: scale(1.1);
    }

    .mutation-point-indicator:active {
        transform: scale(0.95);
    }

    .circle-layer {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .x-layer {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .mutation-points-info {
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.5rem;
        border: 1px solid rgba(217, 119, 6, 0.2);
    }

    :global(.dark) .mutation-points-info {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.3);
    }

    .mutation-points-explanation {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--color-surface-700);
        font-style: italic;
    }

    :global(.dark) .mutation-points-explanation {
        color: var(--color-surface-300);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .mutation-points-display {
            flex-direction: column;
            align-items: flex-start;
        }

        .mutation-points-label {
            min-width: auto;
        }

        .mutation-points-indicators {
            justify-content: center;
            width: 100%;
        }

        .mutation-point-indicator {
            width: 1.5rem;
            height: 1.5rem;
        }
    }

    .tab-icon {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }
</style>