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

    onMount(() => {
        if (containerElement && contentElement) {
            // Initialize Panzoom
            panzoom = Panzoom(contentElement, {
                maxScale: 3,
                minScale: 0.3,
                step: 0.1,
                startScale: 0.8, // Start slightly zoomed out to see more content
                startX: 0,
                startY: 0,
                contain: 'outside', // Allow panning outside the bounds
                cursor: 'move',
                // Allow panning with mouse wheel + ctrl
                wheel: true,
                wheelStep: 0.1,
                // Smooth transitions
                animate: true,
                duration: 200,
                easing: 'ease-in-out'
            });

            // Add wheel event listener for zoom with Ctrl key
            const handleWheel = (event: WheelEvent) => {
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    // Use panzoom's built-in wheel handling
                }
            };

            containerElement.addEventListener('wheel', handleWheel, { passive: false });

            console.log('PanZoom initialized');
        }
    });

    onDestroy(() => {
        if (panzoom) {
            panzoom.destroy();
        }
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
        
        <button class="control-btn" onclick={resetView} title="Återställ vy" aria-label="Återställ vy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
            </svg>
        </button>
    </div>

    <!-- Pan/Zoom Container -->
    <div class="panzoom-container" bind:this={containerElement}>
        <div class="panzoom-content" bind:this={contentElement}>
            <!-- Character Section -->
            <div class="content-section character-section">
                <h2 class="section-title">Karaktär</h2>
                <CharacterTab />
            </div>

            <!-- Abilities Section -->
            <div class="content-section abilities-section">
                <h2 class="section-title">Egenskaper</h2>
                <AbilitiesTab />
            </div>

            <!-- Mutations Section -->
            <div class="content-section mutations-section">
                <h2 class="section-title">Mutationer</h2>
                <div class="talents-mutations-tab">
                    <FormSection header="MUTATIONER" headerIcon={Dna}>
                        <Mutations />
                    </FormSection>
                </div>
            </div>

            <!-- Talents Section -->
            <div class="content-section talents-section">
                <h2 class="section-title">Talanger</h2>
                <FormSection header="TALANGER" headerIcon={GraduationCap}>
                    <TalentsTab />
                </FormSection>
            </div>

            <!-- Equipment Section -->
            <div class="content-section equipment-section">
                <h2 class="section-title">Utrustning</h2>
                <EquipmentTab />
            </div>

            <!-- Relations Section -->
            <div class="content-section relations-section">
                <h2 class="section-title">Relationer & Anteckningar</h2>
                <RelationsNotesTab />
            </div>
        </div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
        <p>🖱️ Dra för att panorera • 🔍 Ctrl + Scroll för att zooma • ⌨️ Använd knapparna för snabba kommandon</p>
    </div>
</div>

<style>
    .panzoom-wrapper {
        position: relative;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background: var(--color-surface-50);
        border-radius: 8px;
    }

    :global(.dark) .panzoom-wrapper {
        background: var(--color-surface-900);
    }

    .panzoom-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        cursor: grab;
        position: relative;
    }

    .panzoom-container:active {
        cursor: grabbing;
    }

    .panzoom-content {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, auto);
        gap: 2rem;
        padding: 2rem;
        min-width: 200vw; /* Make content wider than viewport to enable panning */
        min-height: 150vh; /* Make content taller than viewport */
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

    .content-section {
        background: var(--color-surface-100);
        border: 2px solid var(--color-surface-200);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        min-height: 600px;
        position: relative;
        overflow: visible;
    }

    :global(.dark) .content-section {
        background: var(--color-surface-800);
        border-color: var(--color-surface-700);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .content-section:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    :global(.dark) .content-section:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-surface-900);
        margin-bottom: 1rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-bottom: 2px solid var(--color-primary-500);
        padding-bottom: 0.5rem;
        font-family: var(--font-user), serif;
    }

    :global(.dark) .section-title {
        color: var(--color-surface-100);
    }

    /* Grid layout for sections */
    .character-section {
        grid-column: 1;
        grid-row: 1;
    }

    .abilities-section {
        grid-column: 2;
        grid-row: 1;
    }

    .mutations-section {
        grid-column: 3;
        grid-row: 1;
    }

    .talents-section {
        grid-column: 1;
        grid-row: 2;
    }

    .equipment-section {
        grid-column: 2;
        grid-row: 2;
    }

    .relations-section {
        grid-column: 3;
        grid-row: 2;
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
    @media (max-width: 1200px) {
        .panzoom-content {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, auto);
        }

        .mutations-section {
            grid-column: 1;
            grid-row: 2;
        }

        .talents-section {
            grid-column: 2;
            grid-row: 2;
        }

        .equipment-section {
            grid-column: 1;
            grid-row: 3;
        }

        .relations-section {
            grid-column: 2;
            grid-row: 3;
        }
    }

    @media (max-width: 768px) {
        .panzoom-content {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, auto);
            min-width: 100vw;
        }

        .character-section,
        .abilities-section,
        .mutations-section,
        .talents-section,
        .equipment-section,
        .relations-section {
            grid-column: 1;
        }

        .abilities-section {
            grid-row: 2;
        }

        .mutations-section {
            grid-row: 3;
        }

        .talents-section {
            grid-row: 4;
        }

        .equipment-section {
            grid-row: 5;
        }

        .relations-section {
            grid-row: 6;
        }

        .instructions {
            font-size: 0.75rem;
            padding: 0.5rem 1rem;
        }
    }

    /* Override tab-specific styles */
    :global(.character-tab) {
        padding: 0 !important;
        min-height: auto !important;
    }

    :global(.reset-layout-container) {
        position: relative !important;
        top: auto !important;
        right: auto !important;
        margin-bottom: 1rem;
    }
</style>
