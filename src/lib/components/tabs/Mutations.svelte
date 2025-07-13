<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import FormSection from '../FormSection.svelte';
    import DraggableAddItem from '../DraggableAddItem.svelte';
    import { openInfoModal } from '../../states/modals.svelte';
    import MutationsModal from '../Modals/MutationsModal.svelte';
    import { Microscope } from '@lucide/svelte';

    // Generate unique variants for mutation items to make them look different
    const mutationVariants = generateUniqueVariants(20); // Generate enough variants

    function showMutationInfo(mutation: any) {
        const content = `
            <div class="mutation-section">
                <h4 class="section-title">ID:</h4>
                <div class="section-content">
                    <span class="mutation-id-tooltip">🧬 ${mutation.id}</span>
                </div>
            </div>
            <div class="mutation-section">
                <h4 class="section-title">Beskrivning:</h4>
                <div class="section-content">${mutation.description}</div>
            </div>
            <div class="mutation-section">
                <h4 class="section-title">Utlöses när:</h4>
                <div class="section-content">${mutation.trigger_when}</div>
            </div>
        `;
        openInfoModal(mutation.name, content, 'mutation');
    }
    
    function removeMutation(mutationId: string) {
        characterActions.removeMutation(mutationId);
    }

</script>

<MutationsModal />

<div class="mutations-tab">
    <!-- Draggable Add Item -->
    <DraggableAddItem 
        text="Dra för mutation"
        ariaLabel="Dra för att lägga till mutation"
        variant="variant-3"
    />

    <!-- Mutations Section -->
    <div data-drop-zone="mutations">
        <!-- Selected Mutations -->
        <div class="mutations-list">
            {#each sheetState.mutations as mutation, index}
                <div class="mutation-item-wrapper">
                    <div class="torn-input-wrapper {mutationVariants[index % mutationVariants.length]}">
                        <div class="mutation-item-content">
                            <div class="mutation-header">
                                <span class="mutation-name">{mutation.name}</span>
                                <div class="mutation-controls-right">
                                    <button 
                                        class="info-icon-button"
                                        onclick={() => showMutationInfo(mutation)}
                                        aria-label="Information om {mutation.name}"
                                        title="Visa information om {mutation.name}"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M9,9h6v6H9z"></path>
                                            <path d="M9,9h6"></path>
                                        </svg>
                                    </button>
                                    <button
                                        class="remove-mutation-button"
                                        onclick={() => removeMutation(mutation.id)}
                                        aria-label="Ta bort {mutation.name}"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mutation-meta">
                                <span class="mutation-id-display">🧬 {mutation.id}</span>
                                <span class="mutation-trigger">Utlöses: {mutation.trigger_when}</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
            
            {#if sheetState.mutations.length === 0}
                <div class="no-mutations-message">
                    <p>Inga mutationer valda. Dra papperet hit för att lägga till mutationer.</p>
                </div>
            {/if}
        </div>
    </div>
</div>

            <!-- Mutation Points Section -->
    <div class="mutation-points-floating-container">
        <div class="torn-input-wrapper variant-2 mutation-points-wrapper">
            <div class="mutation-points-content">
                <div class="mutation-points-header">
                    <Microscope size={20} class="mutation-points-icon" />
                    <h3 class="mutation-points-title">MUTATIONSPOÄNG</h3>
                </div>
                
                <div class="mutation-points-display">
                    <div class="mutation-points-controls">
                        <div class="mutation-points-indicators">
                            {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as idx}
                                <button 
                                    class="mutation-point-indicator"
                                    onclick={() => {
                                        if (sheetState.mutationPoints > idx) {
                                            // If this indicator is filled, reduce points to this level
                                            characterActions.setTotalMutationPoints(idx);
                                        } else {
                                            // If this indicator is not filled, increase points to include this level
                                            characterActions.setTotalMutationPoints(idx + 1);
                                        }
                                    }}
                                    aria-label="Toggle mutation point {idx + 1}"
                                >
                                    <!-- Always show the circle as base layer -->
                                    <img src='/img/strokes/o.svg' alt="No points" class="stroke-image circle-layer" />
                                    <!-- Show X on top if point is spent -->
                                    {#if sheetState.mutationPoints > idx}
                                        <img 
                                            src='/img/strokes/x.svg' 
                                            alt="Point available" 
                                            class="stroke-image x-layer" 
                                        />
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
                
                <div class="mutation-points-info">
                    <p class="mutation-points-explanation">
                        Mutationspoäng representerar din potentiella kraft från Zonen. 
                        Klicka på cirklarna för att ställa in dina tillgängliga poäng.
                    </p>
                </div>
            </div>
        </div>
    </div>

<style>
    .mutations-tab {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .add-mutations-section {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .add-mutation-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }

    .add-mutation-btn:hover {
        background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
    }

    .add-mutation-btn:active {
        transform: translateY(0);
    }

    .mutation-item-wrapper {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .mutation-item-content {
        position: relative;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        z-index: 1;
    }

    .mutation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .mutation-name {
        font-weight: bold;
        font-size: 1rem;
        color: var(--color-surface-900);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        flex: 1;
    }

    :global(.dark) .mutation-name {
        color: var(--color-surface-100);
    }

    .mutation-controls-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
    }

    .info-icon-button {
        background: none;
        border: none;
        color: var(--color-surface-600);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        flex-shrink: 0;
    }

    .info-icon-button:hover {
        background: rgba(217, 119, 6, 0.1);
        color: var(--color-primary-600);
        opacity: 1;
        transform: scale(1.1);
    }

    :global(.dark) .info-icon-button {
        color: var(--color-surface-400);
    }

    :global(.dark) .info-icon-button:hover {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }

    .remove-mutation-button {
        padding: 0.2rem;
        border-radius: 50%;
        border: 1px solid var(--color-error-500);
        background: transparent;
        color: var(--color-error-600);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .remove-mutation-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }

    .mutation-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;
        color: var(--color-surface-600);
    }

    :global(.dark) .mutation-meta {
        color: var(--color-surface-400);
    }

    .mutation-id-display {
        font-weight: bold;
        color: var(--color-primary-600);
    }

    :global(.dark) .mutation-id-display {
        color: var(--color-primary-400);
    }

    .mutation-trigger {
        font-style: italic;
    }

    .no-mutations-message {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--color-surface-500);
    }

    .no-mutations-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }

    .no-mutations-text {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
        color: var(--color-surface-700);
    }

    :global(.dark) .no-mutations-text {
        color: var(--color-surface-300);
    }

    .no-mutations-subtext {
        font-size: 0.9rem;
        font-style: italic;
        margin: 0;
        color: var(--color-surface-500);
    }

    :global(.dark) .no-mutations-subtext {
        color: var(--color-surface-400);
    }

    /* Mutation tooltip styling */
    .mutation-id-tooltip {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.9rem;
        display: inline-block;
    }

    :global(.dark) .mutation-id-tooltip {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .mutation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .mutation-controls-right {
            align-self: flex-end;
        }
    }

    /* Free-floating Mutation Points styling */
    .mutation-points-floating-container {
        position: relative;
        width: fit-content;
        max-width: 100%;
        margin: 2rem auto;
        transform: rotate(-1deg);
        transform-origin: center;
        transition: all 0.2s ease;
    }

    .mutation-points-floating-container:hover {
        transform: rotate(-1deg) translateY(-2px);
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
    }

    .mutation-points-wrapper {
        padding: 1.5rem;
        min-width: 350px;
        position: relative;
        z-index: 1;
    }

    .mutation-points-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: relative;
        z-index: 2;
    }

    .mutation-points-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .mutation-points-title {
        font-family: var(--form-labels), serif;
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    :global(.dark) .mutation-points-title {
        color: var(--color-surface-100);
    }

    .mutation-points-icon {
        color: var(--color-primary-600);
        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2));
    }

    :global(.dark) .mutation-points-icon {
        color: var(--color-primary-400);
    }

    .mutation-points-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .mutation-points-controls {
        display: flex;
        justify-content: center;
    }

    .mutation-points-indicators {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 100%;
    }

    .mutation-point-indicator {
        position: relative;
        width: 2rem;
        height: 2rem;
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .mutation-point-indicator:hover {
        transform: scale(1.1);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .mutation-point-indicator:focus {
        outline: 2px solid var(--color-primary-500);
        outline-offset: 2px;
    }

    .stroke-image {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: all 0.2s ease;
    }

    .circle-layer {
        z-index: 1;
        opacity: 0.8;
    }

    .x-layer {
        z-index: 2;
        opacity: 0.9;
        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
    }

    .mutation-points-info {
        text-align: center;
        max-width: 300px;
    }

    .mutation-points-explanation {
        font-size: 0.9rem;
        line-height: 1.4;
        color: var(--color-surface-700);
        margin: 0;
        font-style: italic;
    }

    :global(.dark) .mutation-points-explanation {
        color: var(--color-surface-300);
    }

    /* Responsive adjustments for mutation points */
    @media (max-width: 768px) {
        .mutation-points-wrapper {
            min-width: auto;
            width: 100%;
            max-width: 350px;
            padding: 1.25rem;
        }

        .mutation-points-indicators {
            gap: 0.4rem;
        }

        .mutation-point-indicator {
            width: 1.75rem;
            height: 1.75rem;
        }

        .mutation-points-title {
            font-size: 1.1rem;
        }

        .mutation-points-explanation {
            font-size: 0.85rem;
        }
    }

    @media (max-width: 480px) {
        .mutation-points-floating-container {
            margin: 1.5rem auto;
        }

        .mutation-points-wrapper {
            padding: 1rem;
        }

        .mutation-points-indicators {
            gap: 0.3rem;
        }

        .mutation-point-indicator {
            width: 1.5rem;
            height: 1.5rem;
        }
    }
</style>
