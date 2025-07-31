<script lang="ts">
    import { onMount } from "svelte";
    import { AppBar } from '@skeletonlabs/skeleton-svelte';
    import { openDialogueOption } from "../states/modals.svelte";
    import { Lock, LockOpen, Moon, RotateCcw, Ruler, Save, SaveAll, Sun, ZoomIn, ZoomOut } from "@lucide/svelte";
    import OBR from "@owlbear-rodeo/sdk";
    import { sheetState } from "../states/character_sheet.svelte";

    // Theme functionality
    let isDarkMode = $state(true);

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        updateTheme();
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    function updateTheme() {
        const html = document.documentElement;
        html.classList.remove('dark', 'light');
        
        if (isDarkMode) {
            html.classList.add('dark');
        } else {
            html.classList.add('light');
        }

        document.body.setAttribute('data-theme', 'vintage');
    }

    // Pan/Zoom controls - these will be passed in as props
    interface PanZoomControls {
        zoomIn: () => void;
        zoomOut: () => void;
        resetView: () => void;
    }

    interface Props {
        panZoomControls?: PanZoomControls;
    }

    let { panZoomControls }: Props = $props();

    function openSizeControls() {
        openDialogueOption('sizeControls');
    }

    function openStorageControls() {
        openDialogueOption('storageControls');
    }

    function toggleLayoutLock() {
        sheetState.isLocked = !sheetState.isLocked;
    }

    onMount(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDarkMode = savedTheme === 'dark';
        } else {
            isDarkMode = true;
        }
        updateTheme();
    });
</script>

<AppBar classes="app-controls-bar">
    {#snippet lead()}
        {#if panZoomControls}
            <div class="control-group">
                <button 
                    class="btn btn-sm variant-filled-primary" 
                    onclick={panZoomControls.zoomIn} 
                    title="Zooma in (Ctrl + Scroll)" 
                    aria-label="Zooma in"
                >
                    <ZoomIn size={16} />
                </button>
                
                <button 
                    class="btn btn-sm variant-filled-primary" 
                    onclick={panZoomControls.zoomOut} 
                    title="Zooma ut (Ctrl + Scroll)" 
                    aria-label="Zooma ut"
                >
                    <ZoomOut size={16}  />
                </button>

                <button 
                    class="btn btn-sm variant-filled-primary" 
                    onclick={panZoomControls.resetView} 
                    title="Återställ vy (R)" 
                    aria-label="Återställ vy"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
        {/if}
    {/snippet}

    {#snippet trail()}
        
        {#if OBR.isAvailable}
        <button 
            class="btn btn-sm variant-filled-primary"
            onclick={openSizeControls}
            aria-label="Öppna storlekskontroller"
            title="Storlekskontroller"
        >
            <Ruler size={16} />
        </button>
        {/if}

        <!-- Storage Controls -->
        <button 
            class="btn btn-sm variant-filled-primary"
            onclick={openStorageControls}
            aria-label="Öppna lagringskontroller"
            title="Spara & Ladda Data"
        >
            <Save size={16} />
        </button>

        <!-- Layout Lock Toggle -->
        <button 
            class="btn btn-sm variant-filled-primary"
            onclick={toggleLayoutLock}
            aria-label={sheetState.isLocked ? "Lås upp layout" : "Lås layout"}
            title={sheetState.isLocked ? "Lås upp layout - Tillåt flyttning och storleksändring" : "Lås layout - Förhindra flyttning och storleksändring"}
        >
            {#if sheetState.isLocked}
                <Lock size={16} />
            {:else}
                <LockOpen size={16} />
            {/if}
        </button>

        <!-- Theme Toggle -->
        <button 
            class="btn btn-sm variant-filled-primary"
            onclick={toggleTheme}
            aria-label="Toggle dark/light mode"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {#if isDarkMode}
                <!-- Sun icon for switching to light mode -->
                <Sun size={16} fill="currentColor" />
            {:else}
                <!-- Moon icon for switching to dark mode -->
                <Moon size={16} fill="currentColor" />
            {/if}
        </button>
    {/snippet}
</AppBar>

<style>
    :global(.app-controls-bar) {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1000 !important;
    }

    .control-group {
        display: flex;
        gap: 0.25rem;
        align-items: center;
    }

    .control-group .btn {
        padding: 0.5rem;
        min-width: 2rem;
        min-height: 2rem;
    }
</style>
