<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../../utils/styleUtils';
    import { sheetState, characterActions } from '../../../states/character_sheet.svelte';
    import { openDialogueOption, openInfoModal } from '../../../states/modals.svelte';
    import { initInteractForElement } from '../../../utils/interactjsUtils';
    import { getIconForAbility } from '../../../utils/iconUtils';
    import { Tooltip } from '@skeletonlabs/skeleton-svelte';
    import { Circle, CircleX, Dices, Info, PlusCircle } from '@lucide/svelte';
    import { diceStates } from '../../../states/dice.svelte';
    import PaperCard from '../../PaperCard.svelte';
    import ConfirmationModal from '../../Modals/ConfirmationModal.svelte';
    import ChevronInput from '../../ChevronInput.svelte';

    const { startPosition = { x: 1020, y: 20 } }: {
        startPosition?: { x: number, y: number }
    } = $props();

    let confirmState = $state({
        confirmationOpen: false,
        skillNameToDelete: ''
    });

    // Generate unique variants for skill items to make them look different
    const skillVariants = generateUniqueVariants(sheetState.skills.length + sheetState.optionalSkills.length);
    
    // Track tooltip state for each skill individually
    let tooltipStates: Record<string, boolean> = $state({});

    // Function to generate initial positions for skills
    function getInitialPosition(index: number) {
        const startX = startPosition?.x || 1020; // Start far to the right to avoid character elements
        const startY = startPosition?.y || 20; // Start from top
        
        const cols = 2; // 2 columns for better organization
        const cardWidth = 260; // Width of each skill card + margin
        const cardHeight = 65; // Height of each skill card + margin
        
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        // Position skills in a well-spaced grid layout
        const x = col * cardWidth + startX;
        const y = row * cardHeight + startY;
        return { x, y };
    }
        // const x = col * 280 + 600;
        // const y = row * 70 + 20;
        // return { x, y };
    

    $effect(() => {
        // Debug: Check if characterActions is available
    });

    onMount(() => {
        // Debug: Check if characterActions is available
        
        // Initialize InteractJS for draggable and resizable skill papers
        const skillElements = document.querySelectorAll('.skill-paper');
        
        // Restore saved positions and sizes
        skillElements.forEach((element, index) => {
            const paperId = element.getAttribute('data-paper-id');
            if (paperId) {
                
                try {
                    const savedLayout = characterActions.getPaperLayout(paperId);
                    if (savedLayout) {
                        console.log('Restoring layout for', paperId, savedLayout);
                        const htmlElement = element as HTMLElement;
                        // Apply saved position
                        htmlElement.style.transform = `translate(${savedLayout.x}px, ${savedLayout.y}px)`;
                        htmlElement.setAttribute('data-x', savedLayout.x.toString());
                        htmlElement.setAttribute('data-y', savedLayout.y.toString());
                        
                        // Apply saved size if available
                        if (savedLayout.width) htmlElement.style.width = savedLayout.width + 'px';
                        if (savedLayout.height) htmlElement.style.height = savedLayout.height + 'px';
                    }
                } catch (error) {
                    console.error('Error restoring layout for', paperId, error);
                }
            }
        });
    });


    function showSkillInfo(skill: any) {
        const content = `
            <div class="skill-section">
                <h4 class="section-title">Grundegenskap:</h4>
                <div class="section-content">
                    <span class="skill-ability-tooltip">(${skill.baseAbility})</span>
                </div>
            </div>
            <div class="skill-section">
                <h4 class="section-title">Beskrivning:</h4>
                <div class="section-content">${skill.description}</div>
            </div>
            <div class="skill-section">
                <h4 class="section-title">Bonuseffekter:</h4>
                <div class="section-content">${skill.bonusEffects}</div>
            </div>
            ${skill.examples ? `
            <div class="skill-section">
                <h4 class="section-title">Exempel:</h4>
                <div class="section-content">${skill.examples}</div>
            </div>
            ` : ''}
        `;
        openInfoModal(skill.name, content, 'skill');
    }

    function handleSkillChange(skillIndex: number, value: number) {
        characterActions.setSkillValue(skillIndex, value);
    }
    
    function handleOptionalSkillChange(skillId: string, value: number) {
        characterActions.setOptionalSkillValue(skillId, value);
    }

    // Function to roll dice for a regular skill
    function rollForSkill(skillIndex: number) {
        const skill = sheetState.skills[skillIndex];
        if (!skill) return;

        // Find the corresponding base ability
        const baseAbility = sheetState.baseAbilities.find(ability => ability.type === skill.baseAbility);
        if (!baseAbility) return;

        characterActions.openSkillRollModal(
            skill.name,
            skill.value,
            baseAbility.label,
            baseAbility.type,
            baseAbility.value,
            baseAbility.damage
        );
    }

    // Function to roll dice for an optional skill
    function rollForOptionalSkill(skillId: string) {
        const skill = sheetState.optionalSkills.find(s => s.id === skillId);
        if (!skill) return;

        // Find the corresponding base ability
        const baseAbility = sheetState.baseAbilities.find(ability => ability.type === skill.baseAbility);
        if (!baseAbility) return;

        characterActions.openSkillRollModal(
            skill.name,
            skill.value,
            baseAbility.label,
            baseAbility.type,
            baseAbility.value,
            baseAbility.damage
            
        );
    }
    $effect(() => {
        // Update min size when skills change
        sheetState.skills.length;
        sheetState.optionalSkills.length;
        skillsMinSize = { width: 300, height: (35 + sheetState.skills.length * 35 + sheetState.optionalSkills.length * 35) || 300 };
        
    });

    // Calculate min size based on the number of skills
    let skillsMinSize = $state({ // TODO: This isn't reactive, needs to be updated on skill changes
        width: 300,
        height: (35 + sheetState.skills.length * 35 + sheetState.optionalSkills.length * 35) || 300
    });


</script>

    <!-- Core Skills -->
    <PaperCard
            paperId="skills-core"

            draggable={true}
            resizable={false}
            initialPosition={startPosition}
            initialSize={skillsMinSize}
            minSize={skillsMinSize}
            class="p-2 pt-3"
        >

    {#snippet header()}
    <span>Färdigheter</span>
        <button 
            class="add-item-button"
            onclick={() => openDialogueOption('optionalSkills')}
            aria-label="Lägg till ny relation"
            title="Lägg till ny relation"
        >
            <PlusCircle size={16} />
        </button>
    {/snippet}
        {#snippet content()}
    {#each sheetState.skills as skill, index}
        {@const BaseAbilityIcon = getIconForAbility(skill.baseAbility as any) }
                <div class="skill-content">
                    <Tooltip
                        open={tooltipStates[`skill-${index}`] || false}
                        onOpenChange={(e) => (tooltipStates[`skill-${index}`] = e.open)}
                        positioning={{ placement: 'top' }}
                        contentBase="card preset-filled p-4 z-1001"
                        openDelay={200}
                        arrow
                    >
                        {#snippet trigger()}<BaseAbilityIcon size={16} />{/snippet}
                        {#snippet content()}
                            <div class="torn-paper-wrapper tooltip-wrapper">
                                <div class="torn-paper-content tooltip max-w-100 justify-center align-center">
                            
                                <strong>{skill.baseAbility}</strong>
                                <div class="tooltip-description">Grundegenskap för {skill.name}</div>
                                </div>
                            </div>
                        {/snippet}
                    </Tooltip>
                    <span class="skill-name">{skill.name}</span>
                    <div class="skill-controls-right">
                        <button 
                            class="info-icon-button"
                            onclick={() => showSkillInfo(skill)}
                            aria-label="Information om {skill.name}"
                            title="Visa information om {skill.name}"
                        >
                            <Info size={16} />
                        </button>
                        {#if diceStates.isDicePluginAvailable}
                        <button 
                            class="dice-roll-button"
                            onclick={() => rollForSkill(index)}
                            aria-label="Slå tärning för {skill.name}"
                            title="Slå tärning för {skill.name}"
                        >
                            <Dices />
                        </button>
                        {/if}
                            <ChevronInput
                                value={skill.value || 0}
                                min={0}
                                max={5}
                                name={skill.name}
                                ariaLabel={skill.name}
                                onValueChange={(value) => handleSkillChange(index, value)}
                            />

                    </div>
                </div>
    {/each}
        {#each sheetState.optionalSkills as skill, index}
        {@const BaseAbilityIcon = getIconForAbility(skill.baseAbility)}

                <div class="skill-content optional-skill">
                    <Tooltip
                        open={tooltipStates[`optional-skill-${skill.id}`] || false}
                        onOpenChange={(e) => (tooltipStates[`optional-skill-${skill.id}`] = e.open)}
                        positioning={{ placement: 'top' }}
                        triggerBase="underline"
                        contentBase="card preset-filled p-4 z-1000"
                        openDelay={200}
                        arrow
                    >
                        {#snippet trigger()}<BaseAbilityIcon size={16} />{/snippet}
                        {#snippet content()}
                            <div class="torn-paper-wrapper tooltip-wrapper">
                                <div class="torn-paper-content tooltip max-w-100 justify-center align-center">
                            
                                <strong>{skill.baseAbility}</strong>
                                <div class="tooltip-description">Grundegenskap för {skill.name}</div>
                                </div>
                            </div>
                        {/snippet}
                    </Tooltip>
                    <span class="skill-name">{skill.name}</span>
                    <div class="skill-controls-right">
                        <button
                            class="remove-button"
                            onclick={() => { confirmState.confirmationOpen = true; confirmState.skillNameToDelete = skill.name }}
                            aria-label="Ta bort {skill.name}"
                        >
                            <CircleX size={16} />
                        </button>
                        <button 
                            class="info-icon-button"
                            onclick={() => showSkillInfo(skill)}
                            aria-label="Information om {skill.name}"
                            title="Visa information om {skill.name}"
                        >
                            <Info size={16} />
                        </button>
                        {#if diceStates.isDicePluginAvailable}
                        <button 
                            class="dice-roll-button"
                            onclick={() => rollForOptionalSkill(skill.id)}
                            aria-label="Slå tärning för {skill.name}"
                            title="Slå tärning för {skill.name}"
                        >
                            <Dices />
                        </button>
                        {/if}
                        <ChevronInput
                                value={skill.value || 0}
                                min={0}
                                max={5}
                                name={skill.name}
                                ariaLabel={skill.name}
                                onValueChange={(value) => handleOptionalSkillChange(skill.id, value)}
                            />

                    </div>
                </div>

    {/each}
            {/snippet}

    </PaperCard>

<!-- Confirmation Modal -->
<ConfirmationModal 
    bind:open={confirmState.confirmationOpen}
    title="Ta bort färdighet"
    message={`Är du säker på att du vill ta bort färdigheten "${confirmState.skillNameToDelete}"?`}
    confirmText="Ta bort"
    cancelText="Avbryt"
    onConfirm={() => {
        characterActions.removeOptionalSkill(confirmState.skillNameToDelete);
        confirmState.confirmationOpen = false;
    }}
    onCancel={() => {
        confirmState.confirmationOpen = false;
        confirmState.skillNameToDelete = '';
    }}
/>

<style>

    .skill-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem;
        min-height: 2rem;
    }

    .skill-controls-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
    }

    .skill-name {
        font-weight: bold;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
        margin-left: 0.25rem;
        margin-right: 0.25rem;
    }

    :global(.dark) .skill-name {
        color: var(--color-surface-100);
    }


    .skill-input {
        width: 3rem;
        height: 1rem;
        text-align: center;
        font-weight: bold;
        font-size: 1rem;
        flex-shrink: 0;
        border-radius: 4px;
        background: transparent;
        color: var(--color-surface-900);
    }

    :global(.dark) .skill-input {
        color: var(--color-surface-100);
    }

    .skill-input:focus {
        outline: none;
    }


    /* Modal content styling */
    .skill-section {
        margin-bottom: 1rem;
    }

    .skill-section:last-child {
        margin-bottom: 0;
    }

    .section-title {
        font-weight: bold;
        font-size: 0.9rem;
        color: var(--color-surface-800);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :global(.dark) .section-title {
        color: var(--color-surface-200);
    }

    .section-content {
        font-size: 0.9rem;
        color: var(--color-surface-900);
    }

    :global(.dark) .section-content {
        color: var(--color-surface-100);
    }

    .section-content :global(strong) {
        font-weight: 600;
        color: var(--color-primary-600);
    }

    .section-content :global(ul) {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    .section-content :global(li) {
        margin: 0.25rem 0;
        color: inherit;
    }

    .section-content :global(p) {
        margin: 0.5rem 0;
        color: inherit;
    }

    .skill-ability-tooltip {
        font-weight: bold;
        color: var(--color-primary-600);
        background: rgba(217, 119, 6, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.9rem;
        display: inline-block;
    }

    :global(.dark) .skill-ability-tooltip {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }
</style>
