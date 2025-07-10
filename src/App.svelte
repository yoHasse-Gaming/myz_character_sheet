<script lang="ts">
    import OptionalSkillsModal from './lib/components/Modals/OptionalSkillsModal.svelte';
    import MutationsModal from './lib/components/Modals/MutationsModal.svelte';
    import TalentsModal from './lib/components/Modals/TalentsModal.svelte';
    import InfoModal from './lib/components/Modals/InfoModal.svelte';
    import { onMount } from 'svelte';
    import Tabs from './lib/components/Tabs.svelte';
    import SvgContent from './lib/components/contents/SvgContent.svelte';
    import ThemeSelector from './lib/components/ThemeSelector.svelte';
    import SizeSelector from './lib/components/SizeSelector.svelte';
    import OBR from '@owlbear-rodeo/sdk';
    import DiceRollerTest from './lib/components/DiceRollerTest.svelte';
    import { diceStates } from './lib/states/dice.svelte';



    onMount(() => {

        if(OBR.isAvailable){

        }
        
    });

</script>

<!-- Global Modals -->
<InfoModal />
<OptionalSkillsModal />
<MutationsModal />
<TalentsModal modalType="occupational" />
<TalentsModal modalType="generic" />

<!-- Global Utility Buttons -->
<ThemeSelector />
<SizeSelector />

{#if diceStates.isDicePluginAvailable && diceStates.broadCastAvailabilityCheck}
    <DiceRollerTest />
{/if}

<!-- Main Content -->
<main class="sheet-container">

<SvgContent />
<Tabs />

</main>




<!-- Modals -->


<style>


</style>


