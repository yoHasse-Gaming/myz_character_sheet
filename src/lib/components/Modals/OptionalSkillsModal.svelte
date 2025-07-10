<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { sheetState, characterActions, closeDialogueOption, isDialogueOpen } from '../../states/character_sheet.svelte';
    import type { OptionalSkill, SkillsData } from '../../types';
    import skills from '../../data/skills.json';
    import '../../styles/common-modal.css';

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
        <button class="modal-close-button" onclick={closeModal} aria-label="Stäng modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div 
            class="carousel-container"
            bind:this={carouselContainer}
            onclick={handleCarouselClick}
            onwheel={handleWheel}
        >

            <div class="card-stack">
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
                            class="card-wrapper {isCurrent ? 'current' : ''} {isNext ? 'next' : ''} {isPrev ? 'prev' : ''}"
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
                                <div class="card-content">
                                    <div class="card-header">
                                        <h3 class="card-name">{skill.name}</h3>
                                        <div class="card-meta">
                                            <span class="card-ability">({skill.baseAbility})</span>
                                            <span class="card-category">{skill.occupation}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="card-description">
                                        {@html skill.description}
                                    </div>
                                    
                                    <div class="card-effects">
                                        <h4 class="card-effects-title">Bonuseffekter:</h4>
                                        <div class="card-effects-content">
                                            {@html skill.bonusEffects}
                                        </div>
                                    </div>
                                    
                                    {#if skill.examples}
                                        <div class="card-examples">
                                            <h4 class="card-examples-title">Exempel:</h4>
                                            <div class="card-examples-content">
                                                {@html skill.examples}
                                            </div>
                                        </div>
                                    {/if}
                                    
                                    <div class="card-footer">
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
    /* Optional Skills specific styles that override common styles if needed */
</style>
