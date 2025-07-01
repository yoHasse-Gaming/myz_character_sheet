

<script lang="ts">
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
    import { fade, scale } from 'svelte/transition';
    import o from '$lib/img/o.svg';
    import x from '$lib/img/x.svg';

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
</script>


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
            <span class="damage-label">{baseAbilityDmgLabel}</span>
            <div class="damage-controls">
                <div class="damage-indicators">
                    {#each [0, 1, 2, 3, 4] as idx}
                        <button 
                            class="damage-indicator"
                            onclick={() => toggleDamage(idx)}
                            aria-label="Toggle damage for indicator {idx + 1}"
                        >
                            <!-- Always show the circle as base layer -->
                            <img src={o} alt="No damage" class="stroke-image circle-layer" />
                            <!-- Show X on top if damaged with transition -->
                            {#if (ability?.damage || 0) > idx}
                                <img 
                                    src={x} 
                                    alt="Damage" 
                                    class="stroke-image x-layer" 
                                    in:scale={{ duration: 200, start: 0.8 }}
                                    out:fade={{ duration: 150 }}
                                />
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .base-ability-container {
        width: 100%;
        max-width: 350px;
        padding: 0.5rem;
        /* No background - text rests on parent background */
    }

    .ability-row {
        display: flex;
        flex-direction: row;
        gap: 1rem;
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
        background: rgba(245, 245, 245, 0.9);
        color: var(--color-surface-900);
        box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.2),
            0 0 0 0 transparent;
        transition: all 0.2s ease;
        cursor: default;
        pointer-events:none;
    }



    :global(.dark) .ability-input {
        background: rgba(26, 26, 26, 0.9);
        color: var(--color-surface-100);
        border-color: var(--color-surface-400);
        box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.6),
            0 0 0 0 transparent;
    }

    .ability-input:focus {
        outline: none;
        border-color: var(--color-primary-600);
        box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.2),
            0 0 0 2px rgba(217, 119, 6, 0.3);
        transform: scale(1.02);
    }

    :global(.dark) .ability-input:focus {
        box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.6),
            0 0 0 2px rgba(217, 119, 6, 0.3);
    }

    .damage-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        flex: 1;
        max-width: 15rem;
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
    }

    .damage-indicators {
        display: flex;
        gap: 0.25rem;
        justify-content: flex-end;
        flex-wrap: wrap;
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
    }

    .damage-indicator:hover {
        transform: scale(1.1);
    }

    .damage-indicator:active {
        transform: scale(0.95);
    }

    .stroke-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
    }

    .circle-layer {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }

    .x-layer {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
    }



    /* Responsive adjustments */
    @media (max-width: 639px) {
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
        .damage-indicators {
            gap: 0.5rem;
        }

        .damage-indicator {
            width: 2rem;
            height: 2rem;
        }
    }
</style>
