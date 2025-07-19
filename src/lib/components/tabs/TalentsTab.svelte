<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions } from '../../states/character_sheet.svelte';
    import FormSection from '../FormSection.svelte';
    import DraggableAddItem from '../DraggableAddItem.svelte';
    import { openInfoModal } from '../../states/modals.svelte';
    import TalentsModal from '../Modals/TalentsModal.svelte';
    import { initInteractForElement } from '../../utils/interactjsUtils';
    import PaperCard from '../PaperCard.svelte';
    import { Star, Info } from '@lucide/svelte';

    // Generate unique variants for talent items to make them look different
    const talentVariants = generateUniqueVariants(20); // Generate enough variants

    function showTalentInfo(talent: any) {
        const content = 
            '<div class="talent-section">' +
                '<div class="section-content">' + talent.description + '</div>' +
            '</div>' +
            '<div class="talent-section">' +
                '<h4 class="section-title">Kategori:</h4>' +
                '<div class="section-content">' + (talent.occupation === 'generic' ? 'Generisk talang' : 'Yrkestalang - ' + talent.occupation) + '</div>' +
            '</div>';
        openInfoModal(talent.name, content, 'talent');
    }
    
    function removeTalent(talentId: string) {
        characterActions.removeTalent(talentId);
    }

    // Get talent statistics
    const occupationalTalents = $derived(sheetState.talents.filter(t => t.occupation !== 'generic'));
    const genericTalents = $derived(sheetState.talents.filter(t => t.occupation === 'generic'));

    $effect(() => {
        // Watch for changes in talents length
        sheetState.talents.length;
        
    // Use timeout to ensure DOM is ready
        const talentCards = document.querySelectorAll('.talent-item-card');
        talentCards.forEach((card, index) => {
            $inspect('Running');
            if (card instanceof HTMLElement && !card.hasAttribute('data-interact-initialized')) {
                card.setAttribute('data-interact-initialized', 'true');

                initInteractForElement(card, undefined, undefined, {
                    enableDraggable: true,
                    enableResizable: true
                });
            }
        });
    });

    onMount(() => {
        // Initial setup - ensure DOM is ready before first initialization

    });
</script>

<TalentsModal modalType="occupational" />
<TalentsModal modalType="generic" />

    <!-- Draggable Add Item -->
    <!-- <DraggableAddItem 
        text="Dra för talanger"
        ariaLabel="Dra för att lägga till talanger"
        variant="variant-4"
    /> -->

    <!-- Occupational Talents Section -->

            {#each occupationalTalents as talent, index}
            <PaperCard
                paperId={`occupational-talent-${talent.id}`}
                initialPosition={{ x: 20 + (index % 2) * 300, y: 20 + Math.floor(index / 2) * 80 }}
                draggable={true}
                resizable={false}
                minSize={{ width: 250, height: 60 }}
                class="p-1 pt-3"
                >
            
            {#snippet content()}
                <div class="talent-content">
                    <span class="talent-name"><Star /> {talent.name}</span>
                    <div class="talent-controls-right">
                    <button 
                        class="info-icon-button"
                        onclick={() => showTalentInfo(talent)}
                        aria-label="Information om {talent.name}"
                        title="Visa information om {talent.name}"
                    >
                        <Info size={16} />
                    </button>
                    <button
                        class="remove-talent-button"
                        onclick={() => removeTalent(talent.id)}
                        aria-label="Ta bort {talent.name}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                </div>
            {/snippet}
            
            </PaperCard>

            {/each}
            
            {#each genericTalents as talent, index}
            <PaperCard
                paperId={`generic-talent-${talent.id}`}
                initialPosition={{ x: 20 + (index % 2) * 300, y: 200 + Math.floor(index / 2) * 80 }}
                draggable={true}
                resizable={false}
                minSize={{ width: 250, height: 60 }}
                class="p-1 pt-3"
                >
            {#snippet content()}
            <div class="talent-content">
                <span class="talent-name"><Star /> {talent.name}</span>
                <div class="talent-controls-right">
                    <button 
                        class="info-icon-button"
                        onclick={() => showTalentInfo(talent)}
                        aria-label="Information om {talent.name}"
                        title="Visa information om {talent.name}"
                    >
                        <Info size={16} />
                    </button>
                    <button
                        class="remove-talent-button"
                        onclick={() => removeTalent(talent.id)}
                        aria-label="Ta bort {talent.name}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            {/snippet}
            

            </PaperCard>
            {/each}
            

<style>

    .talent-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem;
        min-height: 2rem;
    }




    .talent-name {
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
        margin-left: 0.25rem;
        margin-right: 0.25rem;
    }

    :global(.dark) .talent-name {
        color: var(--color-surface-100);
    }

    .talent-controls-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
    }

    .remove-talent-button {
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

    .remove-talent-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }

    .talent-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;
        color: var(--color-surface-600);
    }

    :global(.dark) .talent-meta {
        color: var(--color-surface-400);
    }

    .talent-id-display {
        font-weight: bold;
        color: var(--color-primary-600);
    }

    :global(.dark) .talent-id-display {
        color: var(--color-primary-400);
    }

    .talent-occupation {
        font-style: italic;
    }

    .no-talents-message {
        text-align: center;
        padding: 2rem;
        color: var(--color-surface-500);
    }

    .no-talents-message p {
        margin: 0;
        font-style: italic;
    }

    :global(.dark) .no-talents-message {
        color: var(--color-surface-400);
    }
</style>
