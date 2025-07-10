<script lang="ts">
    import FormSection from '../FormSection.svelte';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';

    // Generate random IDs for new items
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Relations management
    let newRelationName = $state('');
    let newRelationDescription = $state('');
    let newRelationIsClose = $state(false);

    function addRelation() {
        if (newRelationName.trim()) {
            characterActions.addRelation({
                id: generateId(),
                name: newRelationName.trim(),
                description: newRelationDescription.trim(),
                isClose: newRelationIsClose
            });
            
            // Reset form
            newRelationName = '';
            newRelationDescription = '';
            newRelationIsClose = false;
        }
    }

    // Notes management
    let newNoteText = $state('');

    function addNote() {
        if (newNoteText.trim()) {
            characterActions.addNote(newNoteText.trim());
            newNoteText = '';
        }
    }

    function updateNote(index: number, event: Event) {
        const target = event.target as HTMLTextAreaElement;
        characterActions.updateNote(index, target.value);
    }

    // Generate variants for visual variety
    const relationVariants = $derived(generateUniqueVariants(sheetState.relations.length + 1));
    const noteVariants = $derived(generateUniqueVariants(sheetState.notes.length + 1));
</script>

<div class="relations-notes-tab space-y-6">
    <!-- Relations Section -->
    <FormSection header="👥 RELATIONER">
        <div class="relations-section">
            <p class="section-description">
                Andra överlevare du träffat i Zonen - vänner, fiender, eller något däremellan.
            </p>
            
            <!-- Add new relation form -->
            <div class="add-item-form">
                <div class="form-row">
                    <div class="torn-input-wrapper variant-1">
                        <input 
                            type="text" 
                            class="torn-input font-user" 
                            placeholder="Namn på person..." 
                            bind:value={newRelationName}
                        />
                    </div>
                    <div class="torn-input-wrapper variant-2">
                        <input 
                            type="text" 
                            class="torn-input font-user" 
                            placeholder="Relation/beskrivning..." 
                            bind:value={newRelationDescription}
                        />
                    </div>
                </div>
                <div class="form-row">
                    <label class="close-relation-checkbox">
                        <input 
                            type="checkbox" 
                            bind:checked={newRelationIsClose}
                        />
                        <span class="checkbox-label">Nära relation</span>
                        <span class="checkbox-hint">(Vän, familj, eller särskilt viktigt)</span>
                    </label>
                    <button class="add-button" onclick={addRelation}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Lägg till
                    </button>
                </div>
            </div>

            <!-- Relations list -->
            <div class="relations-list">
                {#each sheetState.relations as relation, index}
                    <div class="torn-input-wrapper {relationVariants[index]} relation-card {relation.isClose ? 'close-relation' : ''}">
                        <div class="relation-content">
                            <div class="relation-header">
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
                
                {#if sheetState.relations.length === 0}
                    <div class="empty-state">
                        <div class="empty-icon">🤝</div>
                        <p>Inga relationer registrerade än. Vilka andra överlevare har du träffat i Zonen?</p>
                    </div>
                {/if}
            </div>
        </div>
    </FormSection>

    <!-- Notes Section -->
    <FormSection header="📝 ANTECKNINGAR">
        <div class="notes-section">
            <p class="section-description">
                Minnen, viktiga platser, ledtrådar och andra saker du vill komma ihåg från dina äventyr i Zonen.
            </p>
            
            <!-- Add new note form -->
            <div class="add-note-form">
                <div class="torn-input-wrapper variant-1">
                    <textarea 
                        class="torn-input font-user note-input" 
                        placeholder="Skriv en ny anteckning..."
                        rows="3"
                        bind:value={newNoteText}
                    ></textarea>
                </div>
                <button class="add-button" onclick={addNote}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Lägg till anteckning
                </button>
            </div>

            <!-- Notes list -->
            <div class="notes-list">
                {#each sheetState.notes as note, index}
                    <div class="torn-input-wrapper {noteVariants[index]} note-card">
                        <div class="note-content">
                            <div class="note-header">
                                <span class="note-number">#{index + 1}</span>
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
                                rows="3"
                                value={note}
                                oninput={(e) => updateNote(index, e)}
                            ></textarea>
                        </div>
                    </div>
                {/each}
                
                {#if sheetState.notes.length === 0}
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>Inga anteckningar än. Dokumentera dina upptäckter och minnen från Zonen!</p>
                    </div>
                {/if}
            </div>
        </div>
    </FormSection>
</div>

<style>
    .relations-notes-tab {
        display: flex;
        flex-direction: column;
        gap: 2rem;
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

    /* Add item forms */
    .add-item-form,
    .add-note-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);
        border: 1px dashed rgba(217, 119, 6, 0.3);
        border-radius: 0.5rem;
    }

    .form-row {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .form-row .torn-input-wrapper {
        flex: 1;
        min-width: 200px;
    }

    .close-relation-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--color-surface-700);
        flex-shrink: 0;
    }

    :global(.dark) .close-relation-checkbox {
        color: var(--color-surface-300);
    }

    .checkbox-hint {
        font-size: 0.8rem;
        color: var(--color-surface-500);
        font-style: italic;
    }

    .add-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--color-primary-600);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .add-button:hover {
        background: var(--color-primary-700);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }

    /* Relations list */
    .relations-list {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .relation-card {
        transition: all 0.2s ease;
    }

    .relation-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }

    .relation-card.close-relation {
        border-color: rgba(239, 68, 68, 0.3);
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .relation-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
    }

    .relation-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
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

    /* Notes list */
    .notes-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .note-card {
        transition: all 0.2s ease;
    }

    .note-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .note-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
    }

    .note-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .note-number {
        font-family: var(--form-labels), serif;
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
    }

    .note-text,
    .note-input {
        width: 100%;
        background: transparent;
        border: none;
        resize: vertical;
        min-height: 60px;
        font-size: 0.9rem;
        color: var(--color-surface-900);
        line-height: 1.4;
        font-family: var(--font-user), sans-serif;
    }

    :global(.dark) .note-text,
    :global(.dark) .note-input {
        color: var(--color-surface-100);
    }

    .note-text:focus,
    .note-input:focus {
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
        .form-row {
            flex-direction: column;
        }

        .form-row .torn-input-wrapper {
            min-width: unset;
        }

        .relations-list {
            grid-template-columns: 1fr;
        }

        .relation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .close-relation-checkbox {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
        }
    }
</style>
