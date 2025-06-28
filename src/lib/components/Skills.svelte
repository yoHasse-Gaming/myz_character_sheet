
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

    let openSkillIndex = $state<number | null>(null);
    let elemArrow: HTMLElement | null = $state(null);

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
    const skillVariants = generateUniqueVariants(sheetState.skills.length);

    function handleSkillChange(skillIndex: number, value: number) {
        characterActions.setSkillValue(skillIndex, value);
    }

</script>

<div class="skills-tab space-y-4">
    {#each sheetState.skills as skill, index}
        {@const { floating, interactions } = createFloatingForSkill(index)}
        <div class="skill-item-wrapper">
            <div class="torn-input-wrapper {skillVariants[index]}">
                <div class="skill-item-content">
                    <div class="skill-info">
                        <span class="skill-name">{skill.name}</span>
                        <span class="skill-ability">({skill.baseAbility})</span>
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
                    <input 
                        id="skill-{index}"
                        name={skill.name} 
                        type="number" 
                        min="0" 
                        max="5"
                        class="torn-input skill-input font-user" 
                        value={skill.value} 
                        oninput={(e) => handleSkillChange(index, parseInt(e.target.value) || 0)}
                        placeholder="0"
                    />
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
                        <h3 class="skill-title">☢️ {skill.name}</h3>
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

<style>
    /* Skills container */
    .skills-tab {
        padding: 1rem;
    }

    /* Individual skill item wrapper */
    .skill-item-wrapper {
        margin-bottom: 1rem;
    }

    /* Content inside torn paper wrapper */
    .skill-item-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        position: relative;
        z-index: 2;
    }

    /* Skill info section */
    .skill-info {
        display: flex;
        align-items: center;
        flex-grow: 1;
        gap: 0.5rem;
    }

    .skill-name {
        font-family: var(--form-labels), serif;
        font-weight: bold;
        font-size: 1.1rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
    }

    .skill-ability {
        

        font-weight: bold;
        color: var(--color-primary-600);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
    }

    /* Info button styling */
    .info-icon {
        padding: 0.5rem;
        border-radius: 50%;
        background: rgba(217, 119, 6, 0.1);
        border: 1px solid rgba(217, 119, 6, 0.3);
        color: var(--color-primary-600);
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: auto;
        margin-right: 1rem;
    }

    .info-icon:hover {
        background: rgba(217, 119, 6, 0.2);
        border-color: var(--color-primary-600);
        transform: scale(1.1);
    }

    /* Skill input styling */
    .skill-input {
        width: 4rem;
        text-align: center;
        font-weight: bold;
        font-size: 1.2rem;
    }

    /* Floating tooltip */
    .floating-tooltip {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
        max-width: 380px;
    }

    .tooltip-wrapper {
        position: relative;
        border-radius: 0.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .tooltip-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('/img/card_bg.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        filter: url(#squiggle);
        border-radius: 0.5rem;
        z-index: 1;
    }

    .tooltip-content {
        position: relative;
        z-index: 2;
        background: rgba(245, 245, 245, 0.95);
        padding: 1.5rem;
        border-radius: 0.5rem;
        line-height: 1.5;
    }

    .dark .tooltip-content {
        background: rgba(26, 26, 26, 0.95);
        color: var(--color-surface-100);
    }

    .skill-title {
        font-family: var(--form-labels), serif;
        font-weight: bold;
        font-size: 1.25rem;
        color: var(--color-primary-600);
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
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: 0.9rem;
        color: var(--color-surface-800);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .dark .section-title {
        color: var(--color-surface-200);
    }

    .section-content {
        font-size: 0.9rem;
        color: var(--color-surface-700);
        font-family: var(--font-user), sans-serif;
    }

    .dark .section-content {
        color: var(--color-surface-300);
    }

    /* HTML content styling */
    .section-content :global(strong) {
        font-weight: 600;
        color: var(--color-primary-600);
    }

    .dark .section-content :global(strong) {
        color: var(--color-primary-400);
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