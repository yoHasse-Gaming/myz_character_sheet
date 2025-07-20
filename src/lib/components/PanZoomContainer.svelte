<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Panzoom from '@panzoom/panzoom';
    import type { PanzoomObject } from '@panzoom/panzoom';
    
    // Import all tab components
    import CharacterTab from './tabs/CharacterTab.svelte';
    import AbilitiesTab from './tabs/AbilitiesTab.svelte';
    import Mutations from './tabs/Mutations.svelte';
    import TalentsTab from './tabs/TalentsTab.svelte';
    import EquipmentTab from './tabs/EquipmentTab.svelte';
    import RelationsNotesTab from './tabs/RelationsNotesTab.svelte';
    import DraggableAddItem from './DraggableAddItem.svelte';
    import DropZoneContainer from './DropZoneContainer.svelte';
    import AppControls from './AppControls.svelte';

    let containerElement: HTMLElement;
    let contentElement: HTMLElement;
    let panzoom: PanzoomObject | null = null;
    let isPanMode = $state(false);

    onMount(() => {
        if (containerElement && contentElement) {
            // Initialize Panzoom with proper settings that don't conflict with InteractJS
            panzoom = Panzoom(contentElement, {
                maxScale: 3,
                minScale: 0.3,
                step: 0.2,
                startScale: 3,
                startX: 0,
                startY: 0,
                contain: 'outside',
                cursor: 'default',
                noBind: true, // Disable default event binding to avoid conflicts
                wheel: true,
                wheelStep: 0.3,
                animate: true,
                duration: 200,
                easing: 'ease-in-out'
            });

            function handlePointerDown(event: PointerEvent) {
                // Handle middle mouse button or when in pan mode
                if (event.button === 1 || isPanMode) { 
                    event.preventDefault(); // Prevent default middle-click behavior
                    panzoom?.handleDown(event);
                    
                    // Set pointer capture to ensure we get all pointer events
                    containerElement.setPointerCapture(event.pointerId);
                }
            }

            function handleMove(event: PointerEvent) {
                // Only handle move if we're in the middle of a pan operation
                panzoom?.handleMove(event);
            }

            function handlePointerUp(event: PointerEvent) {
                panzoom?.handleUp(event);
                
                // Release pointer capture
                if (containerElement.hasPointerCapture(event.pointerId)) {
                    containerElement.releasePointerCapture(event.pointerId);
                }
            }

            function handlePointerLeave(event: PointerEvent) {
                // Force end the pan operation when pointer leaves the container
                panzoom?.handleUp(event);
                
                // Release pointer capture if we have it
                if (containerElement.hasPointerCapture(event.pointerId)) {
                    containerElement.releasePointerCapture(event.pointerId);
                }
                
                // Additional safety: force release all pointer captures
                try {
                    containerElement.releasePointerCapture(event.pointerId);
                } catch (e) {
                    // Ignore errors if pointer capture wasn't set
                }
            }

            function handlePointerCancel(event: PointerEvent) {
                // Force end the pan operation when pointer is cancelled
                panzoom?.handleUp(event);
                
                // Release pointer capture if we have it
                if (containerElement.hasPointerCapture(event.pointerId)) {
                    containerElement.releasePointerCapture(event.pointerId);
                }
                
                // Additional safety: force release all pointer captures
                try {
                    containerElement.releasePointerCapture(event.pointerId);
                } catch (e) {
                    // Ignore errors if pointer capture wasn't set
                }
            }

            // Add event listeners
            containerElement.addEventListener('pointerdown', handlePointerDown);
            containerElement.addEventListener('pointermove', handleMove);
            containerElement.addEventListener('pointerup', handlePointerUp);
            containerElement.addEventListener('pointerleave', handlePointerLeave);
            containerElement.addEventListener('pointercancel', handlePointerCancel);

            // zoom out to fit the content initially

            setTimeout(() => panzoom?.zoom(1), 100); // Adjust initial zoom level as needed

            // Add global event listeners to catch events when mouse leaves the window
            function handleGlobalPointerUp(event: PointerEvent) {
                panzoom?.handleUp(event);
            }

            function handleGlobalPointerCancel(event: PointerEvent) {
                panzoom?.handleUp(event);
            }

            // Add global listeners to catch events outside the container
            document.addEventListener('pointerup', handleGlobalPointerUp);
            document.addEventListener('pointercancel', handleGlobalPointerCancel);
            // document.addEventListener('blur', handleGlobalPointerCancel); // Handle window losing focus

            // Cleanup function
            return () => {
                if (panzoom) {
                    panzoom.destroy();
                }
                containerElement.removeEventListener('pointerdown', handlePointerDown);
                containerElement.removeEventListener('pointermove', handleMove);
                containerElement.removeEventListener('pointerup', handlePointerUp);
                containerElement.removeEventListener('pointerleave', handlePointerLeave);
                containerElement.removeEventListener('pointercancel', handlePointerCancel);
                
                // Remove global listeners
                document.removeEventListener('pointerup', handleGlobalPointerUp);
                document.removeEventListener('pointercancel', handleGlobalPointerCancel);
                // document.removeEventListener('blur', handleGlobalPointerCancel);
            };

        }
    });

    onDestroy(() => {
        if (panzoom) {
            panzoom.destroy();
        }
        // Reset cursor
        document.body.style.cursor = '';
    });

    // Reset pan and zoom to default
    function resetView() {
        if (panzoom) {
            setTimeout(() => panzoom?.zoom(1), 100); // Adjust initial zoom level as needed
            setTimeout(() => panzoom?.pan(0, 0), 100); // Reset pan position
        }
    }

    // Zoom in
    function zoomIn() {
        if (panzoom) {
            panzoom.zoomIn();
        }
    }

    // Zoom out
    function zoomOut() {
        if (panzoom) {
            panzoom.zoomOut();
        }
    }

    function onWheel(event: WheelEvent) {
        if (!panzoom) {
            return;

        }
        // Check if ctrl is pressed for zooming
        if (!event.ctrlKey && !event.metaKey) {
            return;
        }
        
        // Use panzoom's zoomWithWheel method
        panzoom.zoomWithWheel(event);
    }

</script>

<div class="panzoom-wrapper">
    <!-- App Controls Bar -->
    <AppControls panZoomControls={{ zoomIn, zoomOut, resetView }} />

    <!-- Pan/Zoom Container -->
    <div class="panzoom-container {isPanMode ? 'pan-mode' : ''}" bind:this={containerElement} onwheel={onWheel}>
        <div class="panzoom-content" bind:this={contentElement}>
            <!-- Character Tab Content -->
            <CharacterTab />
            <!-- Abilities Tab Content -->
            <AbilitiesTab />
            <Mutations />

            <TalentsTab />
            <!-- Equipment Tab Content -->
            <EquipmentTab />
            <!-- Relations Tab Content -->
            <RelationsNotesTab />
        </div>
    </div>

        <!-- Draggable Add Item -->
    <DraggableAddItem 
        text="Lägg till"
        ariaLabel="Dra för att lägga till nytt innehåll"
        variant="variant-5"
        dragType="add-item"
    />

    <!-- Instructions -->
    <div class="instructions">
        <p>
            {#if isPanMode}
                🎯 <strong>PANORERA-LÄGE PÅ</strong> • Dra för att panorera • Släpp mittenknappen för att stoppa
            {:else}
                🎯 Håll <strong>MITTENKNAPPEN</strong> för att panorera • 🔍 Ctrl + Scroll för zooma • ⌨️ R för återställa
            {/if}
        </p>
    </div>

    <!-- Drop Zone Container for adding new items -->
    <DropZoneContainer />
</div>

<style>
    .panzoom-wrapper {
        position: relative;
        width: 100%;
        height: 100vh;
        overflow: hidden; /* Ensure no scrollbars */
        border-radius: 8px;
    }

    .panzoom-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        cursor: default;
        position: relative;
    }

    .panzoom-container.pan-mode {
        cursor: grab;
    }

    .panzoom-container.pan-mode:active {
        cursor: grabbing;
    }


    .panzoom-content {
        display: block; /* Remove grid layout */
        position: relative;
        padding: 5rem 2rem 2rem 2rem; /* Add top padding for AppBar */
        min-width: 300vw; /* Make content much wider for free-form layout */
        min-height: 200vh; /* Make content taller for more space */
        width: max-content; /* Ensure content doesn't get clipped */
        /* Create a visible pattern that moves with panning */
        background-image: url('/img/sheet_bg.png') !important;

        background-size: 1920px 1920px;
    }

    :global(.dark) .panzoom-content {
        background-image: url('/img/sheet_bg_dark.png') !important;
    }

    /* Instructions */
    .instructions {
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 20px;
        font-size: 0.875rem;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .instructions p {
        margin: 0;
        text-align: center;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .instructions {
            font-size: 0.75rem;
            padding: 0.5rem 1rem;
        }
    }

    /* Override tab-specific styles */

    :global(.reset-layout-container) {
        position: relative !important;
        top: auto !important;
        right: auto !important;
        margin-bottom: 1rem;
    }
</style>
