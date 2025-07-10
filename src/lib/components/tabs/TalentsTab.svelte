<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, openDialogueOption, openInfoModal } from '../../states/character_sheet.svelte';
    import FormSection from '../FormSection.svelte';

    // Generate unique variants for talent items to make them look different
    const talentVariants = generateUniqueVariants(20); // Generate enough variants

    function showTalentInfo(talent: any) {
        const content = `
            <div class="talent-section">
                <h4 class="section-title">ID:</h4>
                <div class="section-content">
                    <span class="talent-id-tooltip">⚔️ ${talent.id}</span>
                </div>
            </div>
            <div class="talent-section">
                <h4 class="section-title">Beskrivning:</h4>
                <div class="section-content">${talent.description}</div>
            </div>
            <div class="talent-section">
                <h4 class="section-title">Kategori:</h4>
                <div class="section-content">${talent.occupation === 'generic' ? 'Generisk talang' : `Yrkestalang - ${talent.occupation}`}</div>
            </div>
        `;
        openInfoModal(talent.name, content, 'talent');
    }
    
    function removeTalent(talentId: string) {
        characterActions.removeTalent(talentId);
    }

    // Get talent statistics
    const occupationalTalents = $derived(sheetState.talents.filter(t => t.occupation !== 'generic'));
    const genericTalents = $derived(sheetState.talents.filter(t => t.occupation === 'generic'));
    const canAddOccupational = $derived(characterActions.canAddOccupationalTalent());
    const canAddSecondOccupational = $derived(characterActions.canAddSecondOccupationalTalent());
    const canAddGeneric = $derived(characterActions.canAddGenericTalent());

</script>

<div class="talents-tab">
    <!-- Add Talents Section -->
    <div class="add-talents-section">
        <div class="talent-buttons-grid">
            <button 
                class="add-talent-btn occupational"
                class:disabled={!canAddOccupational && !canAddSecondOccupational}
                onclick={() => canAddOccupational || canAddSecondOccupational ? openDialogueOption('occupational-talents') : null}
                aria-label="Lägg till yrkestalang"
                title={canAddOccupational ? "Välj din första yrkestalang" : canAddSecondOccupational ? "Välj din andra yrkestalang (kräver 3 generiska talanger)" : "Du har redan valt alla yrkestalanger"}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                </svg>
                <span>Lägg till yrkestalang</span>
                <span class="talent-count">({occupationalTalents.length}/2)</span>
            </button>
            
            <button 
                class="add-talent-btn generic"
                class:disabled={!canAddGeneric}
                onclick={() => canAddGeneric ? openDialogueOption('generic-talents') : null}
                aria-label="Lägg till generisk talang"
                title={canAddGeneric ? "Välj en generisk talang" : "Du har redan valt alla generiska talanger (max 5)"}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Lägg till generisk talang</span>
                <span class="talent-count">({genericTalents.length}/5)</span>
            </button>
        </div>
        
        {#if !canAddSecondOccupational && occupationalTalents.length === 1}
            <div class="talent-requirement-info">
                <p>💡 För att välja en andra yrkestalang behöver du först ha minst 3 generiska talanger.</p>
            </div>
        {/if}
    </div>

    <!-- Occupational Talents Section -->
    {#if occupationalTalents.length > 0}
        <div class="talent-category-section">
            <h3 class="category-title">⚔️ Yrkestalanger</h3>
            {#each occupationalTalents as talent, index}
                <div class="talent-item-wrapper">
                    <div class="torn-input-wrapper {talentVariants[index % talentVariants.length]}">
                        <div class="talent-item-content">
                            <div class="talent-header">
                                <span class="talent-name">{talent.name}</span>
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
                                <span class="talent-id-display">⚔️ {talent.id}</span>
                                <span class="talent-occupation">Yrke: {talent.occupation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Generic Talents Section -->
    {#if genericTalents.length > 0}
        <div class="talent-category-section">
            <h3 class="category-title">🎯 Generiska talanger</h3>
            {#each genericTalents as talent, index}
                <div class="talent-item-wrapper">
                    <div class="torn-input-wrapper {talentVariants[(index + occupationalTalents.length) % talentVariants.length]}">
                        <div class="talent-item-content">
                            <div class="talent-header">
                                <span class="talent-name">{talent.name}</span>
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
                                <span class="talent-occupation">Generisk talang</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if sheetState.talents.length === 0}
        <div class="no-talents-message">
            <div class="no-talents-icon">⚔️</div>
            <p class="no-talents-text">Inga talanger valda</p>
            <p class="no-talents-subtext">Välj dina färdigheter och förmågor...</p>
        </div>
    {/if}
</div>

<style>
    .talents-tab {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
    }

    .add-talents-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .talent-buttons-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .add-talent-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        position: relative;
    }

    .add-talent-btn.occupational {
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }

    .add-talent-btn.occupational:hover:not(.disabled) {
        background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
    }

    .add-talent-btn.generic {
        background: linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-600));
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .add-talent-btn.generic:hover:not(.disabled) {
        background: linear-gradient(135deg, var(--color-secondary-600), var(--color-secondary-700));
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .add-talent-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }

    .add-talent-btn:active:not(.disabled) {
        transform: translateY(0);
    }

    .talent-count {
        font-size: 0.8rem;
        opacity: 0.9;
        margin-left: auto;
    }

    .talent-requirement-info {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 0.5rem;
        padding: 1rem;
        text-align: center;
    }

    .talent-requirement-info p {
        margin: 0;
        color: var(--color-secondary-700);
        font-size: 0.9rem;
    }

    :global(.dark) .talent-requirement-info p {
        color: var(--color-secondary-300);
    }

    .talent-category-section {
        margin-bottom: 1.5rem;
    }

    .category-title {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: var(--color-surface-800);
        border-bottom: 2px solid var(--color-primary-500);
        padding-bottom: 0.5rem;
    }

    :global(.dark) .category-title {
        color: var(--color-surface-200);
    }

    .talent-item-wrapper {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .talent-item-content {
        position: relative;
        padding: 1rem;
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
        font-size: 1rem;
        color: var(--color-surface-900);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
        padding: 3rem 2rem;
        color: var(--color-surface-500);
    }

    .no-talents-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }

    .no-talents-text {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
        color: var(--color-surface-700);
    }

    :global(.dark) .no-talents-text {
        color: var(--color-surface-300);
    }

    .no-talents-subtext {
        font-size: 0.9rem;
        font-style: italic;
        margin: 0;
        color: var(--color-surface-500);
    }

    :global(.dark) .no-talents-subtext {
        color: var(--color-surface-400);
    }

    /* Talent tooltip styling */
    .talent-id-tooltip {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.9rem;
        display: inline-block;
    }

    :global(.dark) .talent-id-tooltip {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .talent-buttons-grid {
            grid-template-columns: 1fr;
        }
        
        .talent-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .talent-controls-right {
            align-self: flex-end;
        }
    }
</style>
