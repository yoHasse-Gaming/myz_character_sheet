<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../../utils/styleUtils';
    import { sheetState, characterActions } from '../../../states/character_sheet.svelte';
    import DraggableAddItem from '../../DraggableAddItem.svelte';
    import { openInfoModal } from '../../../states/modals.svelte';
    import { initInteractForElement } from '../../../utils/interactjsUtils';
    import { getIconForAbility } from '../../../utils/iconUtils';
    import { Tooltip } from '@skeletonlabs/skeleton-svelte';
    import { Info } from '@lucide/svelte';
    import { diceStates } from '../../../states/dice.svelte';
    import PaperCard from '../../PaperCard.svelte';

    const { startPosition = { x: 1020, y: 20 } }: {
        startPosition?: { x: number, y: number }
    } = $props();

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
        console.log('CharacterActions available:', typeof characterActions, characterActions);
        
        // Initialize InteractJS for draggable and resizable skill papers
        console.log('Initializing InteractJS for skills...');
        const skillElements = document.querySelectorAll('.skill-paper');
        console.log('Found skill papers:', skillElements.length);
        
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

    function resetSkillsLayout() {
        // Clear saved layouts
        characterActions.clearPaperLayouts();
        
        // Reset all skill papers to default positions and sizes
        const skillElements = document.querySelectorAll('.skill-paper');
        skillElements.forEach((element, index) => {
            const htmlElement = element as HTMLElement;
            // Reset transform
            htmlElement.style.transform = '';
            htmlElement.setAttribute('data-x', '0');
            htmlElement.setAttribute('data-y', '0');
            // Reset size
            htmlElement.style.width = '';
            htmlElement.style.height = '';
        });
        
        console.log('Skills layout reset to defaults');
    }

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
    
    function removeOptionalSkill(skillId: string) {
        characterActions.removeOptionalSkill(skillId);
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
            baseAbility.value,
            baseAbility.damage
        );
    }

</script>

    <!-- Core Skills -->
    {#each sheetState.skills as skill, index}
        {@const BaseAbilityIcon = getIconForAbility(skill.baseAbility as any) }
        {@const position = getInitialPosition(index)}
        <PaperCard
            paperId="skill-{index}"

            draggable={true}
            resizable={false}
            initialPosition={position}
            minSize={{ width: 250, height: 60 }}
            variant={skillVariants[index]}
            class="p-2 pt-3"
        >
            {#snippet content()}
                <div class="skill-content">
                    <Tooltip
                        open={tooltipStates[`skill-${index}`] || false}
                        onOpenChange={(e) => (tooltipStates[`skill-${index}`] = e.open)}
                        positioning={{ placement: 'top' }}
                        triggerBase="underline"
                        contentBase="card preset-filled p-4 z-1000"
                        openDelay={200}
                        arrow
                    >
                        {#snippet trigger()}<BaseAbilityIcon size={16} />{/snippet}
                        {#snippet content()}
                            <div class="tooltip-content">
                                <strong>{skill.baseAbility}</strong>
                                <div class="tooltip-description">Grundegenskap för {skill.name}</div>
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="9" cy="9" r="1"></circle>
                                <circle cx="15" cy="15" r="1"></circle>
                            </svg>
                        </button>
                        {/if}
                        <input
                            id="skill-{index}"
                            name={skill.name}
                            type="number"
                            min="0"
                            max="5"
                            class="skill-input font-user"
                            value={skill.value}
                            oninput={(e) => handleSkillChange(index, parseInt((e.target as HTMLInputElement)?.value) || 0)}
                            placeholder="0"
                        />
                    </div>
                </div>
            {/snippet}
        </PaperCard>
    {/each}

    <!-- Optional Skills -->
    {#each sheetState.optionalSkills as skill, index}
        {@const BaseAbilityIcon = getIconForAbility(skill.baseAbility)}
        {@const skillIndex = sheetState.skills.length + index}
        {@const position = getInitialPosition(skillIndex)}
        <PaperCard
            paperId="optional-skill-{skill.id}"

            draggable={true}
            resizable={false}
            initialPosition={position}
            minSize={{ width: 250, height: 60 }}
            variant={skillVariants[skillIndex]}
        >
            {#snippet content()}
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
                            <div class="tooltip-content">
                                <strong>{skill.baseAbility}</strong>
                                <div class="tooltip-description">Grundegenskap för {skill.name}</div>
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
                            onclick={() => rollForOptionalSkill(skill.id)}
                            aria-label="Slå tärning för {skill.name}"
                            title="Slå tärning för {skill.name}"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="9" cy="9" r="1"></circle>
                                <circle cx="15" cy="15" r="1"></circle>
                            </svg>
                        </button>
                        {/if}
                        <input
                            id="optional-skill-{skill.id}"
                            name={skill.name}
                            type="number"
                            min="0"
                            max="5"
                            class="skill-input font-user"
                            value={skill.value}
                            oninput={(e) => handleOptionalSkillChange(skill.id, parseInt((e.target as HTMLInputElement)?.value) || 0)}
                            placeholder="0"
                        />
                        <button
                            class="remove-skill-button"
                            onclick={() => removeOptionalSkill(skill.id)}
                            aria-label="Ta bort {skill.name}"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            {/snippet}
        </PaperCard>
    {/each}

<!-- Optional Skills Modal -->
<!-- Remove the modal from here since it's now in the layout -->
<!-- <OptionalSkillsModal bind:isOpen={isOptionalSkillsModalOpen} /> -->

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

    :global(.dark) .skill-name {
        color: var(--color-surface-100);
    }

    .dice-roll-button {
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

    .dice-roll-button:hover {
        background: rgba(34, 197, 94, 0.1);
        color: var(--color-success-600);
        opacity: 1;
        transform: scale(1.1);
    }

    :global(.dark) .dice-roll-button {
        color: var(--color-surface-400);
    }

    :global(.dark) .dice-roll-button:hover {
        background: rgba(34, 197, 94, 0.2);
        color: var(--color-success-400);
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

    .remove-skill-button {
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

    .remove-skill-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }

    /* Tooltip content styling */
    .tooltip-content {
        text-align: center;
        font-family: var(--font-user), sans-serif;
        background: var(--color-surface-50);
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--color-surface-200);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 120px;
    }

    .tooltip-content strong {
        display: block;
        font-size: 1rem;
        font-weight: bold;
        color: var(--color-primary-600);
        margin-bottom: 0.25rem;
    }

    .tooltip-description {
        font-size: 0.8rem;
        color: var(--color-surface-700);
        font-style: italic;
    }

    :global(.dark) .tooltip-content {
        background: var(--color-surface-800);
        border-color: var(--color-surface-600);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .tooltip-content strong {
        color: var(--color-primary-400);
    }

    :global(.dark) .tooltip-description {
        color: var(--color-surface-300);
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
        font-family: var(--font-user), sans-serif;
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
