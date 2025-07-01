<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import BaseAbility from '$lib/components/BaseAbility.svelte';
    import { onMount } from 'svelte';
    import Skills from '../Skills.svelte';
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
    import o from '$lib/img/o.svg';
    import x from '$lib/img/x.svg';
</script> 

        <div class="properties-tab">
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                <div class="space-y-4 lg:space-y-6">
                    <FormSection header="GRUNDEGENSKAPER">
                        <div class="space-y-4">
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
                            <div class="condition-row">
                                <div class="condition-item">
                                    <span class="condition-label">Utsvulten</span>
                                    <button 
                                        class="condition-indicator"
                                        onclick={() => characterActions.toggleCondition('isStarving')}
                                        aria-label="Toggle utsvulten tillstånd"
                                    >
                                        <img src={o} alt="Inaktiv" class="condition-circle" />
                                        {#if sheetState.conditions.isStarving}
                                            <img src={x} alt="Aktiv" class="condition-x" />
                                        {/if}
                                    </button>
                                </div>
                                <div class="condition-item">
                                    <span class="condition-label">Sömnlös</span>
                                    <button 
                                        class="condition-indicator"
                                        onclick={() => characterActions.toggleCondition('isSleepDeprived')}
                                        aria-label="Toggle sömnlös tillstånd"
                                    >
                                        <img src={o} alt="Inaktiv" class="condition-circle" />
                                        {#if sheetState.conditions.isSleepDeprived}
                                            <img src={x} alt="Aktiv" class="condition-x" />
                                        {/if}
                                    </button>
                                </div>
                            </div>
                            <div class="condition-row">
                                <div class="condition-item">
                                    <span class="condition-label">Uttorkad</span>
                                    <button 
                                        class="condition-indicator"
                                        onclick={() => characterActions.toggleCondition('isDehydrated')}
                                        aria-label="Toggle uttorkad tillstånd"
                                    >
                                        <img src={o} alt="Inaktiv" class="condition-circle" />
                                        {#if sheetState.conditions.isDehydrated}
                                            <img src={x} alt="Aktiv" class="condition-x" />
                                        {/if}
                                    </button>
                                </div>
                                <div class="condition-item">
                                    <span class="condition-label">Nedkyld</span>
                                    <button 
                                        class="condition-indicator"
                                        onclick={() => characterActions.toggleCondition('isFreezing')}
                                        aria-label="Toggle nedkyld tillstånd"
                                    >
                                        <img src={o} alt="Inaktiv" class="condition-circle" />
                                        {#if sheetState.conditions.isFreezing}
                                            <img src={x} alt="Aktiv" class="condition-x" />
                                        {/if}
                                    </button>
                                </div>
                            </div>
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
                <div class="xl:col-span-2">
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
                gap: 1rem;
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
                filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
            }

            .condition-x {
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
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