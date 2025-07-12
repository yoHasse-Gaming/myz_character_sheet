<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, openDialogueOption, openInfoModal } from '../../states/character_sheet.svelte';
    import FormSection from '../FormSection.svelte';
    import DraggableAddItem from '../DraggableAddItem.svelte';
    import DropZone from '../DropZone.svelte';

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

<div class="mutations-tab">
    <!-- Draggable Add Item -->
    <DraggableAddItem 
        text="Dra för mutation"
        ariaLabel="Dra för att lägga till mutation"
        variant="variant-3"
    />

    <!-- Mutations Drop Zone -->
    <DropZone 
        dragOverText="Släpp för att lägga till mutation"
        onDrop={() => openDialogueOption('mutations')}
    >
        {#snippet children()}
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
        {/snippet}
    </DropZone>
</div>

            <!-- Mutation Points Section -->
<div class="mt-6">
    <FormSection header="🔬 MUTATIONSPOÄNG">
        <div class="mutation-points-container">
            <div class="mutation-points-display">
                <span class="mutation-points-label">
                    Mutationspoäng:
                </span>
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
    </FormSection>
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
</style>
