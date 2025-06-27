

<script lang="ts">

    let { 
        groundAbilityLabel,
        groundAbilityDmgLabel,
        groundAbilityValue = $bindable(),
        groundAbilityDmg = $bindable(),
    } = $props();


    function increasGroundAbilityDmg() {
        if (groundAbilityDmg < 5) {
            groundAbilityDmg++;
        }
    }
    function decreaseGroundAbilityDmg() {
        if (groundAbilityDmg > 0) {
            groundAbilityDmg--;
        }
    }

</script>


<div class="ground-ability-grid bg-surface-200 dark:bg-surface-700 p-4 rounded-lg">
    <label for={groundAbilityLabel} class="label font-semibold">{groundAbilityLabel}</label>
    <input type="number" 
           max="10" 
           min="1" 
           class="input input-sm w-16" 
           name={groundAbilityLabel} 
           bind:value={groundAbilityValue} />
    <div class="space-y-2">
        <span class="text-sm font-medium">{groundAbilityDmgLabel}</span>
        <div class="flex gap-1">
            {#each [0, 1, 2, 3, 4, 5] as idx}
                <input 
                    type="radio" 
                    disabled
                    class="radio radio-sm opacity-100"
                    name="{groundAbilityLabel}_{idx}" 
                    readonly 
                    checked={groundAbilityDmg > idx ? true : null} />
            {/each}
        </div>
    </div>
    <div class="btn-group-vertical">
        <button type="button" class="btn btn-sm variant-filled-primary" onclick={increasGroundAbilityDmg} aria-label="Increase damage">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M9 12h6" />
                <path d="M12 9v6" />
            </svg>
        </button>
        <button type="button" class="btn btn-sm variant-filled-primary" onclick={decreaseGroundAbilityDmg} aria-label="Decrease damage">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <path d="M9 12l6 0" />
            </svg>
        </button>
    </div>
</div>

<!-- Custom styling overrides for ground abilities -->

<style>
    .ground-ability-grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto;
        gap: 1rem;
        align-items: start;
    }
</style>
