<script lang="ts">
    import RelationModal from '../Modals/RelationModal.svelte';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import PaperCard from '../PaperCard.svelte';
    import { HeartHandshake, Notebook, Users } from '@lucide/svelte';

    function updateNote(index: number, event: Event) {
        const target = event.target as HTMLTextAreaElement;
        characterActions.updateNote(index, target.value);
    }

    const startX = 1100;
    const startY = 175;

    const initialPositions = {
        RP1: { x: startX, y: startY },
        RP2: { x: startX, y: startY + 120 },
        RP3: { x: startX, y: startY + 240 },
        RP4: { x: startX, y: startY + 360 },
        SL1: { x: startX, y: startY + 480 },
        SL2: { x: startX, y: startY + 600 }
    };

    function getInitialPosition(relationId: string) {
        return initialPositions[relationId as keyof typeof initialPositions] || { x: startX, y: startY };
    }

</script>

<!-- Relations Section -->


        {#each sheetState.relations as relation, index}
            <PaperCard 
                paperId={`relation-${relation.id}`}
                autoResize={true}
                resizable={true}
                initialSize={{ width: 300, height: 110 }}
                initialPosition={getInitialPosition(relation.id)}
                class="p-2"
            >
            {#snippet content()}
            <div class="compact-textarea-field">
                <div class="relation-header">
                    <span class="field-label">
                        <HeartHandshake
                            fill={relation.isClose ? 'red' : 'none'}
                        /> {relation.name}

                    </span>
                    <button 
                        class="remove-button" 
                        onclick={() => characterActions.removeRelation(relation.id)}
                        aria-label="Ta bort relation {relation.name}"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <textarea
                    class="compact-textarea font-user"
                    placeholder="Skriv relation här..."
                    bind:value={relation.description}
                    rows="2"
                ></textarea>
            </div>

            {/snippet}
        </PaperCard>

        {/each}

<!-- Notes Section -->
        {#each sheetState.notes as note, index}
        <PaperCard 
            paperId={`note-${index}`}
            class="p-1"
            resizable={true}
            initialPosition={{ x: 20, y: 20 + (sheetState.relations.length * 100) + (index * 100) }}
            >
            {#snippet content()}

                <div class="note-content">
                    <div class="note-header">
                        <span class="note-number"> <Notebook /> Anteckning #{index + 1}</span>
                        <button 
                            class="remove-button" 
                            onclick={() => characterActions.removeNote(index)}
                            aria-label="Ta bort anteckning #{index + 1}"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <textarea 
                        class="note-text font-user"
                        rows="4"
                        value={note}
                        placeholder="Skriv din anteckning här..."
                        oninput={(e) => updateNote(index, e)}
                    ></textarea>
                </div>
            {/snippet}
        </PaperCard>
        {/each}


<!-- Floating Draggable Add Items -->
<!-- <DraggableAddItem 
    text="Dra för att lägga till"
    ariaLabel="Dra för att lägga till relation eller anteckning"
    variant="variant-3"
    dragType="add-item"
    position={{ top: 120, right: -60 }}
/> -->

<!-- Modals -->
<RelationModal />

<style>

    .relation-content,
    .note-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
        height: 100%;
    }


    .relation-name {
        font-family: var(--form-labels), serif;
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    :global(.dark) .relation-name {
        color: var(--color-surface-100);
    }

    .close-badge {
        font-size: 1rem;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    .relation-description {
        font-size: 0.9rem;
        color: var(--color-surface-700);
        margin: 0;
        line-height: 1.4;
    }

    :global(.dark) .relation-description {
        color: var(--color-surface-300);
    }

    /* Notes list - now part of items grid */
    .relation-header,
    .note-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
    }

    .note-number {
        font-family: var(--form-labels), serif;
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--color-info-700);
        flex: 1;
    }

    .note-text {
        width: 100%;
        background: transparent;
        border: none;
        resize: vertical;
        height: 100%;
        font-size: 0.9rem;
        color: var(--color-surface-900);
        line-height: 1.4;
        font-family: var(--font-user), sans-serif;
        resize: none;
    }

    :global(.dark) .note-text {
        color: var(--color-surface-100);
    }

    .note-text:focus {
        outline: none;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.25rem;
    }

    .remove-button {
        padding: 0.25rem;
        border-radius: 50%;
        border: 1px solid var(--color-error-500);
        background: transparent;
        color: var(--color-error-600);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .remove-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }

    /* Drag states */
    .items-grid.drag-over {
        background: rgba(217, 119, 6, 0.1);
        border: 2px dashed rgba(217, 119, 6, 0.5);
        border-radius: 0.5rem;
        padding: 1rem;
    }

    /* Empty states */
    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--color-surface-500);
        font-style: italic;
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .relations-list {
            grid-template-columns: 1fr;
        }

        .relation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
</style>
