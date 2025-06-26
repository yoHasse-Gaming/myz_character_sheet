

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


<div class="grid ground-ability">

    <label for={groundAbilityLabel} class="ground-ability-value-label">{groundAbilityLabel}</label>
    <input type="number" max="10" min="1" class="ground-ability-value" name={groundAbilityLabel} bind:value={groundAbilityValue} />
    <div>
        <span class="ground-ability-damage-label">{groundAbilityDmgLabel}</span>
        <div class="grid ground-ability-damage">
            {#each [0, 1, 2, 3, 4, 5] as idx}
                <input 
                    type="radio" 
                    disabled
                    style="opacity: 1;"
                    name="{groundAbilityLabel}_{idx}" readonly checked={groundAbilityDmg > idx ? true : null} />
            {/each}
        </div>
    </div>
    <div class="ground-ability-damage-buttons">
        <button onclick={increasGroundAbilityDmg} aria-label="Increase damage" >
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>
        </button>
        <button onclick={decreaseGroundAbilityDmg} aria-label="Decrease damage" >
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-minus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l6 0" /></svg>
        </button>

    </div>





</div>
<!-- Make these buttons to appear at the end of the ground ability section, next to the damage inputs. -->



<style>

    .ground-ability {
        width: auto;
        grid-template-columns: 5rem 4rem 10rem 1.5rem;

        /* grid-template-columns: 100px 50px 1fr; */

    }



    .ground-ability-value {
        max-width: 100px;
    }

    .ground-ability-damage-label {
        margin-bottom: 1rem;
    }

    .ground-ability-damage {
        gap: 24px;
        max-width: 10rem;
    }

    .ground-ability-damage-buttons {
        max-height: 24px;
        
    }
    .ground-ability-damage-buttons>button {
        padding: 0;
        min-height: 12px;
    }

    .ground-ability-damage-buttons>button:nth-child(1) {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
    }
    .ground-ability-damage-buttons>button:nth-child(2) {
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
    }

    .ground-ability-damage-buttons>button svg {
        width: 24px;
        height: 24px;
        float: inline-end;
    }

    

    label {
        font-weight: bold;
    }



</style>
