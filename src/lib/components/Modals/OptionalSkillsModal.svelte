<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import type { OptionalSkill, SkillsData } from '../../types';
    import skills from '../../data/skills.json';

    // Get the modal state from the global dialogue system

    
    let carouselContainer: HTMLElement | null = $state(null);
    let currentSkillIndex = $state(0);
    let isScrolling = $state(false);

    // Get available optional skills
    const optionalSkills: OptionalSkill[] = skills.optionalSkills;
    
    // Use all skills without filtering
    const filteredSkills = $derived(() => optionalSkills);
    
    // Check if a skill is already selected
    function isSkillSelected(skillId: string): boolean {
        return sheetState.optionalSkills.some(s => s.id === skillId);
    }
    
    // Generate unique variants for skill cards
    const skillVariants = generateUniqueVariants(optionalSkills.length);
    
    function selectSkill(skill: OptionalSkill) {
        if (isSkillSelected(skill.id)) {
            characterActions.removeOptionalSkill(skill.id);
        } else {
            // Remove any existing optional skill first (only allow one)
            if (sheetState.optionalSkills.length > 0) {
                characterActions.removeOptionalSkill(sheetState.optionalSkills[0].id);
            }
            const selectedSkill: OptionalSkill = skill;
            characterActions.addOptionalSkill(selectedSkill);
            // Automatically close the modal after selection
            setTimeout(() => closeModal(), 500);
        }
    }
    
    function closeModal() {
        closeDialogueOption('optionalSkills');
    }
    
    // Navigate carousel
    function nextSkill() {
        if (currentSkillIndex < filteredSkills().length - 1) {
            currentSkillIndex++;
        }
    }
    
    function prevSkill() {
        if (currentSkillIndex > 0) {
            currentSkillIndex--;
        }
    }
    
    // Handle scroll wheel navigation
    function handleWheel(event: WheelEvent) {
        event.preventDefault();
        
        if (isScrolling) return;
        isScrolling = true;
        
        if (event.deltaY > 0) {
            nextSkill();
        } else {
            prevSkill();
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 300);
    }
    
    // Close modal on Escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            nextSkill();
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            prevSkill();
        }
    }
    
    // Prevent modal close when clicking inside carousel
    function handleCarouselClick(event: MouseEvent) {
        event.stopPropagation();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isDialogueOpen('optionalSkills')}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="modal-backdrop" 
        onclick={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <!-- Floating Controls at the top -->
        <!-- <div class="floating-controls">
            <div class="controls-header">
                <h2 class="modal-title">Valfria Färdigheter</h2>
                <button class="close-button" onclick={closeModal} aria-label="Stäng modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div> -->

        <!-- Carousel Wheel Container -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="carousel-container"
            bind:this={carouselContainer}
            onclick={handleCarouselClick}
            onwheel={handleWheel}
        >
            <div class="skill-stack">
                {#each filteredSkills() as skill, index}
                    {@const variantIndex = optionalSkills.findIndex(s => s.id === skill.id)}
                    {@const isSelected = isSkillSelected(skill.id)}
                    {@const isCurrent = index === currentSkillIndex}
                    {@const isNext = index === currentSkillIndex + 1}
                    {@const isPrev = index === currentSkillIndex - 1}
                    {@const distance = Math.abs(index - currentSkillIndex)}
                    {@const isVisible = distance <= 3}
                    
                    {#if isVisible}
                        <div 
                            class="skill-card-wrapper {isCurrent ? 'current' : ''} {isNext ? 'next' : ''} {isPrev ? 'prev' : ''}"
                            style="
                                z-index: {100 - distance};
                                transform: 
                                    translateX({(index - currentSkillIndex) * 15}px)
                                    translateY({distance * 15}px)
                                    rotate({(index - currentSkillIndex) * 3}deg)
                                    scale({1 - distance * 0.1});
                                opacity: {1 - distance * 0.3};
                            "
                            transition:scale={{ duration: 400, delay: distance * 50 }}
                            onclick={() => selectSkill(skill)}
                        >
                            <div class="torn-input-wrapper {skillVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                                <div class="skill-card-content">
                                    <div class="skill-card-header">
                                        <h3 class="skill-card-name">{skill.name}</h3>
                                        <div class="skill-card-meta">
                                            <span class="skill-ability">({skill.baseAbility})</span>
                                            <span class="skill-category">{skill.occupation}</span>
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
                                    
                                    <div class="skill-card-footer">
                                        {#if isSelected}
                                            <div class="selected-indicator">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                    <polyline points="20,6 9,17 4,12"></polyline>
                                                </svg>
                                                <span>Vald</span>
                                            </div>
                                        {:else}
                                            <div class="select-hint">
                                                Klicka för att välja
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
            
            <!-- Navigation Controls -->
            <div class="carousel-navigation">
                <button 
                    class="nav-button prev" 
                    onclick={prevSkill}
                    disabled={currentSkillIndex === 0}
                    aria-label="Föregående färdighet"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>
                
                <div class="carousel-indicator">
                    <span class="current-index">{currentSkillIndex + 1}</span>
                    <span class="separator">/</span>
                    <span class="total-count">{filteredSkills().length}</span>
                </div>
                
                <button 
                    class="nav-button next" 
                    onclick={nextSkill}
                    disabled={currentSkillIndex >= filteredSkills().length - 1}
                    aria-label="Nästa färdighet"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Floating Footer -->
        <!-- <div class="floating-footer">
            <div class="selected-count">
                {#if sheetState.optionalSkills.length > 0}
                    Vald färdighet: {sheetState.optionalSkills[0].name}
                {:else}
                    Ingen färdighet vald
                {/if}
            </div>
            <button class="done-button" onclick={closeModal}>
                Klar
            </button>
        </div> -->
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0 !important;
        left: 0 !important;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9999;
        overflow: hidden;
        margin: 0;
        padding: 0;
        transform: none;
    }
    
    /* Floating Controls at Top */
    .floating-controls {
        position: absolute;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 1.5rem;
        min-width: 300px;
        max-width: 80vw;
        z-index: 110;
        border: 1px solid rgba(217, 119, 6, 0.3);
    }
    
    .controls-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .modal-title {
        font-family: var(--form-labels), serif;
        font-size: 1.5rem;
        font-weight: bold;
        color: #f5f5f5;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    }
    
    .close-button {
        background: none;
        border: none;
        color: #a1a1aa;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .close-button:hover {
        background: rgba(217, 119, 6, 0.2);
        color: #f5f5f5;
        transform: scale(1.1);
    }
    
    /* Carousel Container */
    .carousel-container {
        position: absolute;
        top: 50vh;
        left: 50vw;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 500px;
        perspective: 1000px;
        perspective-origin: center center;
    }
    
    .skill-stack {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
    }
    
    .skill-card-wrapper {
        position: absolute;
        width: 350px;
        height: 450px;
        transform-origin: center center;
        transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        cursor: pointer;
    }
    
    .skill-card-wrapper.current {
        transform: translate(-50%, -50%) scale(1) rotateZ(0deg);
        z-index: 100;
    }
    
    .skill-card-wrapper.next {
        transform: translate(-30%, -50%) scale(0.9) rotateZ(5deg) translateZ(-50px);
        z-index: 99;
        opacity: 0.8;
    }
    
    .skill-card-wrapper.prev {
        transform: translate(-70%, -50%) scale(0.9) rotateZ(-5deg) translateZ(-50px);
        z-index: 99;
        opacity: 0.8;
    }
    
    .skill-card-wrapper:not(.current):not(.next):not(.prev) {
        transform: translate(-50%, -50%) scale(0.7) rotateZ(0deg) translateZ(-100px);
        opacity: 0.4;
    }
    
    .skill-card-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        position: relative;
        z-index: 2;
        overflow-y: auto;
    }
    
    .torn-input-wrapper.selected {
        box-shadow: 0 0 20px rgba(217, 119, 6, 0.6);
        transform: scale(1.02);
    }
    
    .skill-card-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .skill-card-name {
        font-family: var(--form-labels), serif;
        font-size: 1.4rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
    
    .skill-card-footer {
        margin-top: auto;
        padding-top: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .selected-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-success-600);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.9rem;
    }
    
    :global(.dark) .selected-indicator {
        color: var(--color-success-400);
    }
    
    .selected-indicator svg {
        color: var(--color-success-600);
    }
    
    :global(.dark) .selected-indicator svg {
        color: var(--color-success-400);
    }
    
    .select-hint {
        color: var(--color-surface-600);
        font-style: italic;
        font-size: 0.85rem;
        text-align: center;
        opacity: 0.8;
    }
    
    :global(.dark) .select-hint {
        color: var(--color-surface-400);
    }
    
    /* Navigation Controls */
    .carousel-navigation {
        position: absolute;
        bottom: -4rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        padding: 1rem 1.5rem;
        border-radius: 2rem;
        border: 1px solid rgba(217, 119, 6, 0.3);
    }
    
    .nav-button {
        background: none;
        border: 2px solid rgba(217, 119, 6, 0.4);
        color: #d97706;
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .nav-button:hover:not(:disabled) {
        background: rgba(217, 119, 6, 0.2);
        color: #f5f5f5;
        transform: scale(1.1);
    }
    
    .nav-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
    
    .carousel-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #f5f5f5;
        font-weight: 600;
        min-width: 4rem;
        justify-content: center;
    }
    
    .current-index {
        color: #d97706;
        font-size: 1.2rem;
    }
    
    .separator {
        color: #71717a;
    }
    
    /* Floating Footer */
    .floating-footer {
        position: absolute;
        bottom: 2rem;
        left: 50vw;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 2rem;
        border: 1px solid rgba(217, 119, 6, 0.3);
        z-index: 110;
    }
    
    .selected-count {
        font-weight: 600;
        color: #f5f5f5;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .done-button {
        padding: 0.75rem 2rem;
        background: #d97706;
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
        background: #b45309;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
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
        .floating-controls {
            top: 1rem;
            left: 1rem;
            right: 1rem;
            transform: none;
            min-width: unset;
            max-width: unset;
        }
        
        .carousel-container {
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 400px;
        }
        
        .skill-card-wrapper {
            width: 280px;
            height: 360px;
        }
        
        .skill-card-content {
            padding: 1rem;
        }
        
        .floating-footer {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            transform: none;
            flex-direction: column;
            gap: 1rem;
        }
        
        .done-button {
            width: 100%;
        }
        
        .carousel-navigation {
            bottom: -3rem;
        }
    }
</style>
