<script lang="ts">
    import './lib/styles/common-modal.css';

    import InfoModal from './lib/components/Modals/InfoModal.svelte';
    import DiceRollModal from './lib/components/Modals/DiceRollModal.svelte';
    import SizeControlsModal from './lib/components/Modals/SizeControlsModal.svelte';
    import PanZoomContainer from './lib/components/PanZoomContainer.svelte';
    import SvgContent from './lib/components/contents/SvgContent.svelte';
    import { AppBar } from '@skeletonlabs/skeleton-svelte';



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
<SizeControlsModal />

<!-- Drag and Drop Overlay -->

<!-- Global Utility Buttons -->

<!-- 
TODO: Use this instead of the AppBar component
<AppBar></AppBar> 
-->

</main>






<!-- Modals -->


<style>


</style>


