<script lang="ts">
    import { sheetState, characterActions } from '../../../states/character_sheet.svelte';
    import { fade, scale } from 'svelte/transition';
    import { openInfoModal } from '../../../states/modals.svelte';
    import { Rating } from '@skeletonlabs/skeleton-svelte';
    import { Ban, Bone, Circle, CircleX, Skull } from '@lucide/svelte';
    import { onMount } from 'svelte';
    

    let { 
        baseAbilityLabel,
        baseAbilityDmgLabel,
        abilityIndex
    } = $props();

    // Get the ability from global state
    const ability = $derived(sheetState.baseAbilities[abilityIndex]);

    function toggleDamage(damageIndex: number) {
        const currentDamage = ability?.damage || 0;
        
        if (currentDamage > damageIndex) {
            // If this indicator is damaged, reduce damage to this level
            characterActions.setAbilityDamage(abilityIndex, damageIndex);
        } else {
            // If this indicator is not damaged, increase damage to include this level
            characterActions.setAbilityDamage(abilityIndex, damageIndex + 1);
        }
    }

    function handleValueChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value) || 1;
        characterActions.setAbilityValue(abilityIndex, value);
    }

    // Map damage labels to their trauma descriptions
    const traumaDescriptions: Record<string, {title: string, description: string}> = {
        'Skada': {
            title: 'Skada',
            description: 'Blödande sår, krossade ben och utmattning. Sänker din Styrka.'
        },
        'Stress': {
            title: 'Stress', 
            description: 'Nervositet, oro och rädsla. Sänker din Kyla.'
        },
        'Förvirring': {
            title: 'Förvirring',
            description: 'Oklarhet, konfundering och missförstånd. Sänker din Skärpa.'
        },
        'Tvivel': {
            title: 'Tvivel',
            description: 'Ovisshet, misstro, besvikelse och sorg. Sänker din Känsla.'
        }
    };

    const currentTrauma = traumaDescriptions[baseAbilityDmgLabel];

    function showTraumaInfo() {
        if (currentTrauma) {
            openInfoModal(currentTrauma.title, `<p>${currentTrauma.description}</p>`, 'trauma');
        }
    }

    onMount(() => {
        // Ensure the ability value is at least 1
        if (ability?.value < 1) {
            characterActions.setAbilityValue(abilityIndex, 1);
        }
    });
</script>

<!-- TODO: Use this instead for dmg fields? 
<Rating value={2}>
  {#snippet iconEmpty()}
    <Bone size={24} />
  {/snippet}
  {#snippet iconFull()}
    <Skull size={24} />
  {/snippet}
</Rating> -->

<div class="torn-input-wrapper variant-{(abilityIndex % 6) + 1}">
    <div class="base-ability-container">
        <div class="ability-row">
            <div class="ability-section">
                <label for={baseAbilityLabel} class="ability-label">{baseAbilityLabel}</label>
                <input type="number" 
                    max="10" 
                    min="1" 
                    class="ability-input font-user" 
                    name={baseAbilityLabel} 
                    value={ability?.value || 1}
                    oninput={handleValueChange} />
            </div>
            

            <div class="damage-section">
                <div class="damage-header">
                    <span class="damage-label">{baseAbilityDmgLabel}</span>
                    <button 
                        class="info-icon-button"
                        onclick={showTraumaInfo}
                        aria-label="Information om {baseAbilityDmgLabel}"
                        title="Visa information om {baseAbilityDmgLabel}"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9,9h6v6H9z"></path>
                            <path d="M9,9h6"></path>
                        </svg>
                    </button>
                </div>
                <div class="damage-controls">
                    <div class="damage-indicators">
                        <!-- {#each [0, 1, 2, 3, 4] as idx}
                            <button 
                                class="damage-indicator"
                                onclick={() => toggleDamage(idx)}
                                aria-label="Toggle damage for indicator {idx + 1}"
                            >
                                
                                <img src='/img/strokes/o.svg' alt="No damage" class="stroke-image circle-layer" />
                                
                                {#if (ability?.damage || 0) > idx}
                                    <img 
                                        src='/img/strokes/x.svg' 
                                        alt="Damage" 
                                        class="stroke-image x-layer" 
                                        in:scale={{ duration: 200, start: 0.8 }}
                                        out:fade={{ duration: 150 }}
                                    />
                                {/if}
                            </button>
                        {/each} -->
                        <!-- <button 
                            title="Ta bort sista mutationpoängen"
                            disabled={ability?.damage === 0}
                                onclick={() => {
                                    if (ability?.damage > 0) {
                                        characterActions.setAbilityDamage(abilityIndex, ability?.damage-1);
                                    }
                                }}
                            ><CircleX size={24} />
                        </button> -->
                        <Rating value={ability?.damage} count={ability.value}
                            onValueChange={(value) => characterActions.setAbilityDamage(abilityIndex, value.value)}
                        >
                        {#snippet iconEmpty()}
                            <Circle size={24}  />
                        {/snippet}
                        {#snippet iconFull()}
                            <Circle size={24} fill="red"  />
                        {/snippet}
                        </Rating>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .torn-input-wrapper {
        position: relative;
        width: 100%;
        max-width: 350px;
        margin: 0.5rem 0;
        padding: 0;
        border-radius: 0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        transform: scale(1);
    }

    .torn-input-wrapper:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }

    .base-ability-container {
        position: relative;
        width: 100%;
        padding: 1rem;
        z-index: 2;
        background: transparent;
    }

    .ability-row {
        display: flex;
        flex-direction: row;
        gap: 0.1rem;
        align-items: center;
        justify-content: space-between;
    }

    .ability-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        flex: 0 0 auto;
    }

    .ability-label {
        font-family: var(--form-labels), serif;
        font-size: 1rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-surface-900);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        margin: 0;
        position: relative;
        z-index: 3;
    }

    :global(.dark) .ability-label {
        color: var(--color-surface-100);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .ability-input {
        width: 3rem;
        height: 3rem;
        padding-left: unset;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        border: 2px solid var(--color-surface-600);
        border-radius: 0;
        background: transparent;
        color: var(--color-surface-900);
        box-shadow: none;
        transition: all 0.2s ease;
        cursor: default;
        /* pointer-events: none; */
        position: relative;
        z-index: 3;
    }

    :global(.dark) .ability-input {
        color: var(--color-surface-100);
        border-color: var(--color-surface-400);
    }

    .ability-input:focus {
        outline: none;
        border-color: var(--color-primary-600);
        box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.3);
        transform: scale(1.02);
    }

    .damage-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        flex: 1;
        max-width: 15rem;
        position: relative;
        z-index: 3;
    }

    .damage-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-icon-button {
        background: none;
        border: none;
        color: var(--color-surface-600);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        flex-shrink: 0;
    }

    .info-icon-button:hover {
        background: rgba(217, 119, 6, 0.1);
        color: var(--color-primary-600);
        opacity: 1;
        transform: scale(1.1);
    }

    :global(.dark) .info-icon-button {
        color: var(--color-surface-400);
    }

    :global(.dark) .info-icon-button:hover {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }

    .damage-label {
        font-family: var(--form-labels), serif;
        font-size: 0.9rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-surface-800);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
        margin: 0;
        position: relative;
        z-index: 3;
    }

    :global(.dark) .damage-label {
        color: var(--color-surface-200);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    .damage-controls {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        width: auto;
        position: relative;
        z-index: 3;
    }

    .damage-indicators {
        display: flex;
        gap: 0.25rem;
        justify-content: flex-end;
        flex-wrap: wrap;
        position: relative;
        z-index: 3;
    }

    .damage-indicator {
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
        z-index: 4;
    }

    .damage-indicator:hover {
        transform: scale(1.1);
    }

    .damage-indicator:active {
        transform: scale(0.95);
    }


    /* Circle indicators (empty state) should be lighter */

    /* Responsive adjustments */
    @media (max-width: 639px) {
        .torn-input-wrapper {
            max-width: 100%;
            margin: 0.25rem 0;
        }

        .ability-row {
            flex-direction: column;
            gap: 0.75rem;
            align-items: center;
        }

        .damage-section {
            align-items: center;
            max-width: none;
        }

        .damage-controls {
            align-items: center;
        }

        .damage-indicators {
            justify-content: center;
        }
    }

    @media (min-width: 640px) {
        .torn-input-wrapper {
            margin: 0.5rem 0;
        }

        .ability-row {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .ability-section {
            flex: 0 0 auto;
        }

        .damage-section {
            flex: 1;
            align-items: flex-end;
            max-width: 15rem;
        }

        .damage-controls {
            align-items: flex-end;
            width: auto;
        }
    }

    @media (min-width: 768px) {
        .torn-input-wrapper {
            max-width: 380px;
        }

        .damage-indicators {
            gap: 0.5rem;
        }

        .damage-indicator {
            width: 2rem;
            height: 2rem;
        }
    }

    /* Floating tooltip styles - copied from Skills.svelte */
    .floating-tooltip {
        position: fixed;
        z-index: 9999;
        max-width: min(90vw, 400px);
        filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15));
    }

    .tooltip-wrapper {
        position: relative;
        border-radius: 0;
        overflow: hidden;
    }

    .tooltip-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('/img/card_bg.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        filter: var(--torn-filter-effect);
        z-index: 1;
        pointer-events: none;
    }

    :global(.dark) .tooltip-background {
        background: url('/img/card_bg_dark.png');
    }

    .tooltip-content {
        position: relative;
        z-index: 2;
        padding: 1.5rem;
        color: var(--color-surface-900);
        font-family: var(--font-user), serif;
        line-height: 1.6;
        background: transparent;
    }

    :global(.dark) .tooltip-content {
        color: var(--color-surface-100);
    }

    .trauma-title {
        font-family: var(--form-labels), serif;
        font-weight: bold;
        font-size: 1.25rem;
        color: var(--color-primary-900);
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .trauma-title {
        color: var(--color-primary-400);
    }

    .trauma-description {
        font-size: 0.9rem;
        color: var(--color-surface-900);
        font-family: var(--font-user), sans-serif;
        line-height: 1.5;
    }

    :global(.dark) .trauma-description {
        color: var(--color-surface-100);
    }
</style>
