<script lang="ts">
    import OptionalSkillsModal from './lib/components/Modals/OptionalSkillsModal.svelte';
    import MutationsModal from './lib/components/Modals/MutationsModal.svelte';
    import TalentsModal from './lib/components/Modals/TalentsModal.svelte';
    import InfoModal from './lib/components/Modals/InfoModal.svelte';
    import DragOverlay from './lib/components/DragOverlay.svelte';
    import { onMount } from 'svelte';
    import Tabs from './lib/components/Tabs.svelte';
    import SvgContent from './lib/components/contents/SvgContent.svelte';
    import ThemeSelector from './lib/components/ThemeSelector.svelte';
    import SizeSelector from './lib/components/SizeSelector.svelte';
    import OBR from '@owlbear-rodeo/sdk';
    import DiceRollerTest from './lib/components/DiceRollerTest.svelte';
    import { diceStates } from './lib/states/dice.svelte';
    import EquipmentModal from './lib/components/Modals/EquipmentModal.svelte';
    import WeaponModal from './lib/components/Modals/WeaponModal.svelte';
    import ArmorModal from './lib/components/Modals/ArmorModal.svelte';
    import { isDialogueOpen } from './lib/states/modals.svelte';



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

<!-- Modal Components -->
<EquipmentModal />

<WeaponModal />

<ArmorModal />

<!-- {#if isDialogueOpen()}
<div class="modal-backdrop">
</div>
{/if} -->

<!-- Drag and Drop Overlay -->
<DragOverlay />

<!-- Global Utility Buttons -->

<!-- 
TODO: Use this instead of the AppBar component
<AppBar></AppBar> 
-->
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


