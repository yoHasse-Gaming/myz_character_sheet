<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { closeDialogueOption, isDialogueOpen } from "../../states/modals.svelte";
    import { onMount } from 'svelte';
    import { useOwlbearResize } from '../../utils/owlbearIntegration';
    import OBR from '@owlbear-rodeo/sdk';
    import { Laptop, Monitor, Smartphone } from '@lucide/svelte';
    
    let { 
        currentWidth = 800, 
        currentHeight = 600, 
        minWidth = 320, 
        maxWidth = 1200, 
        minHeight = 400, 
        maxHeight = 1000, 
        onresize 
    }: {
        currentWidth?: number;
        currentHeight?: number;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        onresize?: ((event: CustomEvent<{ width: number; height: number }>) => void) | undefined;
    } = $props();

    let owlbearResize: ReturnType<typeof useOwlbearResize>;
    
    onMount(() => {
        owlbearResize = useOwlbearResize();
    });
    
    function closeModal() {
        closeDialogueOption('sizeControls');
    }
    
    function handleResize(width: number, height: number) {
        const resizeEvent = new CustomEvent('resize', { detail: { width, height } });
        onresize?.(resizeEvent);
        
        // Also send to Owlbear Rodeo if we're running inside it
        if (OBR.isAvailable && owlbearResize) {
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
        // Close modal after selecting a preset
        closeModal();
    }
</script>

<Modal
    open={isDialogueOpen('sizeControls')}
    onOpenChange={(e) => {
        if (!e.open) {
            closeModal();
        }
    }}
    classes="panzoom-exclude"
    backdropClasses="!z-[100] backdrop-blur-sm bg-black/50 left-0 top-0 h-screen w-screen"
    contentBase="!z-[101] card p-0 shadow-xl max-w-md max-h-[90vh] overflow-hidden"
    positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
    closeOnInteractOutside={true}
    closeOnEscape={true}
>
    {#snippet trigger()}
        <!-- No trigger needed since modal is controlled externally -->
    {/snippet}
    
    {#snippet content()}
        <div class="size-controls-modal-content">
            <button 
                class="modal-close-button" 
                onclick={closeModal} 
                aria-label="Stäng storlekskontroller"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div class="torn-paper-wrapper variant-1">
                <div class="card-content">
                    <h2 class="modal-title">Storlekskontroller</h2>
                    
                    <div class="size-presets">
                        <h3>Förvalda storlekar</h3>
                        <div class="preset-buttons">
                            <button 
                                class="btn btn-sm" 
                                onclick={() => presetSize('small')}
                            >
                                <Smartphone size={16} /> Liten
                            </button>
                            <button 
                                class="btn btn-sm" 
                                onclick={() => presetSize('medium')}
                            >
                                <Laptop size={16} /> Medium
                            </button>
                            <button 
                                class="btn btn-sm" 
                                onclick={() => presetSize('large')}
                            >
                                <Monitor size={16} /> Stor
                            </button>
                        </div>
                    </div>
                    
                    <div class="size-sliders">
                        <h3>Anpassad storlek</h3>
                        
                        <div class="slider-group">
                            <label for="width-slider">Bredd: {currentWidth}px</label>
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
                            <label for="height-slider">Höjd: {currentHeight}px</label>
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

                        <div class="current-size">
                            <strong>Nuvarande storlek: {currentWidth} × {currentHeight} px</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/snippet}
</Modal>

<style>
    .size-controls-modal-content {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .modal-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        color: #8b4513;
        text-align: center;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    .owlbear-indicator {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0.75rem;
        border-radius: 0.5rem;
        text-align: center;
        font-size: 0.9rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .size-presets {
        margin-bottom: 1.5rem;
    }

    .size-presets h3 {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
        color: #8b4513;
    }

    .preset-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .preset-buttons button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }

    .preset-buttons button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .size-sliders h3 {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
        color: #8b4513;
    }

    .slider-group {
        margin-bottom: 1rem;
    }

    .slider-group label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #6b4423;
        font-weight: 500;
    }

    .slider {
        width: 100%;
        height: 6px;
        background: rgba(139, 69, 19, 0.2);
        border-radius: 3px;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        transition: all 0.2s ease;
    }

    .slider:hover {
        background: rgba(139, 69, 19, 0.3);
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #d97706, #b45309);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    .slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
    }

    .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #d97706, #b45309);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    .slider::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
    }

    .current-size {
        text-align: center;
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(139, 69, 19, 0.1);
        border-radius: 0.5rem;
        color: #6b4423;
    }

    /* Dark mode adjustments */
    :global(.dark) .modal-title,
    :global(.dark) .size-presets h3,
    :global(.dark) .size-sliders h3 {
        color: #d4a574;
    }

    :global(.dark) .slider-group label {
        color: #b8956b;
    }

    :global(.dark) .current-size {
        background: rgba(212, 165, 116, 0.1);
        color: #b8956b;
    }

    :global(.dark) .slider {
        background: rgba(212, 165, 116, 0.2);
    }

    :global(.dark) .slider:hover {
        background: rgba(212, 165, 116, 0.3);
    }
</style>
