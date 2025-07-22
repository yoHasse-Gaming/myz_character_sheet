<script lang="ts">
    import './lib/styles/common-modal.css';

    import InfoModal from './lib/components/Modals/InfoModal.svelte';
    import DiceRollModal from './lib/components/Modals/DiceRollModal.svelte';
    import SizeControlsModal from './lib/components/Modals/SizeControlsModal.svelte';
    import StorageControlsModal from './lib/components/Modals/StorageControlsModal.svelte';
    import PanZoomContainer from './lib/components/PanZoomContainer.svelte';
    import SvgContent from './lib/components/contents/SvgContent.svelte';



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
<StorageControlsModal />

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


