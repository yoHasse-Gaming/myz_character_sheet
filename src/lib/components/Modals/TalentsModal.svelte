<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import talentsData from '../../data/talents.json';
    import generalTalentsData from '../../data/general_talents.json';
    import type { Talent } from '../../types';

    // Props to determine which type of talents to show
    let { modalType = 'occupational' }: { modalType: 'occupational' | 'generic' } = $props();

    // Carousel state
    let carouselContainer: HTMLElement | null = $state(null);
    let currentTalentIndex = $state(0);
    let isScrolling = $state(false);
    
    // Determine which talents to show based on modal type
    const availableTalents = $derived(modalType === 'occupational' 
        ? talentsData as Talent[]
        : generalTalentsData as Talent[]);
    
    // Filter out already selected talents
    const filteredTalents = $derived(availableTalents.filter(talent => 
        !sheetState.talents.some(selected => selected.id === talent.id)
    ));
    
    // Check if a talent is already selected
    function isTalentSelected(talentId: string): boolean {
        return sheetState.talents.some(t => t.id === talentId);
    }
    
    // Generate unique variants for talent cards
    const talentVariants = $derived(generateUniqueVariants(availableTalents.length));

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
        // Automatically close the modal after selection
        setTimeout(() => closeModal(), 500);
    }

    function closeModal() {
        closeDialogueOption(modalType === 'occupational' ? 'occupational-talents' : 'generic-talents');
    }

    // Navigate carousel
    function nextTalent() {
        if (currentTalentIndex < filteredTalents.length - 1) {
            currentTalentIndex++;
        }
    }
    
    function prevTalent() {
        if (currentTalentIndex > 0) {
            currentTalentIndex--;
        }
    }
    
    // Handle scroll wheel navigation
    function handleWheel(event: WheelEvent) {
        event.preventDefault();
        
        if (isScrolling) return;
        isScrolling = true;
        
        if (event.deltaY > 0) {
            nextTalent();
        } else {
            prevTalent();
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 300);
    }

    // Handle escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            nextTalent();
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            prevTalent();
        }
    }

    // Prevent modal close when clicking inside carousel
    function handleCarouselClick(event: MouseEvent) {
        event.stopPropagation();
    }

    // Set up event listeners
    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Occupational Talents Modal -->
{#if isDialogueOpen('occupational-talents') && modalType === 'occupational'}
    <div 
        class="modal-backdrop" 
        onclick={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <!-- Carousel Container -->
        <div 
            class="carousel-container"
            bind:this={carouselContainer}
            onclick={handleCarouselClick}
            onwheel={handleWheel}
        >
            <div class="talent-stack">
                {#each filteredTalents as talent, index}
                    {@const variantIndex = availableTalents.findIndex(t => t.id === talent.id)}
                    {@const isSelected = isTalentSelected(talent.id)}
                    {@const isCurrent = index === currentTalentIndex}
                    {@const isNext = index === currentTalentIndex + 1}
                    {@const isPrev = index === currentTalentIndex - 1}
                    {@const distance = Math.abs(index - currentTalentIndex)}
                    {@const isVisible = distance <= 3}
                    
                    {#if isVisible}
                        <div 
                            class="talent-card-wrapper {isCurrent ? 'current' : ''} {isNext ? 'next' : ''} {isPrev ? 'prev' : ''}"
                            style="
                                z-index: {100 - distance};
                                transform: 
                                    translateX({(index - currentTalentIndex) * 15}px)
                                    translateY({distance * 15}px)
                                    rotate({(index - currentTalentIndex) * 3}deg)
                                    scale({1 - distance * 0.1});
                                opacity: {1 - distance * 0.3};
                            "
                            transition:scale={{ duration: 400, delay: distance * 50 }}
                            onclick={() => addTalent(talent)}
                        >
                            <div class="torn-input-wrapper {talentVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                                <div class="talent-card-content">
                                    <div class="talent-card-header">
                                        <h3 class="talent-card-name">{talent.name}</h3>
                                        <div class="talent-card-meta">
                                            <span class="talent-icon">⚔️</span>
                                            <span class="talent-id">{talent.id}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="talent-card-description">
                                        {@html talent.description}
                                    </div>
                                    
                                    <div class="talent-card-occupation">
                                        <h4 class="occupation-title">Kategori:</h4>
                                        <div class="occupation-content">
                                            {talent.occupation === 'generic' ? 'Generisk talang' : `Yrkestalang - ${talent.occupation}`}
                                        </div>
                                    </div>
                                    
                                    <div class="talent-card-footer">
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

            <!-- Navigation Indicators -->
            <div class="nav-indicators">
                {#each filteredTalents as _, index}
                    <button 
                        class="nav-dot {index === currentTalentIndex ? 'active' : ''}"
                        onclick={() => currentTalentIndex = index}
                        aria-label="Gå till talang {index + 1}"
                    ></button>
                {/each}
            </div>

            <!-- Navigation Controls -->
            <div class="nav-controls">
                <button 
                    class="nav-button prev" 
                    onclick={prevTalent}
                    disabled={currentTalentIndex === 0}
                    aria-label="Föregående talang"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>

                <div class="carousel-counter">
                    {currentTalentIndex + 1} / {filteredTalents.length}
                </div>

                <button 
                    class="nav-button next" 
                    onclick={nextTalent}
                    disabled={currentTalentIndex === filteredTalents.length - 1}
                    aria-label="Nästa talang"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>

            <!-- Modal Title -->
            <div class="modal-title">
                <h2>⚔️ Yrkestalanger</h2>
            </div>
        </div>
    </div>
{/if}

<!-- Generic Talents Modal -->
{#if isDialogueOpen('generic-talents') && modalType === 'generic'}
    <div 
        class="modal-backdrop" 
        onclick={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <!-- Carousel Container -->
        <div 
            class="carousel-container"
            bind:this={carouselContainer}
            onclick={handleCarouselClick}
            onwheel={handleWheel}
        >
            <div class="talent-stack">
                {#each filteredTalents as talent, index}
                    {@const variantIndex = availableTalents.findIndex(t => t.id === talent.id)}
                    {@const isSelected = isTalentSelected(talent.id)}
                    {@const isCurrent = index === currentTalentIndex}
                    {@const isNext = index === currentTalentIndex + 1}
                    {@const isPrev = index === currentTalentIndex - 1}
                    {@const distance = Math.abs(index - currentTalentIndex)}
                    {@const isVisible = distance <= 3}
                    
                    {#if isVisible}
                        <div 
                            class="talent-card-wrapper {isCurrent ? 'current' : ''} {isNext ? 'next' : ''} {isPrev ? 'prev' : ''}"
                            style="
                                z-index: {100 - distance};
                                transform: 
                                    translateX({(index - currentTalentIndex) * 15}px)
                                    translateY({distance * 15}px)
                                    rotate({(index - currentTalentIndex) * 3}deg)
                                    scale({1 - distance * 0.1});
                                opacity: {1 - distance * 0.3};
                            "
                            transition:scale={{ duration: 400, delay: distance * 50 }}
                            onclick={() => addTalent(talent)}
                        >
                            <div class="torn-input-wrapper {talentVariants[variantIndex]} {isSelected ? 'selected' : ''}">
                                <div class="talent-card-content">
                                    <div class="talent-card-header">
                                        <h3 class="talent-card-name">{talent.name}</h3>
                                        <div class="talent-card-meta">
                                            <span class="talent-icon">🎯</span>
                                            <span class="talent-id">{talent.id}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="talent-card-description">
                                        {@html talent.description}
                                    </div>
                                    
                                    <div class="talent-card-occupation">
                                        <h4 class="occupation-title">Kategori:</h4>
                                        <div class="occupation-content">
                                            {talent.occupation === 'generic' ? 'Generisk talang' : `Yrkestalang - ${talent.occupation}`}
                                        </div>
                                    </div>
                                    
                                    <div class="talent-card-footer">
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

            <!-- Navigation Indicators -->
            <div class="nav-indicators">
                {#each filteredTalents as _, index}
                    <button 
                        class="nav-dot {index === currentTalentIndex ? 'active' : ''}"
                        onclick={() => currentTalentIndex = index}
                        aria-label="Gå till talang {index + 1}"
                    ></button>
                {/each}
            </div>

            <!-- Navigation Controls -->
            <div class="nav-controls">
                <button 
                    class="nav-button prev" 
                    onclick={prevTalent}
                    disabled={currentTalentIndex === 0}
                    aria-label="Föregående talang"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>

                <div class="carousel-counter">
                    {currentTalentIndex + 1} / {filteredTalents.length}
                </div>

                <button 
                    class="nav-button next" 
                    onclick={nextTalent}
                    disabled={currentTalentIndex === filteredTalents.length - 1}
                    aria-label="Nästa talang"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>

            <!-- Modal Title -->
            <div class="modal-title">
                <h2>🎯 Generiska talanger</h2>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(8px);
    }

    .carousel-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 1rem;
        overflow: hidden;
    }

    .talent-stack {
        position: relative;
        width: 50%;
        height: 50%;
    }

    .talent-card-wrapper {
        position: absolute;
        top: 25%;
        left: 50%;
        width: 90%;
        height: 85%;
        transform-origin: center center;
        transform-style: preserve-3d;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        cursor: pointer;
    }

    .talent-card-wrapper.current {
        transform: translate(-50%, -50%) scale(1) rotateZ(0deg);
        z-index: 100;
    }
    
    .talent-card-wrapper.next {
        transform: translate(-30%, -50%) scale(0.9) rotateZ(5deg) translateZ(-50px);
        z-index: 99;
        opacity: 0.8;
    }
    
    .talent-card-wrapper.prev {
        transform: translate(-70%, -50%) scale(0.9) rotateZ(-5deg) translateZ(-50px);
        z-index: 99;
        opacity: 0.8;
    }
    
    .talent-card-wrapper:not(.current):not(.next):not(.prev) {
        transform: translate(-50%, -50%) scale(0.7) rotateZ(0deg) translateZ(-100px);
        opacity: 0.4;
    }
    
    .talent-card-content {
        position: relative;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        overflow-y: auto;
        z-index: 1;
    }
    
    .talent-card-header {
        text-align: center;
        padding-bottom: 1rem;
    }
    
    .talent-card-name {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
        color: var(--color-surface-900);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        line-height: 1.2;
    }
    
    :global(.dark) .talent-card-name {
        color: var(--color-surface-100);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .talent-card-meta {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        justify-content: center;
        margin-top: 0.5rem;
    }
    
    .talent-icon {
        font-size: 1.2rem;
    }
    
    .talent-id {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
    }
    
    :global(.dark) .talent-id {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }
    
    .talent-card-description {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--color-surface-800);
        flex: 1;
    }
    
    .talent-card-occupation {
        background: rgba(217, 119, 6, 0.05);
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(217, 119, 6, 0.2);
    }
    
    :global(.dark) .talent-card-occupation {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.3);
    }
    
    :global(.dark) .talent-card-description {
        color: var(--color-surface-200);
    }
    
    .occupation-title {
        font-weight: bold;
        font-size: 0.85rem;
        color: var(--color-surface-700);
        margin: 0 0 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    :global(.dark) .occupation-title {
        color: var(--color-surface-300);
    }
    
    .occupation-content {
        font-size: 0.9rem;
        color: var(--color-surface-800);
        line-height: 1.5;
        font-style: italic;
    }
    
    :global(.dark) .occupation-content {
        color: var(--color-surface-200);
    }
    
    .talent-card-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 1rem;
        border-top: 1px solid var(--color-surface-300);
        margin-top: auto;
    }
    
    :global(.dark) .talent-card-footer {
        border-top-color: var(--color-surface-600);
    }
    
    .selected-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-success-600);
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    .select-hint {
        color: var(--color-surface-600);
        font-size: 0.9rem;
        font-style: italic;
    }
    
    :global(.dark) .select-hint {
        color: var(--color-surface-400);
    }

    .nav-indicators {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2rem;
        backdrop-filter: blur(8px);
    }

    .nav-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .nav-dot:hover {
        background: rgba(255, 255, 255, 0.7);
        transform: scale(1.2);
    }

    .nav-dot.active {
        background: var(--color-primary-500);
        transform: scale(1.3);
    }

    .nav-controls {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2rem;
        backdrop-filter: blur(8px);
    }

    .nav-button {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .nav-button:hover:not(:disabled) {
        background: var(--color-primary-600);
        transform: scale(1.1);
    }

    .nav-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .carousel-counter {
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        min-width: 4rem;
        text-align: center;
    }

    .modal-title {
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.75rem 1.5rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2rem;
        backdrop-filter: blur(8px);
    }

    .modal-title h2 {
        margin: 0;
        color: white;
        font-size: 1.25rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* HTML content styling */
    .talent-card-description :global(p) {
        margin: 0.5rem 0;
    }
    
    .talent-card-description :global(p:first-child) {
        margin-top: 0;
    }
    
    .talent-card-description :global(p:last-child) {
        margin-bottom: 0;
    }
    
    .talent-card-description :global(ul) {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
    }
    
    .talent-card-description :global(li) {
        margin: 0.5rem 0;
        line-height: 1.5;
    }
    
    .talent-card-description :global(strong) {
        color: var(--color-primary-600);
        font-weight: bold;
    }
    
    :global(.dark) .talent-card-description :global(strong) {
        color: var(--color-primary-400);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .carousel-container {
            width: 95vw;
            height: 90vh;
        }
        
        .talent-card-content {
            padding: 1rem;
            gap: 0.75rem;
        }
        
        .talent-card-name {
            font-size: 1.25rem;
        }
        
        .nav-controls {
            gap: 0.75rem;
            padding: 0.5rem 1rem;
        }
        
        .nav-button {
            width: 2rem;
            height: 2rem;
        }
        
        .modal-title {
            top: 20px;
        }
        
        .modal-title h2 {
            font-size: 1rem;
        }
    }
</style>
