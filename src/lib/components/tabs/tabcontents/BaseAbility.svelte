<script lang="ts">
    import { sheetState, characterActions } from '../../../states/character_sheet.svelte';
    import { fade, scale } from 'svelte/transition';
    import { openInfoModal } from '../../../states/modals.svelte';
    import { Rating } from '@skeletonlabs/skeleton-svelte';
    import { Ban, BicepsFlexed, Bone, Circle, type Icon as IconType } from '@lucide/svelte';
    import { diceStates } from '../../../states/dice.svelte';

    import { onMount } from 'svelte';
    import { getIconForAbility } from '../../../utils/iconUtils';
    import type { AbilityType, BaseAbilityType } from '../../../types';
    import PaperCard from '../../PaperCard.svelte';
    

    let { 
        baseAbility,
        abilityIndex,
        initialPosition = { x: 0, y: 0 }
    }: {
        baseAbility: BaseAbilityType;
        abilityIndex: number;
        initialPosition?: { x: number; y: number };
    } = $props();

    // Get the ability from global state
    const ability = $derived(sheetState.baseAbilities[abilityIndex]);

    const AbilityIcon = getIconForAbility(baseAbility.type);

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

    // Function to roll dice for this ability
    function rollForAbility() {
        if (!ability) return;

        characterActions.openAbilityRollModal(
            ability.label,
            ability.value,
            ability.damage
        );
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

    const currentTrauma = traumaDescriptions[baseAbility.damageLabel];

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

<PaperCard 
    paperId={baseAbility.type}
    tabName={'skillsTab'}
    draggable={true}
    resizable={false}
    minSize={{ width: 250, height: 80 }}
    initialPosition={initialPosition}
    class="p-2 pt-4"
    >

    {#snippet content()}

    <div class="ability-controls">
        <AbilityIcon />
        <span class="ability-label">{baseAbility.label}</span>
        <input type="number" 
            max="5" 
            min="1" 
            class="ability-input font-user" 
            name={baseAbility.label} 
            value={ability?.value || 1}
            oninput={handleValueChange} />
        {#if diceStates.isDicePluginAvailable}
        <button 
            class="dice-roll-button"
            onclick={() => rollForAbility()}
            aria-label="Slå tärning för {baseAbility.label}"
            title="Slå tärning för {baseAbility.label}"
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="1"></circle>
                <circle cx="15" cy="15" r="1"></circle>
            </svg>
        </button>
        {/if}
        
        <div class="damage-section">
            <div class="damage-header">
                <span class="damage-label">{baseAbility.damageLabel}</span>
                <button 
                    class="info-icon-button"
                    onclick={showTraumaInfo}
                    aria-label="Information om {baseAbility.damageLabel}"
                    title="Visa information om {baseAbility.damageLabel}"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9,9h6v6H9z"></path>
                        <path d="M9,9h6"></path>
                    </svg>
                </button>
            </div>
            <div class="damage-indicators">
                {#each Array.from({length: ability.value}, (_, idx) => idx) as idx}
                    <button 
                        class="damage-indicator"
                        onclick={() => toggleDamage(idx)}
                        aria-label="Toggle damage for indicator {idx + 1}"
                    >
                        {#if (ability?.damage || 0) > idx}
                            <Circle size={14} fill="red" />
                        {:else}
                            <Circle size={14} />
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

    </div>
    

    {/snippet}
</PaperCard>
    
<style>
    .ability-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.125rem;
        flex-wrap: wrap;
    }

    .ability-label {
        font-family: var(--form-labels), serif;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-surface-800);
        flex: 1;
        min-width: 0;
    }

    :global(.dark) .ability-label {
        color: var(--color-surface-200);
    }

    .ability-input {
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        font-size: 0.9rem;
        font-weight: bold;
        text-align: center;
        border: 2px solid var(--color-surface-600);
        border-radius: 4px;
        background: transparent;
        color: var(--color-surface-900);
        box-shadow: none;
        transition: all 0.2s ease;
        cursor: default;
        position: relative;
        z-index: 3;
        flex-shrink: 0;
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

    .dice-roll-button {
        background: none;
        border: 1px solid var(--color-primary-500);
        color: var(--color-primary-600);
        cursor: pointer;
        padding: 0.2rem;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        opacity: 0.8;
        width: 1.75rem;
        height: 1.75rem;
    }

    .dice-roll-button:hover {
        background: var(--color-primary-500);
        color: white;
        opacity: 1;
        transform: scale(1.05);
    }

    :global(.dark) .dice-roll-button {
        border-color: var(--color-primary-400);
        color: var(--color-primary-400);
    }

    :global(.dark) .dice-roll-button:hover {
        background: var(--color-primary-400);
        color: var(--color-surface-900);
    }

    .damage-section {
        min-width: 80px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.125rem;
        flex-shrink: 0;
    }

    .damage-header {
        display: flex;
        align-items: center;
        gap: 0.125rem;
    }

    .damage-label {
        font-family: var(--form-labels), serif;
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-surface-800);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
        margin: 0;
        position: relative;
        z-index: 3;
        flex-shrink: 0;
    }

    :global(.dark) .damage-label {
        color: var(--color-surface-200);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    .info-icon-button {
        background: none;
        border: none;
        color: var(--color-surface-600);
        cursor: pointer;
        padding: 0.15rem;
        border-radius: 50%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        flex-shrink: 0;
        width: 1.25rem;
        height: 1.25rem;
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

    .damage-indicators {
        display: flex;
        gap: 0.05rem;
        align-items: center;
        position: relative;
        z-index: 3;
        flex-shrink: 0;
    }

    .damage-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 0.05rem;
        transition: transform 0.2s ease;
        z-index: 4;
        width: 1rem;
        height: 1rem;
    }

    .damage-indicator:hover {
        transform: scale(1.1);
    }

    .damage-indicator:active {
        transform: scale(0.95);
    }

    /* Responsive adjustments */
    @media (max-width: 639px) {
        .ability-controls {
            flex-wrap: wrap;
            gap: 0.15rem;
        }
        
        .ability-label {
            font-size: 0.75rem;
        }
    }
</style>
