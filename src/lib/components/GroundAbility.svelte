

<script lang="ts">

    let { 
        groundAbilityLabel,
        groundAbilityDmgLabel,
        groundAbilityValue = $bindable(),
        groundAbilityDmg = $bindable(),
    } = $props();

</script>


<div class="grid">

<label>{groundAbilityLabel}</label>
<input type="number" bind:value={groundAbilityValue} />

<span >{groundAbilityDmgLabel}</span>

<div class="grid">
    {#each [0, 1, 2, 3, 4, 5] as idx}
        <input 
            type="radio" 
            name="{groundAbilityLabel}_{idx}" readonly checked={groundAbilityDmg > idx ? true : null} />
    {/each}
    <div role="group">
        <button onclick={() => groundAbilityDmg--} aria-label="Decrease damage">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l6 0" /></svg>
        </button>
        <button onclick={() => groundAbilityDmg++} aria-label="Increase damage">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>
        </button>
    </div>
</div>

</div>


<style>

    label {
        font-weight: bold;
    }



</style>
