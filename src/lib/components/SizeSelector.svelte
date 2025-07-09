<script lang="ts">
    import { triggerRoll } from "../utils/diceUtils";

//     export interface DiceRollConfig {
//     dice: {
//         style: "MYZBASE" | "MYZSKILL" | "MYZGEAR";
//         count?: number;
//     }[];
//     hidden?: boolean;
// }


    function triggerDiceRoll() {
        console.log("Rolling dice...");
        triggerRoll({
            dice: [
                {
                    style: "MYZBASE",
                    count: 1
                },
                {
                    style: "MYZSKILL",
                    count: 1
                },
                {
                    style: "MYZGEAR",
                    count: 1
                }
            ],
            hidden: false
        })
    }

    
</script>

<div class="dice-roller-container">
	<button 
		class="btn variant-filled-surface dice-roller-btn util-btn"
		onclick={triggerDiceRoll}
		aria-label="Toggle size controls"
		title={'Roll a D6'}
	>
		🎲
	</button>
</div>


<style>
    .dice-roller-container {
		position: fixed;
		top: 1rem;
		right: 9rem;
		z-index: 999;
	}
</style>