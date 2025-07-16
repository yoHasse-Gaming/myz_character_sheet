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
    import FormSection from './FormSection.svelte';
    
    import Dna from "@lucide/svelte/icons/dna";
    import { GraduationCap } from "@lucide/svelte";

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
                step: 0.1,
                startScale: 0.8,
                startX: 0,
                startY: 0,
                contain: 'outside',
                // Enable native panning but only when space is held
                disablePan: true,
                // Allow zooming with mouse wheel
                wheel: true,
                wheelStep: 0.1,
                animate: true,
                duration: 200,
                easing: 'ease-in-out',
                // Exclude InteractJS elements from panzoom events
                exclude: '.character-paper, .paper-card, [data-draggable], .interact-draggable'
            });

            // Space key handlers for pan mode
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.code === 'Space' && !event.repeat) {
                    event.preventDefault();
                    isPanMode = true;
                    // Enable panning when space is pressed
                    panzoom?.setOptions({ disablePan: false });
                    document.body.style.cursor = 'grab';
                }
                if (event.code === 'KeyR' && !event.repeat) {
                    event.preventDefault();
                    resetView();
                }
            };

            const handleKeyUp = (event: KeyboardEvent) => {
                if (event.code === 'Space') {
                    event.preventDefault();
                    isPanMode = false;
                    // Disable panning when space is released
                    panzoom?.setOptions({ disablePan: true });
                    document.body.style.cursor = '';
                }
            };

            // Add event listeners
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            console.log('PanZoom initialized successfully');

            // Cleanup function
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
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
            panzoom.reset();
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

    // Toggle pan mode
    function togglePanMode() {
        isPanMode = !isPanMode;
        if (panzoom) {
            panzoom.setOptions({ disablePan: !isPanMode });
            document.body.style.cursor = isPanMode ? 'grab' : '';
        }
    }
</script>

<div class="panzoom-wrapper">
    <!-- Pan/Zoom Controls -->
    <div class="panzoom-controls">
        <button class="control-btn" onclick={zoomIn} title="Zooma in (Ctrl + Scroll)" aria-label="Zooma in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
        </button>
        
        <button class="control-btn" onclick={zoomOut} title="Zooma ut (Ctrl + Scroll)" aria-label="Zooma ut">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
                <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
        </button>

        <button class="control-btn {isPanMode ? 'active' : ''}" onclick={togglePanMode} title="Panorera-läge (Håll mellanslag)" aria-label="Panorera-läge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
            </svg>
        </button>
        
        <button class="control-btn" onclick={resetView} title="Återställ vy (R)" aria-label="Återställ vy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
            </svg>
        </button>
    </div>

    <!-- Pan/Zoom Container -->
    <div class="panzoom-container {isPanMode ? 'pan-mode' : ''}" bind:this={containerElement}>
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

    <!-- Instructions -->
    <div class="instructions">
        <p>
            {#if isPanMode}
                🎯 <strong>PANORERA-LÄGE PÅ</strong> • Dra för att panorera • Släpp mellanslag för att stoppa
            {:else}
                🎯 Håll <strong>MELLANSLAG</strong> för att panorera • 🔍 Ctrl + Scroll för zooma • ⌨️ R för återställa
            {/if}
        </p>
    </div>
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

    /* Disable pointer events on draggable elements when in pan mode */
    .panzoom-container.pan-mode .character-paper,
    .panzoom-container.pan-mode .paper-card,
    .panzoom-container.pan-mode [data-draggable] {
        pointer-events: none;
    }

    .panzoom-container.pan-mode .character-paper:hover,
    .panzoom-container.pan-mode .paper-card:hover,
    .panzoom-container.pan-mode [data-draggable]:hover {
        transform: none !important;
    }

    .panzoom-content {
        display: block; /* Remove grid layout */
        position: relative;
        padding: 2rem;
        min-width: 300vw; /* Make content much wider for free-form layout */
        min-height: 200vh; /* Make content taller for more space */
        width: max-content; /* Ensure content doesn't get clipped */
        background: linear-gradient(45deg, 
            rgba(0,0,0,0.02) 0%, 
            rgba(0,0,0,0.01) 25%, 
            transparent 50%, 
            rgba(0,0,0,0.01) 75%, 
            rgba(0,0,0,0.02) 100%);
    }

    :global(.dark) .panzoom-content {
        background: linear-gradient(45deg, 
            rgba(255,255,255,0.02) 0%, 
            rgba(255,255,255,0.01) 25%, 
            transparent 50%, 
            rgba(255,255,255,0.01) 75%, 
            rgba(255,255,255,0.02) 100%);
    }

    /* Pan/Zoom Controls */
    .panzoom-controls {
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        padding: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
    }

    :global(.dark) .panzoom-controls {
        background: rgba(0, 0, 0, 0.8);
    }

    .control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--color-primary-500);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .control-btn:hover {
        background: var(--color-primary-600);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .control-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .control-btn.active {
        background: var(--color-primary-600);
        box-shadow: 0 0 0 2px var(--color-primary-200);
    }

    :global(.dark) .control-btn.active {
        background: var(--color-primary-400);
        box-shadow: 0 0 0 2px var(--color-primary-800);
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
