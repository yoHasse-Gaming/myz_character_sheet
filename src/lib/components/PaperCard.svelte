<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import { autoResizePaper, initInteractForElement } from '../utils/interactjsUtils';
    import { characterActions, sheetState } from '../states/character_sheet.svelte';

    // Props
    let {
        paperId,
        variant = '',
        draggable = true,
        resizable = true,
        initialPosition = { x: 0, y: 0 },
        initialSize = { width: 'auto', height: 'auto' },
        minSize = { width: 250, height: 80 },
        maxSize = undefined,
        header = undefined,
        content,
        autoResize = false,
        class: additionalClasses = ''
    }: {
        paperId: string;
        variant?: string;
        draggable?: boolean;
        resizable?: boolean;
        initialPosition?: { x: number; y: number };
        initialSize?: { width: string | number; height: string | number };
        minSize?: { width: number; height: number };
        maxSize?: { width: number; height: number };
        header?: Snippet;
        content?: Snippet;
        autoResize?: boolean;
        class?: string;
    } = $props();

    let paperElement: HTMLElement;
    let contentElement: HTMLElement;

    // Generate a variant if none provided
    const cardVariant = variant || 'variant-1';

    // TODO: maybe add $effect and look for ANY change to character sheet state.

    $effect(() => {
        // Ensure the paperId is unique and valid
        minSize.width;
        minSize.height;

        setTimeout(() => {
            paperElement.style.setProperty('--min-width', `${minSize.width}px`);
            paperElement.style.setProperty('--min-height', `${minSize.height}px`);
        }, 0);


    });

    $effect(() => {
        // Update the paper layout when the component is mounted or updated
        sheetState.id; // Trigger on sheet ID change

        setTimeout(() => {
            setPaperLayouts();
        }, 0);
    });

    function setPaperLayouts() {
        const paperLayout = characterActions.getPaperLayout(paperId);

        if (paperElement && paperLayout) {
            paperElement.style.transform = `translate(${paperLayout.x}px, ${paperLayout.y}px)`;
            paperElement.setAttribute('data-x', paperLayout.x.toString());
            paperElement.setAttribute('data-y', paperLayout.y.toString());
            
            // Apply saved size if available
            if (paperLayout.width) paperElement.style.width = paperLayout.width + 'px';
            if (paperLayout.height) paperElement.style.height = paperLayout.height + 'px';
        }
    }


    onMount(() => {
        if (paperElement) {
            // Initialize InteractJS for draggable and resizable functionality
            if (draggable || resizable) {
                initInteractForElement(paperElement, {
                    enableDraggable: draggable,
                    enableResizable: resizable,
                    minSize: minSize,
                    maxSize: maxSize,
                });
            }

            if(!additionalClasses.includes('p-')){
                additionalClasses += ' p-4';
            }

            // Restore saved layout
            const savedLayout = characterActions.getPaperLayout(paperId);
            if (savedLayout) {
                
                // Apply saved position
                paperElement.style.transform = `translate(${savedLayout.x}px, ${savedLayout.y}px)`;
                paperElement.setAttribute('data-x', savedLayout.x.toString());
                paperElement.setAttribute('data-y', savedLayout.y.toString());
                
                // Apply saved size if available
                if (savedLayout.width) paperElement.style.width = savedLayout.width + 'px';
                if (savedLayout.height) paperElement.style.height = savedLayout.height + 'px';
            } else {
                // Apply initial position and size
                paperElement.style.transform = `translate(${initialPosition.x}px, ${initialPosition.y}px)`;
                paperElement.setAttribute('data-x', initialPosition.x.toString());
                paperElement.setAttribute('data-y', initialPosition.y.toString());
                
                if (typeof initialSize.width === 'number') {
                    paperElement.style.width = initialSize.width + 'px';
                }
                if (typeof initialSize.height === 'number') {
                    paperElement.style.height = initialSize.height + 'px';
                }
            }

            if(autoResize) {
                // Attach auto-resize handler to textareas inside this paper card
                // const textareas = paperElement.querySelectorAll('textarea');
                // textareas.forEach(textarea => {
                //     autoResizePaper(textarea, minSize, maxSize);
                // });
            }
            paperElement.style.setProperty('--min-width', `${minSize.width}px`);
            paperElement.style.setProperty('--min-height', `${minSize.height}px`);
        }
    });

    // Handle auto-resize for textareas
    function handleTextareaInput(event: Event) {
        if (autoResize && event.target instanceof HTMLTextAreaElement) {
            autoResizePaper(event.target, minSize, maxSize);
        }
    }
</script>

<div 
    bind:this={paperElement}
    class="torn-paper-wrapper {cardVariant} paper-card {sheetState.isLocked ? '' : 'interactable'}"
    data-x="0" 
    data-y="0" 
    data-paper-id={paperId}
>
    <div class="paper-content {additionalClasses}" bind:this={contentElement}>
        {#if header}
            <div class="paper-header">
                {@render header?.()}
            </div>
        {/if}
        
        <div class="paper-body" oninput={handleTextareaInput}>
            {@render content?.()}
        </div>
    </div>
</div>

<style>
    /* Paper card container */

    .paper-card {
        cursor: default;
        user-select: none;
        position: absolute; /* Back to relative - absolute was causing stretching issues */
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
        min-width: var(--min-width, 250px);
        min-height: var(--min-height, 20px);
        max-width: 450px;
        width: fit-content;
        height: fit-content;
        border: 3px solid transparent;
        border-radius: 4px;
    } 

    .paper-card:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        z-index: 10;
    }

    .paper-card:active,
    .paper-card.dragging,
    .paper-card.resizing {
        z-index: 20;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
    }

    /* Paper content container */
    .paper-content {
        position: relative;
        z-index: 2;
        pointer-events: auto;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    /* Paper header with label and drag handle */
    .paper-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding: 0.5rem;
    }

    .paper-label {
        pointer-events: none;
        
        font-weight: bold;
        font-size: 1.1rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
    }

    :global(.dark) .paper-label {
        color: var(--color-surface-100);
    }

    /* Paper body content */
    .paper-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0; /* Allow flexible sizing */
    }

    /* Global styles for inputs and textareas inside paper cards */
    .paper-card :global(.paper-input) {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.5rem 0;
        box-sizing: border-box;
        color: var(--color-surface-900);
    }

    .paper-card :global(.paper-textarea) {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.5rem 0;
        resize: none;
        box-sizing: border-box;
        flex: 1;
        min-height: 3rem;
        color: var(--color-surface-900);
    }

    :global(.dark) .paper-card :global(.paper-input),
    :global(.dark) .paper-card :global(.paper-textarea) {
        color: var(--color-surface-100);
    }

    .paper-card :global(.paper-input:focus),
    .paper-card :global(.paper-textarea:focus) {
        outline: none;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.25rem;
    }

    .paper-card :global(.paper-input::placeholder),
    .paper-card :global(.paper-textarea::placeholder) {
        color: var(--color-surface-500);
        font-style: italic;
    }

    :global(.dark) .paper-card :global(.paper-input::placeholder),
    :global(.dark) .paper-card :global(.paper-textarea::placeholder) {
        color: var(--color-surface-400);
    }



    /* Responsive adjustments */
    @media (max-width: 768px) {
        .paper-card {
            min-width: 280px;
            max-width: 100%;
        }

        .paper-content {
            padding: 0.75rem;
        }

        .paper-label {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        .paper-card {
            min-width: 250px;
        }

        .paper-content {
            padding: 0.5rem;
        }

        .paper-header {
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.5rem;
        }
    }

    .paper-card :global(.compact-textarea) {
        padding: 0.2rem;
    }
</style>
