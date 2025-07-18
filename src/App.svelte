<script lang="ts">
    import './lib/styles/common-modal.css';

    import InfoModal from './lib/components/Modals/InfoModal.svelte';
    import DiceRollModal from './lib/components/Modals/DiceRollModal.svelte';
    import DragOverlay from './lib/components/DragOverlay.svelte';
    import { onMount } from 'svelte';
    import PanZoomContainer from './lib/components/PanZoomContainer.svelte';
    import SvgContent from './lib/components/contents/SvgContent.svelte';
    import ThemeSelector from './lib/components/ThemeSelector.svelte';
    import SizeSelector from './lib/components/SizeSelector.svelte';
    import OBR from '@owlbear-rodeo/sdk';
    import DiceRollerTest from './lib/components/DiceRollerTest.svelte';
    import DiceRollTest from './lib/components/DiceRollTest.svelte';
    import { diceStates } from './lib/states/dice.svelte';





    onMount(() => {

        if(OBR.isAvailable){

        }
        
    });

</script>





<!-- Add test component for the new dice roll modal -->
<!-- <DiceRollTest /> -->

<!-- Main Content -->
<main class="sheet-container">

<PanZoomContainer />
<SvgContent />

<!-- Global Modals -->
<InfoModal />
<DiceRollModal />

<!-- Drag and Drop Overlay -->
<!-- <DragOverlay /> -->

<!-- Global Utility Buttons -->

<!-- 
TODO: Use this instead of the AppBar component
<AppBar></AppBar> 
-->
<ThemeSelector />
<SizeSelector />

</main>






<!-- Modals -->


<style>


</style>


