<script lang="ts">
    import { onMount } from 'svelte';
    import {
        FloatingArrow,
        arrow,
        autoUpdate,
        flip,
        offset,
        shift,
        useClick,
        useDismiss,
        useFloating,
        useInteractions,
        useRole,
    } from "@skeletonlabs/floating-ui-svelte";
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants } from '$lib';
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
    import type { OptionalSkill, SelectedOptionalSkill } from '$lib/types';
    import optionalSkillsData from '$lib/data/optional-skills.json';

    let { isOpen = $bindable(false) } = $props();
    
    let modalElement: HTMLElement | null = $state(null);
    let selectedCategory = $state<string>('all');
    let searchTerm = $state('');

    // Get available optional skills
    const optionalSkills: OptionalSkill[] = optionalSkillsData.optionalSkills;
    
    // Get unique categories
    const categories = ['all', ...new Set(optionalSkills.map(skill => skill.category))];
    
    // Filter skills based on search and category
    const filteredSkills = $derived(() => {
        return optionalSkills.filter(skill => {
            const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
            const matchesSearch = searchTerm === '' || 
                skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skill.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    });
    
    // Check if a skill is already selected
    function isSkillSelected(skillId: string): boolean {
        return sheetState.optionalSkills.some(s => s.id === skillId);
    }
    
    // Generate unique variants for skill cards
    const skillVariants = generateUniqueVariants(optionalSkills.length);
    
    function toggleSkill(skill: OptionalSkill) {
        if (isSkillSelected(skill.id)) {
            characterActions.removeOptionalSkill(skill.id);
        } else {
            const selectedSkill: SelectedOptionalSkill = {
                ...skill,
                value: 0
            };
            characterActions.addOptionalSkill(selectedSkill);
        }
    }
    
    function closeModal() {
        isOpen = false;
    }
    
    // Close modal on Escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    // Prevent modal close when clicking inside modal content
    function handleModalClick(event: MouseEvent) {
        event.stopPropagation();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="modal-backdrop" 
        onclick={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="modal-container"
            onclick={handleModalClick}
            bind:this={modalElement}
            transition:scale={{ duration: 300, start: 0.9 }}
        >
            <div class="modal-header">
                <h2 class="modal-title">Valfria Färdigheter</h2>
                <button class="close-button" onclick={closeModal} aria-label="Stäng modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-controls">
                <div class="search-container">
                    <input 
                        type="text" 
                        bind:value={searchTerm}
                        placeholder="Sök färdigheter..."
                        class="search-input torn-input"
                    />
                </div>
                
                <div class="category-filters">
                    {#each categories as category}
                        <button 
                            class="category-button {selectedCategory === category ? 'active' : ''}"
                            onclick={() => selectedCategory = category}
                        >
                            {category === 'all' ? 'Alla' : category}
                        </button>
                    {/each}
                </div>
            </div>
            
            <div class="skills-grid">
                {#each filteredSkills() as skill, index}
                    {@const variantIndex = optionalSkills.findIndex(s => s.id === skill.id)}
                    {@const isSelected = isSkillSelected(skill.id)}
                    <div class="skill-card-wrapper">
                        <div class="torn-input-wrapper {skillVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                            <div class="skill-card-content">
                                <div class="skill-card-header">
                                    <h3 class="skill-card-name">{skill.name}</h3>
                                    <div class="skill-card-meta">
                                        <span class="skill-ability">({skill.baseAbility})</span>
                                        <span class="skill-category">{skill.category}</span>
                                    </div>
                                </div>
                                
                                <div class="skill-card-description">
                                    {@html skill.description}
                                </div>
                                
                                <div class="skill-card-effects">
                                    <h4 class="effects-title">Bonuseffekter:</h4>
                                    <div class="effects-content">
                                        {@html skill.bonusEffects}
                                    </div>
                                </div>
                                
                                {#if skill.examples}
                                    <div class="skill-card-examples">
                                        <h4 class="examples-title">Exempel:</h4>
                                        <div class="examples-content">
                                            {@html skill.examples}
                                        </div>
                                    </div>
                                {/if}
                                
                                <button 
                                    class="toggle-skill-button {isSelected ? 'remove' : 'add'}"
                                    onclick={() => toggleSkill(skill)}
                                >
                                    {isSelected ? 'Ta bort' : 'Lägg till'}
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
            
            <div class="modal-footer">
                <div class="selected-count">
                    {sheetState.optionalSkills.length} valfria färdigheter valda
                </div>
                <button class="done-button" onclick={closeModal}>
                    Klar
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }
    
    .modal-container {
        background: var(--color-surface-50);
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        max-width: 90vw;
        max-height: 90vh;
        width: 1200px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    :global(.dark) .modal-container {
        background: var(--color-surface-900);
        border: 1px solid var(--color-surface-700);
    }
    
    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-surface-200);
    }
    
    :global(.dark) .modal-header {
        border-bottom-color: var(--color-surface-700);
    }
    
    .modal-title {
        font-family: var(--form-labels), serif;
        font-size: 1.75rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    :global(.dark) .modal-title {
        color: var(--color-surface-100);
    }
    
    .close-button {
        background: none;
        border: none;
        color: var(--color-surface-600);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .close-button:hover {
        background: var(--color-surface-200);
        color: var(--color-surface-900);
        transform: scale(1.1);
    }
    
    :global(.dark) .close-button {
        color: var(--color-surface-400);
    }
    
    :global(.dark) .close-button:hover {
        background: var(--color-surface-700);
        color: var(--color-surface-100);
    }
    
    .modal-controls {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--color-surface-200);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    :global(.dark) .modal-controls {
        border-bottom-color: var(--color-surface-700);
    }
    
    .search-container {
        display: flex;
        align-items: center;
    }
    
    .search-input {
        flex: 1;
        padding: 0.75rem 1rem;
        font-size: 1rem;
    }
    
    .category-filters {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .category-button {
        padding: 0.5rem 1rem;
        border: 2px solid var(--color-surface-300);
        background: var(--color-surface-100);
        color: var(--color-surface-800);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .category-button:hover {
        background: var(--color-surface-200);
        border-color: var(--color-primary-400);
    }
    
    .category-button.active {
        background: var(--color-primary-600);
        border-color: var(--color-primary-600);
        color: white;
    }
    
    :global(.dark) .category-button {
        background: var(--color-surface-800);
        border-color: var(--color-surface-600);
        color: var(--color-surface-200);
    }
    
    :global(.dark) .category-button:hover {
        background: var(--color-surface-700);
        border-color: var(--color-primary-500);
    }
    
    :global(.dark) .category-button.active {
        background: var(--color-primary-500);
        border-color: var(--color-primary-500);
    }
    
    .skills-grid {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        container-type: inline-size;
    }
    
    @container (max-width: 400px) {
        .skills-grid {
            grid-template-columns: 1fr;
        }
    }
    
    .skill-card-wrapper {
        width: 100%;
    }
    
    .skill-card-content {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
    }
    
    .torn-input-wrapper.selected {
        transform: scale(0.98);
        box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.4);
    }
    
    .skill-card-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .skill-card-name {
        font-family: var(--form-labels), serif;
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
    }
    
    :global(.dark) .skill-card-name {
        color: var(--color-surface-100);
    }
    
    .skill-card-meta {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }
    
    .skill-ability {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
    }
    
    :global(.dark) .skill-ability {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }
    
    .skill-category {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-surface-600);
        font-weight: 600;
    }
    
    :global(.dark) .skill-category {
        color: var(--color-surface-400);
    }
    
    .skill-card-description,
    .effects-content,
    .examples-content {
        font-size: 0.9rem;
        color: var(--color-surface-800);
        line-height: 1.5;
    }
    
    :global(.dark) .skill-card-description,
    :global(.dark) .effects-content,
    :global(.dark) .examples-content {
        color: var(--color-surface-200);
    }
    
    .effects-title,
    .examples-title {
        font-weight: bold;
        font-size: 0.85rem;
        color: var(--color-surface-700);
        margin: 0 0 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    :global(.dark) .effects-title,
    :global(.dark) .examples-title {
        color: var(--color-surface-300);
    }
    
    .toggle-skill-button {
        padding: 0.75rem 1.5rem;
        border: 2px solid var(--color-primary-600);
        background: transparent;
        color: var(--color-primary-600);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: auto;
    }
    
    .toggle-skill-button:hover {
        background: var(--color-primary-600);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }
    
    .toggle-skill-button.remove {
        border-color: var(--color-error-600);
        color: var(--color-error-600);
    }
    
    .toggle-skill-button.remove:hover {
        background: var(--color-error-600);
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    
    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-surface-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--color-surface-100);
    }
    
    :global(.dark) .modal-footer {
        border-top-color: var(--color-surface-700);
        background: var(--color-surface-800);
    }
    
    .selected-count {
        font-weight: 600;
        color: var(--color-surface-700);
    }
    
    :global(.dark) .selected-count {
        color: var(--color-surface-300);
    }
    
    .done-button {
        padding: 0.75rem 2rem;
        background: var(--color-primary-600);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s ease;
    }
    
    .done-button:hover {
        background: var(--color-primary-700);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }
    
    /* HTML content styling */
    .skill-card-description :global(p),
    .effects-content :global(p),
    .examples-content :global(p) {
        margin: 0.5rem 0;
    }
    
    .skill-card-description :global(p:first-child),
    .effects-content :global(p:first-child),
    .examples-content :global(p:first-child) {
        margin-top: 0;
    }
    
    .skill-card-description :global(p:last-child),
    .effects-content :global(p:last-child),
    .examples-content :global(p:last-child) {
        margin-bottom: 0;
    }
    
    .effects-content :global(ul),
    .examples-content :global(ul) {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }
    
    .effects-content :global(li),
    .examples-content :global(li) {
        margin: 0.25rem 0;
    }
    
    .effects-content :global(strong),
    .examples-content :global(strong) {
        color: var(--color-primary-600);
        font-weight: 600;
    }
    
    :global(.dark) .effects-content :global(strong),
    :global(.dark) .examples-content :global(strong) {
        color: var(--color-primary-400);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .modal-container {
            max-width: 95vw;
            max-height: 95vh;
        }
        
        .skills-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 1rem;
        }
        
        .modal-header {
            padding: 1rem;
        }
        
        .modal-controls {
            padding: 0.75rem 1rem;
        }
        
        .modal-footer {
            padding: 0.75rem 1rem;
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
        }
        
        .done-button {
            width: 100%;
        }
    }
</style>
