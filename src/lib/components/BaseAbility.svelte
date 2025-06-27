

<script lang="ts">

    let { 
        baseAbilityLabel,
        baseAbilityDmgLabel,
        baseAbilityValue = $bindable(),
        baseAbilityDmg = $bindable(),
    } = $props();


    function increasGroundAbilityDmg() {
        if (baseAbilityDmg < 5) {
            baseAbilityDmg++;
        }
    }
    function decreaseGroundAbilityDmg() {
        if (baseAbilityDmg > 0) {
            baseAbilityDmg--;
        }
    }

</script>


<div class="base-ability-container bg-surface-200 dark:bg-surface-700 p-4 rounded-lg">
    <div class="ability-row">
        <div class="ability-section">
            <label for={baseAbilityLabel} class="label font-semibold text-sm">{baseAbilityLabel}</label>
            <input type="number" 
                   max="10" 
                   min="1" 
                   class="input input-sm text-center font-user" 
                   name={baseAbilityLabel} 
                   bind:value={baseAbilityValue} />
        </div>
        
        <div class="damage-section">
            <span class="text-sm font-medium mb-2 block">{baseAbilityDmgLabel}</span>
            <div class="damage-controls">
                <div class="radio-row">
                    {#each [0, 1, 2, 3, 4, 5] as idx}
                        <input 
                            type="radio" 
                            disabled
                            class="radio radio-sm opacity-100"
                            name="{baseAbilityLabel}_{idx}" 
                            readonly 
                            checked={baseAbilityDmg > idx ? true : null} />
                    {/each}
                </div>
                <div class="control-buttons">
                    <button type="button" class="btn btn-sm variant-filled-primary" onclick={decreaseGroundAbilityDmg} aria-label="Decrease damage">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path d="M9 12l6 0" />
                        </svg>
                    </button>
                    <button type="button" class="btn btn-sm variant-filled-primary" onclick={increasGroundAbilityDmg} aria-label="Increase damage">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                            <path d="M9 12h6" />
                            <path d="M12 9v6" />
                        </svg>
                    </button>

                </div>
            </div>
        </div>
    </div>
</div>

<!-- Custom styling overrides for ground abilities -->

<style>
    .base-ability-container {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
    }

    .ability-row {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .ability-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .ability-section input {
        width: 4rem;
        max-width: 100%;
    }

    .damage-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .damage-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
    }

    .radio-row {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .control-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .control-buttons .btn {
        min-width: 2.5rem;
        height: 2.5rem;
        padding: 0.25rem;
    }

    /* Responsive adjustments */
    @media (min-width: 640px) {
        .ability-row {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
        }

        .ability-section {
            flex: 0 0 auto;
        }

        .damage-section {
            flex: 1;
            align-items: flex-end;
        }

        .damage-controls {
            align-items: flex-end;
        }
    }
</style>
