
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
    import { fade } from "svelte/transition";
    import { useHover } from '@skeletonlabs/floating-ui-svelte';
    import { generateUniqueVariants } from '$lib';
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
    import OptionalSkillsModal from './OptionalSkillsModal.svelte';

    let openSkillIndex = $state<number | null>(null);
    let elemArrow: HTMLElement | null = $state(null);
    let isOptionalSkillsModalOpen = $state(false);

    // Create floating instance for each skill
    function createFloatingForSkill(skillIndex: number) {
        const isOpen = () => openSkillIndex === skillIndex;

        const floating = useFloating({
            whileElementsMounted: autoUpdate,
            get open() {
                return isOpen();
            },
            onOpenChange: (v) => {
                openSkillIndex = v ? skillIndex : null;
            },
            placement: "top",
            get middleware() {
                return [offset(10), flip(), shift({ padding: 8 }), elemArrow && arrow({ element: elemArrow })];
            },
        });

        const hover = useHover(floating.context, {
            delay: { open: 300, close: 100 }
        });
        const dismiss = useDismiss(floating.context);
        const role = useRole(floating.context, { role: "tooltip" });
        const interactions = useInteractions([hover, dismiss, role]);

        return { floating, interactions };
    }

    // Generate unique variants for skill items to make them look different
    const skillVariants = generateUniqueVariants(sheetState.skills.length + sheetState.optionalSkills.length);

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
    <div class="optional-skills-section">
        <button 
            class="add-optional-skills-button"
            onclick={() => isOptionalSkillsModalOpen = true}
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

    <!-- Core Skills -->
    {#each sheetState.skills as skill, index}
        {@const { floating, interactions } = createFloatingForSkill(index)}
        <div class="skill-item-wrapper">
            <div class="torn-input-wrapper {skillVariants[index]}">
                <div class="skill-item-content">
                    <div class="skill-header">
                        <span class="skill-name">{skill.name}</span>
                        <button
                            class="info-icon"
                            bind:this={floating.elements.reference}
                            {...interactions.getReferenceProps()}
                            aria-label="Visa färdighetsinformation för {skill.name}"
                        >
                        <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,13,14"></path>
                                <circle cx="12" cy="17" r=".5"></circle>
                            </svg>
                        </button>
                    </div>
                    <div class="skill-controls">
                        <span class="skill-ability">({skill.baseAbility})</span>
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

        {#if openSkillIndex === index}
            <div
                bind:this={floating.elements.floating}
                style={floating.floatingStyles}
                class="floating-tooltip"
                {...interactions.getFloatingProps()}
                transition:fade={{ duration: 150 }}
            >
                <div class="tooltip-wrapper">
                    <!-- Background element with the torn paper effect -->
                    <div class="tooltip-background"></div>
                    <!-- Content element without the effect -->
                    <div class="tooltip-content">
                        <h3 class="skill-title">({skill.name})</h3>
                        <div class="skill-section">
                            <h4 class="section-title">Beskrivning:</h4>
                            <div class="section-content">{@html skill.description}</div>
                        </div>
                        <div class="skill-section">
                            <h4 class="section-title">Bonuseffekter:</h4>
                            <div class="section-content">{@html skill.bonusEffects}</div>
                        </div>
                        {#if skill.examples}
                            <div class="skill-section">
                                <h4 class="section-title">Exempel:</h4>
                                <div class="section-content">{@html skill.examples}</div>
                            </div>
                        {/if}
                    </div>
                </div>
                <FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-700 dark:fill-surface-300" />
            </div>
        {/if}
    {/each}

    <!-- Optional Skills -->
    {#each sheetState.optionalSkills as skill, index}
        {@const skillIndex = sheetState.skills.length + index}
        {@const { floating, interactions } = createFloatingForSkill(skillIndex)}
        <div class="skill-item-wrapper optional-skill">
            <div class="torn-input-wrapper {skillVariants[skillIndex]} optional-skill-wrapper">
                <div class="skill-item-content">
                    <div class="skill-header">
                        <span class="skill-name">{skill.name}</span>
                        <div class="skill-header-controls">
                            <button
                                class="info-icon"
                                bind:this={floating.elements.reference}
                                {...interactions.getReferenceProps()}
                                aria-label="Visa färdighetsinformation för {skill.name}"
                            >
                            <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,13,14"></path>
                                    <circle cx="12" cy="17" r=".5"></circle>
                                </svg>
                            </button>
                            <button
                                class="remove-skill-button"
                                onclick={() => removeOptionalSkill(skill.id)}
                                aria-label="Ta bort {skill.name}"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="skill-controls">
                        <span class="skill-ability">({skill.baseAbility})</span>
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
                    </div>
                </div>
            </div>
        </div>

        {#if openSkillIndex === skillIndex}
            <div
                bind:this={floating.elements.floating}
                style={floating.floatingStyles}
                class="floating-tooltip"
                {...interactions.getFloatingProps()}
                transition:fade={{ duration: 150 }}
            >
                <div class="tooltip-wrapper">
                    <!-- Background element with the torn paper effect -->
                    <div class="tooltip-background"></div>
                    <!-- Content element without the effect -->
                    <div class="tooltip-content">
                        <h3 class="skill-title">({skill.name})</h3>
                        <div class="skill-section">
                            <h4 class="section-title">Kategori:</h4>
                            <div class="section-content">{skill.category}</div>
                        </div>
                        <div class="skill-section">
                            <h4 class="section-title">Beskrivning:</h4>
                            <div class="section-content">{@html skill.description}</div>
                        </div>
                        <div class="skill-section">
                            <h4 class="section-title">Bonuseffekter:</h4>
                            <div class="section-content">{@html skill.bonusEffects}</div>
                        </div>
                        {#if skill.examples}
                            <div class="skill-section">
                                <h4 class="section-title">Exempel:</h4>
                                <div class="section-content">{@html skill.examples}</div>
                            </div>
                        {/if}
                    </div>
                </div>
                <FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-700 dark:fill-surface-300" />
            </div>
        {/if}
    {/each}
</div>

<!-- Optional Skills Modal -->
<OptionalSkillsModal bind:isOpen={isOptionalSkillsModalOpen} />

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
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
    }

    @container (min-width: 800px) {
        .skills-tab {
            grid-template-columns: repeat(3, 1fr);
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
        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        position: relative;
        z-index: 2;
        gap: 0.5rem;
    }

    @container (min-width: 400px) {
        .skill-item-content {
            /* padding: 1rem 1.5rem; */
            gap: 0.75rem;
        }

        .skill-item-wrapper {
            margin-bottom: 1rem;
        }
    }

    /* Skill header with name and info button */
    .skill-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .skill-header-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* Optional skill styling */
    .optional-skill-wrapper {
        border: 2px solid rgba(217, 119, 6, 0.4);
        position: relative;
    }

    .optional-skill-wrapper::before {
        content: 'VALFRI';
        position: absolute;
        top: -0.5rem;
        right: 0.5rem;
        background: var(--color-primary-600);
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.6rem;
        font-weight: bold;
        letter-spacing: 0.1em;
        z-index: 10;
    }

    .remove-skill-button {
        padding: 0.25rem;
        border-radius: 50%;
        border: 1px solid var(--color-error-500);
        background: transparent;
        color: var(--color-error-600);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .remove-skill-button:hover {
        background: var(--color-error-600);
        color: white;
        transform: scale(1.1);
    }

    /* Skill controls with ability and input */
    .skill-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.5rem;
        max-height: 2rem; /* Limit height for controls */
    }

    .skill-name {
        font-family: var(--form-labels), serif;
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
        font-weight: bold;
        color: var(--color-primary-600);
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-size: 0.7rem;
        white-space: nowrap;
        flex-shrink: 0; /* Don't shrink the ability badge */
    }

    @container (min-width: 400px) {
        .skill-ability {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
        }
    }

    /* Info button styling */
    .info-icon {
        padding: 0.3rem;
        border-radius: 50%;
        /* border: 1px solid rgba(217, 119, 6, 0.3); */
        color: var(--color-surface-900);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    @container (min-width: 400px) {
        .info-icon {
            padding: 0.5rem;
        }
    }

    .info-icon:hover {
        background: rgba(217, 119, 6, 0.2);
        border-color: var(--color-primary-600);
        transform: scale(1.1);
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

    .section-content {
        font-size: 0.9rem;
        color: var(--color-surface-900);
        font-family: var(--font-user), sans-serif;
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
    .dark .skill-name {
        color: var(--color-surface-100);
    }

    .dark .skill-ability {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }

    .dark .info-icon {
        background: rgba(217, 119, 6, 0.2);
        border-color: rgba(217, 119, 6, 0.4);
        color: var(--color-primary-400);
    }

    .dark .info-icon:hover {
        background: rgba(217, 119, 6, 0.3);
        border-color: var(--color-primary-400);
    }
</style>