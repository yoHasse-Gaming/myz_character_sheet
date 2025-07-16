<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { characterActions } from '../../states/character_sheet.svelte';
    import PaperCard from '../PaperCard.svelte';

    let formData = {
        name: '',
        job: '',
        appearance: {
            face: '',
            body: '',
            clothes: ''
        }
    };

    // Generate random variants for each input to make them unique
    const [nameVariant, jobVariant, faceVariant, bodyVariant, clothesVariant] = generateUniqueVariants(5);

    onMount(() => {
        // Initialize InteractJS for draggable and resizable character papers
        console.log('Initializing InteractJS for character tab...');
        const characterElements = document.querySelectorAll('.character-paper');
        console.log('Found character papers:', characterElements.length);
        
        // Restore saved positions and sizes
        characterElements.forEach((element, index) => {
            const paperId = element.getAttribute('data-paper-id');
            if (paperId) {
                const savedLayout = characterActions.getPaperLayout('characterTab', paperId);
                if (savedLayout) {
                    console.log('Restoring layout for', paperId, savedLayout);
                    const htmlElement = element as HTMLElement;
                    // Apply saved position
                    htmlElement.style.transform = `translate(${savedLayout.x}px, ${savedLayout.y}px)`;
                    htmlElement.setAttribute('data-x', savedLayout.x.toString());
                    htmlElement.setAttribute('data-y', savedLayout.y.toString());
                    
                    // Apply saved size if available
                    if (savedLayout.width) htmlElement.style.width = savedLayout.width + 'px';
                    if (savedLayout.height) htmlElement.style.height = savedLayout.height + 'px';
                }
            }
        });
    });

    function resetCharacterLayout() {
        // Clear saved layouts
        characterActions.clearPaperLayouts('characterTab');
        
        // Reset all character papers to default positions and sizes
        const characterElements = document.querySelectorAll('.character-paper');
        characterElements.forEach((element) => {
            const htmlElement = element as HTMLElement;
            // Reset transform
            htmlElement.style.transform = '';
            htmlElement.setAttribute('data-x', '0');
            htmlElement.setAttribute('data-y', '0');
            // Reset size
            htmlElement.style.width = '';
            htmlElement.style.height = '';
        });
        
        console.log('Character layout reset to defaults');
    }




</script>




<div class="character-tab">
    <!-- Reset Layout Button -->
    <div class="reset-layout-container">
        <button 
            class="reset-layout-button"
            onclick={resetCharacterLayout}
            title="Återställ alla pappersposter till standardpositioner"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
            </svg>
            Återställ layout
        </button>
    </div>
    
    <div class="character-papers-container">

        <PaperCard 
                paperId="character-name"
                tabName="characterTab"
            >
            {#snippet header()}
            Namn
            {/snippet}
            {#snippet content()}
            <div class="torn-paper-wrapper">
            <textarea
                data-tooltip="Vad kallar dig de andra överlevarna?" 
                id="name" 
                data-placement="bottom" 
                placeholder="t.ex. Rust, Echo, Zero..." 
                bind:value={formData.name} > </textarea>

            </div>
            {/snippet}


        </PaperCard>

        <PaperCard 
            paperId="character-job"
            tabName="characterTab"
            >
            {#snippet header()}
            Syssla
            {/snippet}
            {#snippet content()}

            <div class="torn-paper-wrapper">
            <textarea
                data-tooltip="Vad gör du för att överleva?" 
                id="job" 
                data-placement="bottom" 
                placeholder="t.ex. Skräpsamlare, Vakt, Mekaniker..." 
                bind:value={formData.job} > </textarea>
            </div>
            {/snippet}
        </PaperCard>

        <PaperCard 
            paperId="character-face"
            tabName="characterTab"
            >
            {#snippet header()}
            Ansikte
            {/snippet}
            {#snippet content()}

            <div class="torn-paper-wrapper {faceVariant}">
                <textarea 
                    placeholder="Ärrat, väderbitit, maskerat..." 
                    bind:value={formData.appearance.face}></textarea>
            </div>
            {/snippet}


        </PaperCard>

        <PaperCard 
            paperId="character-body"
            
            tabName="characterTab"
            >
            {#snippet header()}
            Kropp
            {/snippet}

            {#snippet content()}

            <div class="torn-paper-wrapper {bodyVariant}">
                <textarea 
                    placeholder="Mager, muskulös, deformerad..." 
                    bind:value={formData.appearance.body}></textarea>
            </div>
            {/snippet}
        </PaperCard>

        <PaperCard 
            paperId="character-clothes"
            autoResize={true}
            tabName="characterTab"
            >
            {#snippet header()}
            Kläder
            {/snippet}
            {#snippet content()}

            <div class="torn-paper-wrapper {clothesVariant}">
                <textarea 
                    placeholder="Lappade trasor, läder, folie..." 
                    bind:value={formData.appearance.clothes}
                    ></textarea>
            </div>
            {/snippet}
        </PaperCard>

    </div>
</div>


<style>
    /* Character tab container */
    .character-tab {
        display: block;
        width: 100%;
        min-height: 100vh;
        position: relative;
        padding: 1rem;
        overflow: visible; /* Allow papers to move freely */
    }

    /* Reset layout button */
    .reset-layout-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1001;
    }

    .reset-layout-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, #dc2626, #991b1b);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-family: var(--font-user), sans-serif;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .reset-layout-button:hover {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        transform: translateY(-1px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    }

    .reset-layout-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .reset-layout-button svg {
        flex-shrink: 0;
    }

    .character-papers-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        width: 100%;
        position: relative;
        min-height: 80vh; /* Give plenty of space for dragging */
    }

    /* Character item wrapper */
    .character-item-wrapper {
        width: fit-content;
        min-width: 300px;
        max-width: 450px;
        position: absolute; /* Changed to absolute for free positioning */
    }

    /* Character-specific paper styling */
    .character-paper {
        cursor: default; /* Default cursor since only header is draggable */
        user-select: none;
        position: relative;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        will-change: transform;
        /* Add hardware acceleration for better performance */
        transform: translateZ(0);
        backface-visibility: hidden;
        min-width: 250px;
        min-height: 120px;
        /* Add a subtle border that becomes visible on hover to indicate resize areas */
        border: 3px solid transparent;
        border-radius: 4px;
    }

    .character-paper:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        z-index: 10;
    }

    .character-paper:active,
    .character-paper.dragging,
    .character-paper.resizing {
        z-index: 20;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
    }

    /* Ensure content doesn't interfere with resizing */
    .character-item-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
        pointer-events: auto;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    /* Make textareas and inputs resize with the container */
    .character-textarea {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.5rem 0;
        resize: none; /* Disable default resize since we're using InteractJS */
        box-sizing: border-box;
        flex: 1; /* Take up remaining space after header */
        min-height: 3rem;
    }

    .character-input {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.5rem 0;
        box-sizing: border-box;
    }

    /* Character header with label and drag handle */
    .character-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding: 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        cursor: move; /* Make it clear this is the draggable area */
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px 4px 0 0;
        transition: background-color 0.2s ease;
        flex-shrink: 0; /* Don't shrink the header */
        /* Improve drag performance */
        transform: translateZ(0);
        backface-visibility: hidden;
    }

    :global(.dark) .character-header {
        border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .character-label {
        pointer-events: none;
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 1.1rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
    }

    :global(.dark) .character-label {
        color: var(--color-surface-100);
    }

    .drag-handle {
        color: var(--color-surface-200);
        opacity: 0.7;
        transition: all 0.2s ease;
    }

    .drag-handle:hover {
        opacity: 1;
        color: var(--color-primary-600);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .character-item-wrapper {
            min-width: 250px;
        }

        .character-papers-container {
            flex-direction: column;
        }
    }
</style>