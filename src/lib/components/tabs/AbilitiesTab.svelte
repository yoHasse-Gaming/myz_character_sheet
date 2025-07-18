<script lang="ts">
    import FormSection from '../FormSection.svelte';
    import BaseAbility from '../BaseAbility.svelte';
    import { onMount } from 'svelte';
    import Skills from '../Skills.svelte';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';

    type Condition = {
        name: keyof typeof sheetState.conditions;
        label: string;
    }

    const conditionAndToggle: Condition[] = [
        { name: 'isStarving', label: 'Utsvulten' },
        { name: 'isSleepDeprived', label: 'Sömnlös' },
        { name: 'isDehydrated', label: 'Uttorkad' },
        { name: 'isFreezing', label: 'Nedkyld' }
    ];


</script> 

{#snippet conditionItem(condition: Condition)}
<div class="condition-item">
    <span class="condition-label">{condition.label}</span>
    <button 
        class="condition-indicator"
        onclick={() => characterActions.toggleCondition(condition.name)}
        aria-label={`Toggle ${condition.label.toLowerCase()} tillstånd`}
    >
        <img src='/img/strokes/o.svg' alt="Inaktiv" class="stroke-image condition-circle" />
        {#if sheetState.conditions[condition.name]}
            <img src='/img/strokes/x.svg' alt="Aktiv" class="stroke-image condition-x" />
        {/if}
    </button>
</div>
{/snippet}

        <div class="properties-tab">
            <div class="grid s:grid-cols-1 grid-cols-2 gap-4 lg:gap-6">
                <div class="space-y-4 lg:space-y-6">
                    <FormSection header="GRUNDEGENSKAPER">
                        <div class="space-y-4 ">
                            {#each sheetState.baseAbilities as ability, index}
                                <BaseAbility
                                    baseAbilityLabel={ability.label}
                                    baseAbilityDmgLabel={ability.damageLabel}
                                    abilityIndex={index}
                                />
                            {/each}
                        </div>
                    </FormSection>
                    
                    <FormSection header="TILLSTÅND">
                        <div class="conditions-container">
                            {#each conditionAndToggle as condition, index}
                                {#if index % 2 === 0}
                                    <div class="condition-row">
                                        {@render conditionItem(condition)}
                                        {#if conditionAndToggle[index + 1]}
                                            {@render conditionItem(conditionAndToggle[index + 1])}
                                        {/if}
                                    </div>
                                {/if}
                            {/each}

                            <div class="condition-row critical-injuries">
                                <div class="condition-item critical-item">
                                    <span class="condition-label critical-label">Kritiska skador:</span>
                                    <input 
                                        type="text" 
                                        class="critical-input font-user" 
                                        placeholder="Beskrivning av allvarliga skador..." 
                                        bind:value={sheetState.criticalInjuries} 
                                    />
                                </div>
                            </div>
                        </div>
                    </FormSection>
                </div>
                <div >
                    <FormSection header="FÄRDIGHETER">
                        <Skills />
                    </FormSection>
                </div>
            </div>
        </div>

        <style>
            .conditions-container {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                padding: 0.5rem;
            }

            .condition-row {
                display: flex;
                gap: 2rem;
                align-items: center;
                justify-content: space-between;
            }

            .condition-item {
                display: flex;
                align-items: center;
                flex: 1;
            }

            .condition-label {
                font-family: var(--form-labels), serif;
                font-size: 1rem;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--color-surface-900);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
                min-width: 6rem;
            }

            :global(.dark) .condition-label {
                color: var(--color-surface-100);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }

            .condition-indicator {
                width: 2rem;
                height: 2rem;
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

            .condition-indicator:hover {
                transform: scale(1.1);
            }

            .condition-indicator:active {
                transform: scale(0.95);
            }

            .condition-circle {
                width: 100%;
                height: 100%;
                object-fit: contain;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
                /* filter: var(--svg-filter-surface-900) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3)); */
                /* Filter applied via CSS class */
            }

            .condition-x {
                width: 100%;
                height: 100%;
                object-fit: contain;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                /* Filter applied via CSS class */
            }

            .critical-injuries {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--color-surface-300);
            }

            :global(.dark) .critical-injuries {
                border-top-color: var(--color-surface-600);
            }

            .critical-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }

            .critical-label {
                color: var(--color-warning-600);
                font-size: 1.1rem;
            }

            :global(.dark) .critical-label {
                color: var(--color-warning-400);
            }

            .critical-input {
                width: 100%;
                padding: 0.5rem;
                border: 2px solid var(--color-surface-400);
                border-radius: 0;
                background: rgba(245, 245, 245, 0.9);
                color: var(--color-surface-900);
                font-size: 0.9rem;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            :global(.dark) .critical-input {
                background: rgba(26, 26, 26, 0.9);
                color: var(--color-surface-100);
                border-color: var(--color-surface-500);
            }

            .critical-input:focus {
                outline: none;
                border-color: var(--color-warning-500);
                box-shadow: 
                    inset 0 1px 2px rgba(0, 0, 0, 0.1),
                    0 0 0 2px rgba(245, 158, 11, 0.3);
            }

            :global(.dark) .critical-input:focus {
                box-shadow: 
                    inset 0 1px 2px rgba(0, 0, 0, 0.3),
                    0 0 0 2px rgba(245, 158, 11, 0.3);
            }

            /* Responsive adjustments */
            @media (max-width: 639px) {
                .condition-row {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }

                .condition-item {
                    justify-content: space-between;
                }
            }
        </style>