<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { characterActions, sheetState, initialCardPositions } from '../../states/character_sheet.svelte';
    import PaperCard from '../PaperCard.svelte';
    import { Aperture, Award, Circle } from '@lucide/svelte';

    onMount(() => {
        // Initialize InteractJS for draggable and resizable character papers
        const characterElements = document.querySelectorAll('.character-paper');
        // Restore saved positions and sizes
        characterElements.forEach((element, index) => {
            const paperId = element.getAttribute('data-paper-id');
            if (paperId) {
                const savedLayout = characterActions.getPaperLayout(paperId);
                if (savedLayout) {
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

</script>




<PaperCard 
        paperId="character-basic-info"
        initialPosition={initialCardPositions["character-basic-info"]}
        resizable={false}
        minSize={{ width: 300, height: 50 }}
        class="p-2"
    >
    {#snippet content()}
    <div class="compact-field">
        <span class="field-label">NAMN</span>
        <input
            type="text"
            class="compact-input font-user"
            placeholder="t.ex. Rust, Echo, Zero..."
            bind:value={sheetState.name}
        />
    </div>
        <div class="compact-field">
        <span class="field-label">SYSSLA</span>
        <input
            type="text"
            class="compact-input font-user"
            placeholder="t.ex. Skräpsamlare, Vakt, Mekaniker..."
            bind:value={sheetState.occupation}
        />
    </div>
    {/snippet}
</PaperCard>

<PaperCard 
    paperId="character-looks"
    initialPosition={initialCardPositions["character-looks"]}
    minSize={{ width: 260, height: 300 }}
    resizable={true}
    autoResize={true}
    class="p-2"
    >
    {#snippet content()}
    <div class="compact-textarea-field">
        <span class="field-label">ANSIKTE</span>
        <textarea
            class="compact-textarea font-user"
            placeholder="Ärrat, väderbitit, maskerat..."
            bind:value={sheetState.appearance.face}
            rows="2"
        ></textarea>
    </div>
    <div class="compact-textarea-field">
        <span class="field-label">KROPP</span>
        <textarea
            class="compact-textarea font-user"
            placeholder="Mager, muskulös, deformerad..."
            bind:value={sheetState.appearance.body}
            rows="2"
        ></textarea>
    </div>
    <div class="compact-textarea-field">
            <span class="field-label">KLÄDER</span>
            <textarea
                class="compact-textarea font-user"
                placeholder="Lappade trasor, läder, folie..."
                bind:value={sheetState.appearance.clothes}
                rows="2"
            ></textarea>
        </div>
    {/snippet}
</PaperCard>


    <PaperCard
        paperId="character-dream"
        initialPosition={initialCardPositions["character-dream"]}
        minSize={{ width: 300, height: 100 }}
        resizable={true}
        autoResize={true}
    >
        {#snippet content()}
        <div class="compact-textarea-field">
            <span class="field-label">DRÖM</span>
            <textarea
                class="compact-textarea font-user"
                placeholder="Vad drömmer din karaktär om?"
                bind:value={sheetState.dream}
                rows="4"
            ></textarea>
        </div>
        {/snippet}
    </PaperCard>

    <PaperCard 
        paperId="experience-points"
        variant="variant-1"
        class="experience-points-floating-container"
        draggable={true}
        resizable={false}
        minSize={{ width: 300, height: 100 }}
        initialPosition={initialCardPositions["experience-points"]}
    > 
    {#snippet content()}
            <span class="points-label"><Aperture size={20} class="points-icon" /> ERFARENHETSPOÄNG</span>
            <div class="points-indicators">
                {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as idx}
                    <button 
                        class="point-indicator"
                        onclick={() => {
                            if (sheetState.experiencePoints > idx) {
                                characterActions.setTotalExperiencePoints(idx);
                            } else {
                                characterActions.setTotalExperiencePoints(idx + 1);
                            }
                        }}
                        aria-label="Toggle experience point {idx + 1}"
                    >
                        <Circle size={30} 
                            color={sheetState.experiencePoints > idx ? 'var(--color-primary-800)' : 'var(--color-surface-200)'}
                        />
                        {#if sheetState.experiencePoints > idx}
                            <Award size={18}

                                color='var(--color-primary-800)'
                            />
                        {/if}
                    </button>
                {/each}
                
                
            
            </div>
    {/snippet}

</PaperCard>

<style>

    /* Compact field styling for name and job */
    .compact-field {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.25rem;
        min-height: 2rem;
    }

    .field-label {
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-shrink: 0;
        min-width: 60px;
    }

    :global(.dark) .field-label {
        color: var(--color-surface-100);
    }

    .compact-input {
        width: 100%;
        height: 1.5rem;
        font-size: 0.9rem;
        flex-grow: 1;
        background: transparent;
        color: var(--color-surface-900);
        padding: 0.25rem 0.5rem;
    }

    :global(.dark) .compact-input {
        color: var(--color-surface-100);
    }

    .compact-input:focus {
        outline: none;
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
