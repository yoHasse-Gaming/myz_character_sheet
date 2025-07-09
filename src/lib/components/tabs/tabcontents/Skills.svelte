<script lang="ts">
    import { onMount } from 'svelte';
    import { generateUniqueVariants } from '../../../utils/styleUtils';
    import { sheetState, characterActions, openDialogueOption, openInfoModal } from '../../../states/character_sheet.svelte'

    // Generate unique variants for skill items to make them look different
    const skillVariants = generateUniqueVariants(sheetState.skills.length + sheetState.optionalSkills.length);

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

</script>

<div class="skills-tab">
    <!-- Add Optional Skills Button -->


    <!-- Core Skills -->
    {#each sheetState.skills as skill, index}
        <div class="skill-item-wrapper">
            <div class="torn-input-wrapper {skillVariants[index]}">
                <div class="skill-item-content">
                    <div class="skill-controls">
                        <span class="skill-name">{skill.name}</span>
                        <div class="skill-controls-right">
                            <button 
                                class="info-icon-button"
                                onclick={() => showSkillInfo(skill)}
                                aria-label="Information om {skill.name}"
                                title="Visa information om {skill.name}"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9,9h6v6H9z"></path>
                                    <path d="M9,9h6"></path>
                                </svg>
                            </button>
                            <input
                                id="skill-{index}"
                                name={skill.name}
                                type="number"
                                min="0"
                                max="5"
                                class="torn-input skill-input font-user"
                                value={skill.value}
                                oninput={(e) => handleSkillChange(index, parseInt((e.target as HTMLInputElement)?.value) || 0)}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}

    <!-- Optional Skills -->
    {#each sheetState.optionalSkills as skill, index}
        {@const skillIndex = sheetState.skills.length + index}
        <div class="skill-item-wrapper optional-skill">
            <div class="torn-input-wrapper {skillVariants[skillIndex]} optional-skill-wrapper">
                <div class="skill-item-content">
                    <div class="skill-controls">
                        <span class="skill-name">{skill.name}</span>
                        <div class="skill-controls-right">
                            <button 
                                class="info-icon-button"
                                onclick={() => showSkillInfo(skill)}
                                aria-label="Information om {skill.name}"
                                title="Visa information om {skill.name}"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9,9h6v6H9z"></path>
                                    <path d="M9,9h6"></path>
                                </svg>
                            </button>
                            <input
                                id="optional-skill-{skill.id}"
                                name={skill.name}
                                type="number"
                                min="0"
                                max="5"
                                class="torn-input skill-input font-user"
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
                </div>
            </div>
        </div>
    {/each}

    <div class="optional-skills-section">
        <button 
            class="add-optional-skills-button"
            onclick={() => openDialogueOption('optionalSkills')}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Lägg till valfria färdigheter
        </button>
        {#if sheetState.optionalSkills.length > 0}
            <span class="optional-skills-count">
                {sheetState.optionalSkills.length} valfria färdigheter
            </span>
        {/if}
    </div>
</div>

<!-- Optional Skills Modal -->
<!-- Remove the modal from here since it's now in the layout -->
<!-- <OptionalSkillsModal bind:isOpen={isOptionalSkillsModalOpen} /> -->

<style>
    /* Skills container - responsive grid */
    .skills-tab {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
        width: 100%;
        container-type: inline-size;
    }

    /* Optional skills section */
    .optional-skills-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        grid-column: 1 / -1;
        margin-bottom: 0.5rem;
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.5rem;
        border: 1px dashed rgba(217, 119, 6, 0.3);
    }

    .add-optional-skills-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: transparent;
        border: 2px solid var(--color-primary-600);
        color: var(--color-primary-600);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.9rem;
    }

    .add-optional-skills-button:hover {
        background: var(--color-primary-600);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }

    .optional-skills-count {
        font-size: 0.9rem;
        color: var(--color-surface-700);
        font-weight: 600;
    }

    :global(.dark) .optional-skills-count {
        color: var(--color-surface-300);
    }

    :global(.dark) .optional-skills-section {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.4);
    }

    /* Responsive breakpoints using container queries */
    @container (min-width: 500px) {
        .skills-tab {
            /* grid-template-columns: repeat(2, 1fr); */
            gap: 1rem;
        }
    }

    @container (min-width: 800px) {
        .skills-tab {
            /* grid-template-columns: repeat(3, 1fr); */
        }
    }

    /* Individual skill item wrapper */
    .skill-item-wrapper {
        margin-bottom: 0.5rem;
        width: 100%;
        min-width: 0; /* Allow flex items to shrink */
    }

    /* Content inside torn paper wrapper */
    .skill-item-content {
        padding: 0.2rem;
        padding-left: 1rem;
        position: relative;
        z-index: 2;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .skill-item-content:hover {
        background: rgba(217, 119, 6, 0.05);
    }

    @container (min-width: 400px) {
        .skill-item-content {
            /* padding: 1rem 1.5rem; */
        }

        .skill-item-wrapper {
            margin-bottom: 1rem;
        }
    }

    /* Skill controls - now single row with name and input */
    .skill-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.5rem;
    }

    .skill-controls-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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

    .skill-name {
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
        min-width: 0;
    }

    @container (min-width: 400px) {
        .skill-name {
            font-size: 1.1rem;
        }
    }

    .skill-ability {
        /* Removed - now shown in tooltip instead */
    }

    /* Info button styling - removed since we hover the whole area now */
    .info-icon {
        /* Removed - entire skill area is now hoverable */
    }

    /* Skill input styling */
    .skill-input {
        width: 3rem;
        text-align: center;
        font-weight: bold;
        font-size: 1rem;
        flex-shrink: 0;
        padding-left: unset;
        max-height: 2rem; /* Limit height for controls */


    }

    @container (min-width: 400px) {
        .skill-input {
            width: 4rem;
            font-size: 1.2rem;
        }
    }



    .skill-title {
        font-family: var(--form-labels), serif;
        font-weight: bold;
        font-size: 1.25rem;
        color: var(--color-primary-900);
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

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
    /* HTML content styling */
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

    /* Dark mode adjustments */
    :global(.dark) .skill-name {
        color: var(--color-surface-100);
    }

    :global(.dark) .skill-item-content:hover {
        background: rgba(217, 119, 6, 0.1);
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

    /* Skill ability tooltip styling */
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