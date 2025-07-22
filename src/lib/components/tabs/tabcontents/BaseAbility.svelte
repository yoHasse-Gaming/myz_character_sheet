<script lang="ts">
    import { sheetState, characterActions } from '../../../states/character_sheet.svelte';
    import { fade, scale } from 'svelte/transition';
    import { openInfoModal } from '../../../states/modals.svelte';
    import { Rating, Tooltip } from '@skeletonlabs/skeleton-svelte';
    import { Ban, BicepsFlexed, Bone, Circle, Dices, Info, type Icon as IconType } from '@lucide/svelte';
    import { diceStates } from '../../../states/dice.svelte';

    import { onMount } from 'svelte';
    import { getIconForAbility } from '../../../utils/iconUtils';
    import type { AbilityType, BaseAbilityType } from '../../../types';
    import PaperCard from '../../PaperCard.svelte';


    let tooltipStates: Record<string, boolean> = $state({});
    

    let { 
        baseAbility,
        abilityIndex,
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

    <div class="grid grid-cols-3 content-center">
            <Tooltip
                open={tooltipStates[`ability-${abilityIndex}`] || false}
                onOpenChange={(e) => (tooltipStates[`ability-${abilityIndex}`] = e.open)}
                positioning={{ placement: 'top' }}
                contentBase="card preset-filled p-4"
                openDelay={200}
                arrow
            >
                {#snippet trigger()}            
                <span class="ability-label content-center">
                    <AbilityIcon size={20} />
                    {baseAbility.label}
                </span>
            {/snippet}
                {#snippet content()}
                    <div class="torn-paper-wrapper tooltip-wrapper">
                        <div class="torn-paper-content tooltip max-w-100 justify-center align-center">
                            <strong class="">{baseAbility.label}</strong>
                            <div class="tooltip-description">{baseAbility.description}</div>
                        </div>
                    </div>
                {/snippet}
            </Tooltip>


        {#if diceStates.isDicePluginAvailable}
            <button 
                onclick={() => rollForAbility()}
                aria-label="Slå tärning för {baseAbility.label}"
                title="Slå tärning för {baseAbility.label}"
            >
                <Dices />
            </button>
        {/if}

        <input type="number" 
            max="5" 
            min="1" 
            class="ability-input font-user content-center" 
            name={baseAbility.label} 
            value={ability?.value || 1}
            oninput={handleValueChange} />

        
        <div class="damage-section">
            <div class="damage-header">
                <span class="damage-label">{baseAbility.damageLabel}</span>
                <button 
                    class="info-icon-button"
                    onclick={showTraumaInfo}
                    aria-label="Information om {baseAbility.damageLabel}"
                    title="Visa information om {baseAbility.damageLabel}"
                >
                    <Info size={12} />
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
                            <Circle size={14} fill="var(--color-error-800)" />
                        {:else}
                            <Circle size={14} />
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

    </div>
    


<style>
    .ability-label {
        text-align: left;
        font-family: var(--form-labels), serif;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-surface-800);
        min-width: 0;
    }

    :global(.dark) .ability-label {
        color: var(--color-surface-200);
    }

    .ability-input {
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
        background: transparent;
        color: var(--color-surface-900);
        box-shadow: none;
        transition: all 0.2s ease;
        cursor: default;
        position: relative;
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

    .damage-section {
        min-width: 100px;
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
        flex-shrink: 0;
    }

    :global(.dark) .damage-label {
        color: var(--color-surface-200);
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    }

    .damage-indicators {
        display: flex;
        gap: 0.05rem;
        align-items: center;
        position: relative;
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
