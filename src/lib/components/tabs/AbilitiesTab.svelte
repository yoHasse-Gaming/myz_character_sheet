<script lang="ts">
    import BaseAbility from './tabcontents/BaseAbility.svelte';
    import Skills from './tabcontents/Skills.svelte';
    import { sheetState, characterActions, initialCardPositions } from '../../states/character_sheet.svelte';
    import OptionalSkillsModal from '../Modals/OptionalSkillsModal.svelte';
    import PaperCard from '../PaperCard.svelte';

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

<OptionalSkillsModal />

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

<PaperCard 
    paperId={"base-abilities"}

    draggable={true}
    resizable={false}
    minSize={{ width: 300, height: 80 }}
    initialPosition={initialCardPositions["base-abilities"]}
    class="p-2 pt-3"
    >

    {#snippet content()}
        {#each sheetState.baseAbilities as ability, index}

        <BaseAbility 
            baseAbility={ability}
            abilityIndex={index}
        />

            
        {/each}
    {/snippet}
</PaperCard>

<PaperCard 
    paperId="conditions"

    resizable={false}
    initialPosition={initialCardPositions["conditions"]}
    minSize={{ width: 300, height: 0 }}
    initialSize={{ width: 300, height: 200 }}
    > 

    
    {#snippet content()}
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
    <span class="">Kritiska skador:</span>
    <div class="torn-paper-wrapper">
        <textarea 
            class="critical-input font-user" 
            style="height: 100%;"
            placeholder="Beskrivning av allvarliga skador..." 
            bind:value={sheetState.criticalInjuries} 
        ></textarea>
    </div>
</div>
{/snippet}

</PaperCard>

<Skills  startPosition={initialCardPositions["skills-core"]} />

<style>

            .conditions-container {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                padding: 0.5rem;
                height: 100%;
            }            
            .condition-row {
                display: flex;
                gap: 1rem;
                align-items: center;
                justify-content: space-between;
            }

            .condition-item {
                display: flex;
                align-items: center;
                flex: 1;
                gap: 0.5rem;
                justify-content: space-between;
            }

            .condition-label {
                font-family: var(--form-labels), serif;
                font-size: 0.8rem;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--color-surface-900);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
                min-width: 4rem;
                flex: 1;
            }

            :global(.dark) .condition-label {
                color: var(--color-surface-100);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }

            .condition-indicator {
                width: 1.5rem;
                height: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                cursor: pointer;
                border: none;
                background: transparent;
                padding: 0;
                transition: transform 0.2s ease;
                flex-shrink: 0;
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
                /* .condition-row {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                } */

                .condition-item {
                    justify-content: space-between;
                }
            }
        </style>
