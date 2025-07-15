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

                initInteractForElement(card, 'talentsTab', undefined, undefined, {
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

<div class="talents-tab">
    <!-- Draggable Add Item -->
    <DraggableAddItem 
        text="Dra för talanger"
        ariaLabel="Dra för att lägga till talanger"
        variant="variant-4"
    />

    <!-- Occupational Talents Section -->
    <div class="talents-section" data-drop-zone="occupational-talents">
            <div class="talents-list">
                {#each occupationalTalents as talent, index}
                <PaperCard
                    paperId={`occupational-talent-${talent.id}`}
                    tabName="talentsTab"
                    draggable={true}
                    resizable={false}
                    >
                {#snippet header()}
                    <span class="talent-name">Yrke: {talent.name}</span>
                    <div class="talent-controls-right">
                    <button 
                        class="info-icon-button"
                        onclick={() => showTalentInfo(talent)}
                        aria-label="Information om {talent.name}"
                        title="Visa information om {talent.name}"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9,9h6v6H9z"></path>
                            <path d="M9,9h6"></path>
                        </svg>
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
                {/snippet}
                
                {#snippet content()}

                <div class="talent-meta">
                    <span class="talent-occupation">Yrke: {talent.occupation}</span>
                </div>
                {/snippet}
                
                </PaperCard>
                    <div class="talent-item-content">
                        <div class="talent-header">
                            <span class="talent-name">Yrke: {talent.name}</span>
                            <div class="talent-controls-right">
                                <button 
                                    class="info-icon-button"
                                    onclick={() => showTalentInfo(talent)}
                                    aria-label="Information om {talent.name}"
                                    title="Visa information om {talent.name}"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9,9h6v6H9z"></path>
                                        <path d="M9,9h6"></path>
                                    </svg>
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
                        <div class="talent-meta">
                            <span class="talent-occupation">Yrke: {talent.occupation}</span>
                        </div>
                    </div>
                {/each}
                
            </div>
    </div>

    <!-- Generic Talents Section -->
    <div class="talents-section" data-drop-zone="generic-talents">
            <!-- <div class="talent-info">
                <p class="talent-description">Generiska talanger ({genericTalents.length}/5) - Allmänna färdigheter tillgängliga för alla</p>
            </div> -->
            
            <div class="talents-list">
                {#each genericTalents as talent, index}
                        <div class="torn-paper-wrapper {talentVariants[(index + occupationalTalents.length) % talentVariants.length]} talent-item-card" 
                        data-x="0" 
                        data-y="0" 
                        data-paper-id="generictalent-{talent.id}">
                            <div class="talent-item-content">
                                <div class="talent-header">
                                    <span class="talent-name">Generisk: {talent.name}</span>
                                    <div class="talent-controls-right">
                                        <button 
                                            class="info-icon-button"
                                            onclick={() => showTalentInfo(talent)}
                                            aria-label="Information om {talent.name}"
                                            title="Visa information om {talent.name}"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="M9,9h6v6H9z"></path>
                                                <path d="M9,9h6"></path>
                                            </svg>
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
                                <div class="talent-meta">
                                    <span class="talent-id-display">🎯 {talent.id}</span>
                                    <span class="talent-occupation">Typ: Generisk</span>
                                </div>
                            </div>
                        </div>
                {/each}
                
            </div>
    </div>
</div>

<style>
    .talents-tab {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        min-height: 100vh;

    }

    .talents-section {
        width: 100%;
        min-height: 200px;
    }

    .talent-info {
        margin-bottom: 1rem;
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.5rem;
    }

    .talent-description {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        color: var(--color-surface-700);
    }

    :global(.dark) .talent-description {
        color: var(--color-surface-300);
    }

    .talent-requirement {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-warning-700);
        font-style: italic;
    }

    :global(.dark) .talent-requirement {
        color: var(--color-warning-400);
    }

    .talents-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .talent-item-wrapper {
        width: 100%;
    }

    .talent-item-card {
        padding: 1rem;
        margin: 0;
        position: relative;
        z-index: 1;
        transition: all 0.2s ease;
        cursor: move;
        touch-action: none;
        user-select: none;
        will-change: transform;
        transform: translateZ(0); /* Force hardware acceleration */
    }

    .talent-item-card:hover {
        transform: translateY(-2px) translateZ(0);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 2;
    }

    .talent-item-card:active {
        opacity: 0.8;
        z-index: 20;
        transition: none; /* Disable transition during drag */
    }

    .talent-item-content {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        z-index: 1;
    }

    .talent-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .talent-name {
        font-weight: bold;
        font-size: 1.1rem;
        color: var(--color-surface-900);
        flex: 1;
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

    .remove-talent-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--color-danger-500);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
    }

    .remove-talent-button:hover {
        background: var(--color-danger-600);
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
