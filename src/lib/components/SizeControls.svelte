<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { useOwlbearResize } from '$lib/owlbear-integration';
    
    export let currentWidth: number = 800;
    export let currentHeight: number = 600;
    export let minWidth: number = 320;
    export let maxWidth: number = 1200;
    export let minHeight: number = 400;
    export let maxHeight: number = 1000;
    
    const dispatch = createEventDispatcher<{
        resize: { width: number; height: number };
    }>();
    
    let owlbearResize: ReturnType<typeof useOwlbearResize>;
    let isInOwlbear = false;
    
    onMount(() => {
        owlbearResize = useOwlbearResize();
        isInOwlbear = owlbearResize.isInOwlbear;
    });
    
    function handleResize(width: number, height: number) {
        dispatch('resize', { width, height });
        
        // Also send to Owlbear Rodeo if we're running inside it
        if (isInOwlbear && owlbearResize) {
            owlbearResize.setSize(width, height);
        }
    }
    
    function presetSize(preset: 'small' | 'medium' | 'large') {
        switch (preset) {
            case 'small':
                handleResize(400, 500);
                break;
            case 'medium':
                handleResize(800, 600);
                break;
            case 'large':
                handleResize(1200, 800);
                break;
        }
    }
</script>

<div class="size-controls">
    {#if isInOwlbear}
        <div class="owlbear-indicator">
            🦉 Connected to Owlbear Rodeo
        </div>
    {/if}
    
    <div class="size-presets">
        <button 
            class="btn btn-sm variant-ghost-surface" 
            onclick={() => presetSize('small')}
        >
            📱 Small
        </button>
        <button 
            class="btn btn-sm variant-ghost-surface" 
            onclick={() => presetSize('medium')}
        >
            💻 Medium
        </button>
        <button 
            class="btn btn-sm variant-ghost-surface" 
            onclick={() => presetSize('large')}
        >
            🖥️ Large
        </button>
    </div>
    
    <div class="size-sliders">
        <div class="slider-group">
            <label for="width-slider">Width: {currentWidth}px</label>
            <input 
                id="width-slider"
                type="range" 
                min={minWidth} 
                max={maxWidth} 
                step="50"
                bind:value={currentWidth}
                onchange={() => handleResize(currentWidth, currentHeight)}
                class="slider"
            />
        </div>
        
        <div class="slider-group">
            <label for="height-slider">Height: {currentHeight}px</label>
            <input 
                id="height-slider"
                type="range" 
                min={minHeight} 
                max={maxHeight} 
                step="50"
                bind:value={currentHeight}
                onchange={() => handleResize(currentWidth, currentHeight)}
                class="slider"
            />
        </div>
    </div>
</div>

<style>
    .size-controls {
        position: fixed;
        top: 4rem;
        right: 1rem;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        color: white;
        min-width: 200px;
    }

    .size-presets {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .size-presets button {
        font-size: 0.8rem;
        padding: 0.3rem 0.6rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .size-presets button:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
    }

    .slider-group {
        margin-bottom: 0.75rem;
    }

    .slider-group label {
        display: block;
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        color: rgba(255, 255, 255, 0.9);
    }

    .slider {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: #d97706;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #d97706;
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .owlbear-indicator {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0.5rem;
        border-radius: 0.375rem;
        text-align: center;
        font-size: 0.8rem;
        font-weight: bold;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
    }
</style>
