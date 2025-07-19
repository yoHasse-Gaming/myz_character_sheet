<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, scale } from "svelte/transition";
    import { generateUniqueVariants, generateRandomRotations } from '../../utils/styleUtils';
    import { sheetState, characterActions} from '../../states/character_sheet.svelte';
    import type { OptionalSkill, SkillsData } from '../../types';
    import skills from '../../data/skills.json';
    import { Modal } from "@skeletonlabs/skeleton-svelte";
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
    
</script>

<Modal
  open={isDialogueOpen('optionalSkills')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50 left-0 top-0 h-screen w-screen"
  contentBase="!z-[101] card p-6 space-y-4 shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="optional-skills-modal-content">
        <button class="modal-close-button" onclick={closeModal} aria-label="Stäng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        
        <div >
            <div class="card-grid">
                {#each filteredSkills() as skill, index}
                    {@const variantIndex = optionalSkills.findIndex(s => s.id === skill.id)}
                    {@const isSelected = isSkillSelected(skill.id)}
                    {@const rotation = randomRotations[index % randomRotations.length]}
                    
                    <button 
                        class="card-wrapper"
                        style="--random-rotation: {rotation}deg"
                        transition:scale={{ duration: 400, delay: index * 50 }}
                        onclick={() => selectSkill(skill)}
                        type="button"
                        aria-label="Välj färdighet: {skill.name}"
                    >
                        <div class="torn-paper-wrapper {skillVariants[variantIndex]} {isSelected ? 'selected' : ''}">
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
                    </button>
                {/each}
            </div>
        </div>
    </div>
  {/snippet}
</Modal>

<style>
    /* Ensure modal appears on top and is properly styled */
    :global(.skeleton-modal-backdrop) {
        z-index: 100 !important;
    }
    
    :global(.skeleton-modal-positioner) {
        z-index: 100 !important;
    }
    
    :global(.skeleton-modal-content) {
        z-index: 101 !important;
    }
    
    /* Optional Skills-specific styles that override common styles if needed */
    .optional-skills-modal-content {
        position: relative;
        z-index: 102;
    }
    
    .modal-close-button {
        z-index: 103 !important;
    }

    /* Make button cards behave like divs but with proper accessibility */

</style>
