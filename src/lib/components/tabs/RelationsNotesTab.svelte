<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import FormSection from '../FormSection.svelte';
    import DraggableAddItem from '../DraggableAddItem.svelte';
    import DragOverlay from '../DragOverlay.svelte';
    import RelationModal from '../Modals/RelationModal.svelte';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import { openDialogueOption } from '../../states/modals.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { initInteractForElement } from '../../utils/interactjsUtils';

    // Draggable state
    let isDragging = $state(false);
    let dragOverNotes = $state(false);

    // Modal functions
    function openRelationModal() {
        openDialogueOption('relations');
    }



    function updateNote(index: number, event: Event) {
        const target = event.target as HTMLTextAreaElement;
        characterActions.updateNote(index, target.value);
    }

    // Generate variants for visual variety
    const relationVariants = $derived(generateUniqueVariants(sheetState.relations.length + 1));
    const noteVariants = $derived(generateUniqueVariants(sheetState.notes.length + 1));

    // InteractJS setup
    onMount(() => {
        // Use a slight delay to ensure DOM is fully rendered
        setTimeout(() => {
            // Setup draggable for relation items
            const relationCards = document.querySelectorAll('.relation-card');
            relationCards.forEach(card => {
                if (card instanceof HTMLElement) {
                    initInteractForElement(card, 'relationsNotesTab', undefined, undefined, {
                        enableDraggable: true,
                        enableResizable: false
                    });
                }
            });

            // Setup draggable for note items
            const noteCards = document.querySelectorAll('.note-card');
            noteCards.forEach(card => {
                if (card instanceof HTMLElement) {
                    initInteractForElement(card, 'relationsNotesTab', undefined, undefined, {
                        enableDraggable: true,
                        enableResizable: true
                    });
                }
            });
        }, 100);
    });

    // Re-initialize InteractJS when items are added/removed
    $effect(() => {
        // Watch for changes in relations/notes length
        const relationCount = sheetState.relations.length;
        const noteCount = sheetState.notes.length;
        
        // Re-setup draggable functionality when items change
        setTimeout(() => {
            const relationCards = document.querySelectorAll('.relation-card');
            relationCards.forEach(card => {
                if (card instanceof HTMLElement && !card.hasAttribute('data-interact-initialized')) {
                    initInteractForElement(card, 'relationsNotesTab', undefined, undefined, {
                        enableDraggable: true,
                        enableResizable: false
                    });
                    card.setAttribute('data-interact-initialized', 'true');
                }
            });

            const noteCards = document.querySelectorAll('.note-card');
            noteCards.forEach(card => {
                if (card instanceof HTMLElement && !card.hasAttribute('data-interact-initialized')) {
                    initInteractForElement(card, 'relationsNotesTab', undefined, undefined, {
                        enableDraggable: true,
                        enableResizable: true
                    });
                    card.setAttribute('data-interact-initialized', 'true');
                }
            });
        }, 50);
    });

</script>

<div class="relations-notes-tab space-y-6">
    <!-- Relations and Notes Section -->
    <FormSection header="👥 RELATIONER & ANTECKNINGAR">
        <div class="relations-notes-section">
            <p class="section-description">
                Andra överlevare du träffat i Zonen samt viktiga anteckningar och minnen från dina äventyr.
            </p>
            
            <!-- Combined Items Grid -->
            <div class="items-grid">
                <!-- Relations -->
                {#each sheetState.relations as relation, index}
                    <div class="torn-input-wrapper {relationVariants[index]} relation-card {relation.isClose ? 'close-relation' : ''}" 
                         data-x="0" 
                         data-y="0"
                         data-paper-id="relation-{relation.id}">
                        <div class="relation-content">
                            <div class="relation-header">
                                <div class="item-type-badge relation-badge">👥</div>
                                <h4 class="relation-name">
                                    {relation.name}
                                    {#if relation.isClose}
                                        <span class="close-badge">❤️</span>
                                    {/if}
                                </h4>
                                <button 
                                    class="remove-button" 
                                    onclick={() => characterActions.removeRelation(relation.id)}
                                    aria-label="Ta bort relation med {relation.name}"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            {#if relation.description}
                                <p class="relation-description">{relation.description}</p>
                            {/if}
                        </div>
                    </div>
                {/each}

                <!-- Notes -->
                {#each sheetState.notes as note, index}
                    <div class="torn-input-wrapper {noteVariants[index]} note-card" 
                         data-x="0" 
                         data-y="0"
                         data-paper-id="note-{index}">
                        <div class="note-content">
                            <div class="note-header">
                                <div class="item-type-badge note-badge">📝</div>
                                <span class="note-number">Anteckning #{index + 1}</span>
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
                    </div>
                {/each}
                
                {#if sheetState.relations.length === 0 && sheetState.notes.length === 0}
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>Inga relationer eller anteckningar än. Dokumentera dina äventyr och kontakter i Zonen!</p>
                    </div>
                {/if}
            </div>
        </div>
    </FormSection>
</div>


<DragOverlay />

<!-- Floating Draggable Add Items -->
<DraggableAddItem 
    text="Dra för att lägga till relation"
    ariaLabel="Dra för att skapa en ny relation"
    variant="variant-3"
    dragType="add-relation"
    position={{ top: 120, right: -60 }}
/>

<DraggableAddItem 
    text="Dra för att lägga till anteckning"
    ariaLabel="Dra för att skapa en ny anteckning"
    variant="variant-4"
    dragType="add-note"
    position={{ top: 220, right: -60 }}
/>

<!-- Modals -->
<RelationModal />

<style>
    .relations-notes-tab {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        height: 100vh;
    }

    .section-description {
        font-size: 0.9rem;
        color: var(--color-surface-600);
        margin-bottom: 1.5rem;
        font-style: italic;
        line-height: 1.4;
    }

    :global(.dark) .section-description {
        color: var(--color-surface-400);
    }

    /* Combined items grid */
    .items-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        position: relative;
        min-height: 100px;
    }

    /* Item type badges */
    .item-type-badge {
        font-size: 1.2rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: bold;
        flex-shrink: 0;
    }

    .relation-badge {
        background: rgba(34, 197, 94, 0.2);
        color: var(--color-success-700);
    }

    .note-badge {
        background: rgba(59, 130, 246, 0.2);
        color: var(--color-info-700);
    }

    /* Shared card styles */
    .relation-card,
    .note-card {
        transition: all 0.2s ease;
        cursor: move;
        position: relative;
        touch-action: none;
        user-select: none;
        will-change: transform;
        transform: translateZ(0); /* Force hardware acceleration */
    }

    .relation-card:hover,
    .note-card:hover {
        transform: translateY(-2px) translateZ(0);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        z-index: 10;
    }

    .relation-card:active,
    .note-card:active {
        opacity: 0.8;
        z-index: 20;
        transition: none; /* Disable transition during drag */
    }

    .relation-content,
    .note-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
        height: 100%;
    }

    .relation-card.close-relation {
        border-color: rgba(239, 68, 68, 0.3);
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .relation-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
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
