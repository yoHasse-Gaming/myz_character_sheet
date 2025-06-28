

<script lang="ts">
    import { generateRandomStrokes } from '$lib';
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
    import { fade, scale } from 'svelte/transition';

    let { 
        baseAbilityLabel,
        baseAbilityDmgLabel,
        abilityIndex
    } = $props();

    // Generate random stroke images for damage indicators
    const damageStrokes = generateRandomStrokes(6);

    // Get the ability from global state
    const ability = $derived(sheetState.baseAbilities[abilityIndex]);

    function increasGroundAbilityDmg() {
        characterActions.increaseAbilityDamage(abilityIndex);
    }
    
    function decreaseGroundAbilityDmg() {
        characterActions.decreaseAbilityDamage(abilityIndex);
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
                        <div class="damage-indicator">
                            <!-- Always show the circle as base layer -->
                            <img src={damageStrokes[idx].circle} alt="No damage" class="stroke-image circle-layer" />
                            <!-- Show X on top if damaged with transition -->
                            {#if (ability?.damage || 0) > idx}
                                <img 
                                    src={damageStrokes[idx].x} 
                                    alt="Damage" 
                                    class="stroke-image x-layer" 
                                    in:scale={{ duration: 200, start: 0.8 }}
                                    out:fade={{ duration: 150 }}
                                />
                            {/if}
                        </div>
                    {/each}
                </div>
                <div class="control-buttons">
                    <button type="button" class="damage-btn decrease-btn" onclick={decreaseGroundAbilityDmg} aria-label="Decrease damage">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                        <span class="btn-text">HEAL</span>
                    </button>
                    <button type="button" class="damage-btn increase-btn" onclick={increasGroundAbilityDmg} aria-label="Increase damage">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                        <span class="btn-text">HARM</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .base-ability-container {
        width: 100%;
        max-width: 100%;
        padding: 1.5rem;
        /* No background - text rests on parent background */
    }

    .ability-row {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .ability-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .ability-label {
        font-family: var(--form-labels), serif;
        font-size: 1.5rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--color-surface-900);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        margin: 0;
    }

    :global(.dark) .ability-label {
        color: var(--color-surface-100);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }

    .ability-input {
        width: 5rem;
        height: 5rem;
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
        border: 3px solid var(--color-surface-600);
        border-radius: 0;
        background: rgba(245, 245, 245, 0.9);
        color: var(--color-surface-900);
        box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.2),
            0 0 0 0 transparent;
        transition: all 0.3s ease;
    }

    :global(.dark) .ability-input {
        background: rgba(26, 26, 26, 0.9);
        color: var(--color-surface-100);
        border-color: var(--color-surface-400);
        box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.6),
            0 0 0 0 transparent;
    }

    .ability-input:focus {
        outline: none;
        border-color: var(--color-primary-600);
        box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.2),
            0 0 0 3px rgba(217, 119, 6, 0.3);
        transform: scale(1.05);
    }

    :global(.dark) .ability-input:focus {
        box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.6),
            0 0 0 3px rgba(217, 119, 6, 0.3);
    }

    .damage-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
    }

    .damage-label {
        font-family: var(--form-labels), serif;
        font-size: 1.2rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-surface-800);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        margin: 0;
    }

    :global(.dark) .damage-label {
        color: var(--color-surface-200);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .damage-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
    }

    .damage-indicators {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .damage-indicator {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
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

    .control-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .damage-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem 1rem;
        border: 2px solid var(--color-surface-600);
        background: rgba(245, 245, 245, 0.8);
        color: var(--color-surface-900);
        font-family: 'Courier New', monospace;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        min-width: 4rem;
    }

    :global(.dark) .damage-btn {
        background: rgba(26, 26, 26, 0.8);
        color: var(--color-surface-100);
        border-color: var(--color-surface-400);
        box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .damage-btn:hover {
        transform: translateY(-2px);
        box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    :global(.dark) .damage-btn:hover {
        box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .damage-btn:active {
        transform: translateY(0);
        box-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .increase-btn {
        border-color: var(--color-warning-500);
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.1));
    }

    .increase-btn:hover {
        border-color: var(--color-warning-400);
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.2));
    }

    .decrease-btn {
        border-color: var(--color-primary-600);
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(180, 83, 9, 0.1));
    }

    .decrease-btn:hover {
        border-color: var(--color-primary-500);
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(180, 83, 9, 0.2));
    }

    .btn-icon {
        width: 1.5rem;
        height: 1.5rem;
        stroke-width: 3;
    }

    .btn-text {
        font-size: 0.75rem;
        line-height: 1;
    }

    /* Responsive adjustments */
    @media (min-width: 640px) {
        .ability-row {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
        }

        .ability-section {
            flex: 0 0 auto;
        }

        .damage-section {
            flex: 1;
            align-items: flex-end;
            max-width: 20rem;
        }

        .damage-controls {
            align-items: flex-end;
            width: auto;
        }
    }

    @media (min-width: 768px) {
        .damage-indicators {
            gap: 0.75rem;
        }

        .damage-indicator {
            width: 3rem;
            height: 3rem;
        }

        .control-buttons {
            gap: 1.5rem;
        }

        .damage-btn {
            min-width: 5rem;
        }
    }
</style>
