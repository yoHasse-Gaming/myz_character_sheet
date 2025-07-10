<script lang="ts">
    import { onMount } from 'svelte';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import talentsData from '../../data/talents.json';
    import generalTalentsData from '../../data/general_talents.json';
    import type { Talent } from '../../types';

    // Props to determine which type of talents to show
    let { modalType = 'occupational' }: { modalType: 'occupational' | 'generic' } = $props();

    
    // Determine which talents to show based on modal type
    const availableTalents = $derived(modalType === 'occupational' 
        ? talentsData as Talent[]
        : generalTalentsData as Talent[]);
    
    // Filter out already selected talents
    const filteredTalents = $derived(availableTalents.filter(talent => 
        !sheetState.talents.some(selected => selected.id === talent.id)
    ));
    
    // Group occupational talents by occupation
    const groupedTalents = $derived(modalType === 'occupational' 
        ? filteredTalents.reduce((groups, talent) => {
            const occupation = talent.occupation;
            if (!groups[occupation]) {
                groups[occupation] = [];
            }
            groups[occupation].push(talent);
            return groups;
        }, {} as Record<string, Talent[]>)
        : { 'generic': filteredTalents });

    function addTalent(talent: Talent) {
        // Validate talent selection based on rules
        if (modalType === 'occupational') {
            const occupationalCount = characterActions.getOccupationalTalentCount();
            const genericCount = characterActions.getGenericTalentCount();
            
            if (occupationalCount >= 2) {
                alert('Du kan bara välja 2 yrkestalanger.');
                return;
            }
            
            if (occupationalCount === 1 && genericCount < 3) {
                alert('Du behöver minst 3 generiska talanger för att välja en andra yrkestalang.');
                return;
            }
        } else {
            const genericCount = characterActions.getGenericTalentCount();
            if (genericCount >= 5) {
                alert('Du kan bara välja 5 generiska talanger.');
                return;
            }
        }
        
        characterActions.addTalent(talent);
        closeDialogueOption(modalType === 'occupational' ? 'occupational-talents' : 'generic-talents');
    }

    function closeModal() {
        closeDialogueOption(modalType === 'occupational' ? 'occupational-talents' : 'generic-talents');
    }

    // Handle escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    // Set up event listeners
    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<!-- Occupational Talents Modal -->
{#if isDialogueOpen('occupational-talents') && modalType === 'occupational'}
    <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={closeModal} onkeydown={handleKeydown}>
        <div class="modal-content" role="document" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>⚔️ Välj yrkestalang</h2>
                <button class="close-button" onclick={closeModal} aria-label="Stäng dialog">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="talent-selection-info">
                    <p><strong>Yrkestalanger:</strong> Du kan välja 1-2 yrkestalanger beroende på ditt yrke.</p>
                    <p><strong>Regel:</strong> För din andra yrkestalang behöver du minst 3 generiska talanger först.</p>
                </div>
                
                {#each Object.entries(groupedTalents) as [occupation, talents]}
                    <div class="talent-group">
                        <h3 class="occupation-title">{occupation}</h3>
                        <div class="talents-grid">
                            {#each talents as talent}
                                <div class="talent-card occupational">
                                    <div class="talent-card-header">
                                        <h4 class="talent-name">{talent.name}</h4>
                                        <span class="talent-id">⚔️ {talent.id}</span>
                                    </div>
                                    <p class="talent-description">{talent.description}</p>
                                    <div class="talent-card-footer">
                                        <span class="talent-occupation">{talent.occupation}</span>
                                        <button 
                                            class="add-talent-button occupational"
                                            onclick={() => addTalent(talent)}
                                        >
                                            Välj
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
                
                {#if filteredTalents.length === 0}
                    <div class="no-talents-available">
                        <p>Alla yrkestalanger har redan valts.</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Generic Talents Modal -->
{#if isDialogueOpen('generic-talents') && modalType === 'generic'}
    <div class="modal-overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={closeModal} onkeydown={handleKeydown}>
        <div class="modal-content" role="document" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>🎯 Välj generisk talang</h2>
                <button class="close-button" onclick={closeModal} aria-label="Stäng dialog">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="talent-selection-info">
                    <p><strong>Generiska talanger:</strong> Du kan välja upp till 5 generiska talanger.</p>
                    <p><strong>Tips:</strong> Minst 3 generiska talanger krävs för att välja en andra yrkestalang.</p>
                </div>
                
                <div class="talents-grid">
                    {#each filteredTalents as talent}
                        <div class="talent-card generic">
                            <div class="talent-card-header">
                                <h4 class="talent-name">{talent.name}</h4>
                                <span class="talent-id">🎯 {talent.id}</span>
                            </div>
                            <p class="talent-description">{talent.description}</p>
                            <div class="talent-card-footer">
                                <span class="talent-occupation">Generisk</span>
                                <button 
                                    class="add-talent-button generic"
                                    onclick={() => addTalent(talent)}
                                >
                                    Välj
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
                
                {#if filteredTalents.length === 0}
                    <div class="no-talents-available">
                        <p>Alla generiska talanger har redan valts.</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: var(--color-surface-50);
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        max-width: 90vw;
        max-height: 90vh;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    :global(.dark) .modal-content {
        background: var(--color-surface-900);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-surface-200);
        background: var(--color-surface-100);
    }

    :global(.dark) .modal-header {
        background: var(--color-surface-800);
        border-bottom-color: var(--color-surface-700);
    }

    .modal-header h2 {
        margin: 0;
        color: var(--color-surface-900);
        font-size: 1.5rem;
    }

    :global(.dark) .modal-header h2 {
        color: var(--color-surface-100);
    }

    .close-button {
        background: none;
        border: none;
        color: var(--color-surface-500);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
    }

    .close-button:hover {
        background: var(--color-surface-200);
        color: var(--color-surface-700);
    }

    :global(.dark) .close-button:hover {
        background: var(--color-surface-700);
        color: var(--color-surface-300);
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
    }

    .talent-selection-info {
        background: var(--color-surface-100);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-left: 4px solid var(--color-primary-500);
    }

    :global(.dark) .talent-selection-info {
        background: var(--color-surface-800);
    }

    .talent-selection-info p {
        margin: 0.5rem 0;
        color: var(--color-surface-600);
        font-size: 0.9rem;
    }

    :global(.dark) .talent-selection-info p {
        color: var(--color-surface-400);
    }

    .talent-group {
        margin-bottom: 2rem;
    }

    .occupation-title {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: var(--color-primary-600);
        border-bottom: 2px solid var(--color-primary-500);
        padding-bottom: 0.5rem;
    }

    :global(.dark) .occupation-title {
        color: var(--color-primary-400);
    }

    .talents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .talent-card {
        background: var(--color-surface-50);
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid var(--color-surface-200);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .talent-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .talent-card.occupational {
        border-left: 4px solid var(--color-primary-500);
    }

    .talent-card.generic {
        border-left: 4px solid var(--color-secondary-500);
    }

    :global(.dark) .talent-card {
        background: var(--color-surface-800);
        border-color: var(--color-surface-700);
    }

    .talent-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }

    .talent-name {
        font-size: 1rem;
        font-weight: bold;
        margin: 0;
        color: var(--color-surface-900);
        flex: 1;
    }

    :global(.dark) .talent-name {
        color: var(--color-surface-100);
    }

    .talent-id {
        font-size: 0.8rem;
        color: var(--color-surface-500);
        background: var(--color-surface-100);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        flex-shrink: 0;
    }

    :global(.dark) .talent-id {
        background: var(--color-surface-700);
        color: var(--color-surface-400);
    }

    .talent-description {
        color: var(--color-surface-600);
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0;
        flex: 1;
    }

    :global(.dark) .talent-description {
        color: var(--color-surface-400);
    }

    .talent-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: auto;
    }

    .talent-occupation {
        font-size: 0.8rem;
        color: var(--color-surface-500);
        font-style: italic;
    }

    :global(.dark) .talent-occupation {
        color: var(--color-surface-400);
    }

    .add-talent-button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
        color: white;
    }

    .add-talent-button.occupational {
        background: var(--color-primary-500);
    }

    .add-talent-button.occupational:hover {
        background: var(--color-primary-600);
        transform: translateY(-1px);
    }

    .add-talent-button.generic {
        background: var(--color-secondary-500);
    }

    .add-talent-button.generic:hover {
        background: var(--color-secondary-600);
        transform: translateY(-1px);
    }

    .no-talents-available {
        text-align: center;
        padding: 2rem;
        color: var(--color-surface-500);
        font-style: italic;
    }

    :global(.dark) .no-talents-available {
        color: var(--color-surface-400);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .modal-overlay {
            padding: 0.5rem;
        }
        
        .talents-grid {
            grid-template-columns: 1fr;
        }
        
        .talent-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .talent-card-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
</style>
