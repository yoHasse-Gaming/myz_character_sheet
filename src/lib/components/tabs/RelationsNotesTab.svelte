<script lang="ts">
    import { sheetState, characterActions, initialCardPositions } from '../../states/character_sheet.svelte';
    import PaperCard from '../PaperCard.svelte';
    import { HeartHandshake, Notebook, Users } from '@lucide/svelte';
    import ConfirmationModal from '../Modals/ConfirmationModal.svelte';

    function updateNote(index: number, event: Event) {
        const target = event.target as HTMLTextAreaElement;
        characterActions.updateNote(index, target.value);
    }

    // Confirmation modal state
    let confirmationOpen = $state(false);
    let relationToDelete = $state<string | null>(null);
    let relationNameToDelete = $state<string>("");

    function requestDeleteRelation(relationId: string, relationName: string) {
        relationToDelete = relationId;
        relationNameToDelete = relationName;
        confirmationOpen = true;
    }

    function confirmDeleteRelation() {
        if (relationToDelete) {
            characterActions.removeRelation(relationToDelete);
            relationToDelete = null;
            relationNameToDelete = "";
        }
    }

    function cancelDeleteRelation() {
        relationToDelete = null;
        relationNameToDelete = "";
    }

</script>

<!-- Relations Section -->

        <PaperCard 
                paperId={`relations`}
                autoResize={true}
                resizable={true}
                minSize={{ width: 300, height: 110 }}
                initialPosition={initialCardPositions["relations-start"]}
                class="p-2"
            >
            {#snippet content()}
        {#each sheetState.relations as relation, index}

            <div class="compact-textarea-field">
                <div class="relation-header">
                    <div class="relation-name-section">
                        <HeartHandshake
                            fill={relation.isClose ? 'red' : 'none'}
                        />
                        <input
                            type="text"
                            class="relation-name-input font-user"
                            bind:value={relation.name}
                            oninput={(e) => characterActions.updateRelation(relation.id, { name: e.currentTarget.value })}
                            placeholder="Namn på relation"
                        />
                    </div>
                    <div class="relation-controls">
                        <button 
                            class="close-button {relation.isClose ? 'active' : ''}"
                            onclick={() => characterActions.updateRelation(relation.id, { isClose: !relation.isClose })}
                            aria-label="Markera som {relation.isClose ? 'vanlig' : 'nära'} relation"
                            title={relation.isClose ? 'Nära relation' : 'Vanlig relation'}
                        >
                            <HeartHandshake size={16} fill={relation.isClose ? 'red' : 'none'} />
                        </button>
                        <button 
                            class="remove-button" 
                            onclick={() => requestDeleteRelation(relation.id, relation.name)}
                            aria-label="Ta bort relation {relation.name}"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <textarea
                    class="compact-textarea font-user"
                    placeholder="Skriv relation här..."
                    bind:value={relation.description}
                    oninput={(e) => characterActions.updateRelation(relation.id, { description: e.currentTarget.value })}
                    rows="2"
                ></textarea>
            </div>


        {/each}
            {/snippet}
        </PaperCard>


<!-- Notes Section -->
        {#each sheetState.notes as note, index}
        <PaperCard 
            paperId={`note-${index}`}
            class="p-1"
            resizable={true}
            initialPosition={characterActions.getNotePosition(index)}
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


<!-- Confirmation Modal -->
<ConfirmationModal 
    bind:open={confirmationOpen}
    title="Ta bort relation"
    message={`Är du säker på att du vill ta bort relationen "${relationNameToDelete}"?`}
    confirmText="Ta bort"
    cancelText="Avbryt"
    onConfirm={confirmDeleteRelation}
    onCancel={cancelDeleteRelation}
/>

<style>

    .note-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
        height: 100%;
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

    .relation-name-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .relation-name-input {
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--form-labels), serif;
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        flex: 1;
        min-width: 0;
    }

    :global(.dark) .relation-name-input {
        color: var(--color-surface-100);
    }

    .relation-name-input:focus {
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.25rem;
        padding: 0.25rem;
    }

    .relation-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .close-button {
        padding: 0.25rem;
        border-radius: 50%;
        border: 1px solid var(--color-surface-300);
        background: transparent;
        color: var(--color-surface-600);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .close-button:hover {
        background: var(--color-surface-100);
        transform: scale(1.1);
    }

    .close-button.active {
        border-color: var(--color-error-500);
        background: var(--color-error-50);
        color: var(--color-error-600);
    }

    .close-button.active:hover {
        background: var(--color-error-100);
    }

    :global(.dark) .close-button {
        border-color: var(--color-surface-600);
        color: var(--color-surface-400);
    }

    :global(.dark) .close-button:hover {
        background: var(--color-surface-700);
    }

    :global(.dark) .close-button.active {
        border-color: var(--color-error-400);
        background: var(--color-error-900);
        color: var(--color-error-300);
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

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .relation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
</style>
