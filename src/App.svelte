<script lang="ts">
    import './lib/styles/common-modal.css';

    import InfoModal from './lib/components/Modals/InfoModal.svelte';
    import DiceRollModal from './lib/components/Modals/DiceRollModal.svelte';
    import PanZoomContainer from './lib/components/PanZoomContainer.svelte';
    import SvgContent from './lib/components/contents/SvgContent.svelte';
    import ThemeSelector from './lib/components/ThemeSelector.svelte';
    import SizeSelector from './lib/components/SizeSelector.svelte';



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


