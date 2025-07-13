<script lang="ts">
    import { Modal } from '@skeletonlabs/skeleton-svelte';
    import { onMount } from 'svelte';
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { sheetState, characterActions} from '../../states/character_sheet.svelte';
    import type { OptionalSkill, SkillsData } from '../../types';
    import skills from '../../data/skills.json';
    import '../../styles/common-modal.css';
    import { closeDialogueOption, isDialogueOpen, toggleDialogueOption } from '../../states/modals.svelte';

    // Get available optional skills
    const optionalSkills: OptionalSkill[] = skills.optionalSkills;
    
    // Use all skills without filtering
    const filteredSkills = $derived(() => optionalSkills);
    
    // Check if a skill is already selected
    function isSkillSelected(skillId: string): boolean {
        return sheetState.optionalSkills.some(s => s.id === skillId);
    }
    
    // Generate unique variants and random rotations for skill cards
    const skillVariants = generateUniqueVariants(optionalSkills.length);
    const randomRotations = generateRandomRotations(optionalSkills.length);
    
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
    
    // Close modal on Escape key or grid click
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    // Prevent modal close when clicking inside cards
    function handleCardClick(event: MouseEvent) {
        event.stopPropagation();
    }
    
</script>

<svelte:window on:keydown={handleKeydown} />

awdsawds

<!-- TODO: Convert to using the Modal component from Skeleton -->
<Modal
  open={isDialogueOpen('optionalSkills')}
  onOpenChange={(e) => toggleDialogueOption('optionalSkills', e.open)}
  triggerBase="btn preset-tonal"
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>

{#snippet content()}
test content
{/snippet}
</Modal>

{#if false}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <dialog 
        onclick={closeModal}
        transition:fade={{ duration: 200 }}
    >
        <button class="modal-close-button" onclick={closeModal} aria-label="Stäng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <div class="grid-container" onclick={handleCardClick}>
            <div class="card-grid">
                {#each filteredSkills() as skill, index}
                    {@const variantIndex = optionalSkills.findIndex(s => s.id === skill.id)}
                    {@const isSelected = isSkillSelected(skill.id)}
                    {@const rotation = randomRotations[index % randomRotations.length]}
                    
                    <div 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        transition:scale={{ duration: 400, delay: index * 50 }}
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
                {/each}
            </div>
        </div>
    </dialog>
{/if}

<style>
    /* Optional Skills specific styles that override common styles if needed */
</style>
