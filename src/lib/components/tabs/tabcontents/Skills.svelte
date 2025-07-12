<script lang="ts">
    import { onMount } from 'svelte';
    import interact from 'interactjs';
    import { generateUniqueVariants } from '../../../utils/styleUtils';
    import { sheetState, characterActions, openDialogueOption, openInfoModal } from '../../../states/character_sheet.svelte';
    import DraggableAddItem from '../../DraggableAddItem.svelte';
    import DropZone from '../../DropZone.svelte';

    // Generate unique variants for skill items to make them look different
    const skillVariants = generateUniqueVariants(sheetState.skills.length + sheetState.optionalSkills.length);

    // Throttle function to reduce state update frequency
    function throttle(func: Function, delay: number) {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let lastExecTime = 0;
        return (...args: any[]) => {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func(...args);
                lastExecTime = currentTime;
            } else {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func(...args);
                    lastExecTime = Date.now();
                }, delay);
            }
        };
    }

    // Throttled save function for better performance
    const throttledSaveLayout = throttle((tabName: string, paperId: string, layout: any) => {
        characterActions.savePaperLayout(tabName as 'characterTab' | 'skillsTab', paperId, layout);
    }, 100); // Save at most every 100ms

    // Function to calculate minimum height based on content
    function getMinHeightForContent(element: HTMLElement): number {
        // For skills, we mainly need to ensure all controls are visible
        const header = element.querySelector('.skill-header');
        const content = element.querySelector('.skill-item-content');
        
        if (!content) return 100; // Fallback minimum
        
        // Calculate the natural height of the content
        const headerHeight = header ? (header as HTMLElement).offsetHeight : 35;
        const controls = content.querySelector('.skill-controls');
        const controlsHeight = controls ? (controls as HTMLElement).offsetHeight : 60; // Typical height for skill controls
        
        // Add padding and margins
        const contentPadding = 32; // 1rem top + 1rem bottom  
        const minHeight = headerHeight + controlsHeight + contentPadding + 15; // +15 for margin
        
        return Math.max(100, minHeight); // Never smaller than default minimum
    }

    // Function to generate initial positions for skills
    function getInitialPosition(index: number) {
        const cols = 3;
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col * 280 + 20;
        const y = row * 180 + 80;
        return { x, y };
    }

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
                    const savedLayout = characterActions.getPaperLayout('skillsTab', paperId);
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
        
        interact('.skill-paper')
            .draggable({
                allowFrom: '.skill-header', // Only allow dragging from the header
                listeners: {
                    start: (event) => {
                        console.log('Drag started on:', event.target);
                        event.target.style.zIndex = '1000';
                    },
                    move: (event) => {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x.toString());
                        target.setAttribute('data-y', y.toString());
                        
                        // Use throttled save for better performance
                        const paperId = target.getAttribute('data-paper-id');
                        if (paperId) {
                            throttledSaveLayout('skillsTab', paperId, { x, y });
                        }
                    },
                    end: (event) => {
                        event.target.style.zIndex = '';
                        
                        // Final save when drag ends
                        const target = event.target;
                        const paperId = target.getAttribute('data-paper-id');
                        if (paperId) {
                            const x = parseFloat(target.getAttribute('data-x')) || 0;
                            const y = parseFloat(target.getAttribute('data-y')) || 0;
                            const currentLayout = characterActions.getPaperLayout('skillsTab', paperId) || {};
                            characterActions.savePaperLayout('skillsTab', paperId, {
                                ...currentLayout,
                                x,
                                y
                            });
                        }
                    }
                },
                modifiers: [
                    // Restrict dragging to within the tab-content container
                    interact.modifiers.restrictRect({
                        restriction: '.tab-content',
                        endOnly: true
                    })
                ]
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    start: (event) => {
                        console.log('Resize started on:', event.target);
                        event.target.style.zIndex = '1000';
                    },
                    move: (event) => {
                        const target = event.target;
                        let x = (parseFloat(target.getAttribute('data-x')) || 0);
                        let y = (parseFloat(target.getAttribute('data-y')) || 0);

                        // Calculate minimum height based on content
                        const minHeight = getMinHeightForContent(target);
                        
                        // Ensure height doesn't go below minimum
                        const newHeight = Math.max(event.rect.height, minHeight);

                        // Update the element's style
                        target.style.width = event.rect.width + 'px';
                        target.style.height = newHeight + 'px';

                        // Translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x.toString());
                        target.setAttribute('data-y', y.toString());
                        
                        // Use throttled save for better performance
                        const paperId = target.getAttribute('data-paper-id');
                        if (paperId) {
                            throttledSaveLayout('skillsTab', paperId, {
                                x,
                                y,
                                width: event.rect.width,
                                height: newHeight
                            });
                        }
                    },
                    end: (event) => {
                        event.target.style.zIndex = '';
                        
                        // Final save when resize ends
                        const target = event.target;
                        const paperId = target.getAttribute('data-paper-id');
                        if (paperId) {
                            const x = parseFloat(target.getAttribute('data-x')) || 0;
                            const y = parseFloat(target.getAttribute('data-y')) || 0;
                            const width = parseFloat(target.style.width) || 0;
                            const height = parseFloat(target.style.height) || 0;
                            characterActions.savePaperLayout('skillsTab', paperId, {
                                x,
                                y,
                                width,
                                height
                            });
                        }
                    }
                },
                modifiers: [
                    // Static minimum size constraints
                    interact.modifiers.restrictSize({
                        min: { width: 200, height: 100 }
                    })
                ]
            });
    });

    function resetSkillsLayout() {
        // Clear saved layouts
        characterActions.clearPaperLayouts('skillsTab');
        
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

</script>

<div class="skills-tab">
    <!-- Draggable Add Item -->
    <DraggableAddItem 
        text="Dra för färdigheter"
        ariaLabel="Dra för att lägga till valfria färdigheter"
        variant="variant-5"
    />

    <!-- Skills Drop Zone Container -->
    <DropZone 
        dragOverText="Släpp för att lägga till valfria färdigheter"
        onDrop={() => openDialogueOption('optionalSkills')}
    >
        {#snippet children()}
            <!-- Control Buttons Section -->
            <div class="skills-controls-section">
                <!-- Optional Skills Info -->
                <div class="optional-skills-info">
                    {#if sheetState.optionalSkills.length > 0}
                        <p class="optional-skills-description">
                            Du har {sheetState.optionalSkills.length} valfria färdigheter. 
                            Dra papperet för att lägga till fler.
                        </p>
                    {:else}
                        <p class="optional-skills-description">
                            Inga valfria färdigheter valda. Dra papperet hit för att lägga till färdigheter.
                        </p>
                    {/if}
                </div>

                <!-- Reset Layout Button -->
                <div class="reset-layout-container">
                    <button 
                        class="reset-layout-button"
                        onclick={resetSkillsLayout}
                        title="Återställ alla färdighetspapper till standardpositioner"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                        </svg>
                        Återställ layout
                    </button>
                </div>
            </div>

    <!-- Core Skills -->
    {#each sheetState.skills as skill, index}
        {@const position = getInitialPosition(index)}
        <div class="skill-item-wrapper" style="top: {position.y}px; left: {position.x}px;">
            <div class="torn-input-wrapper {skillVariants[index]} skill-paper" data-x="0" data-y="0" data-paper-id="skill-{index}">
                <div class="skill-item-content">
                    <div class="skill-header">
                        <span class="skill-name">{skill.name}</span>
                    </div>
                    <div class="skill-controls">
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
        {@const position = getInitialPosition(skillIndex)}
        <div class="skill-item-wrapper optional-skill" style="top: {position.y}px; left: {position.x}px;">
            <div class="torn-input-wrapper {skillVariants[skillIndex]} optional-skill-wrapper skill-paper" data-x="0" data-y="0" data-paper-id="optional-skill-{skill.id}">
                <div class="skill-item-content">
                    <div class="skill-header">
                        <span class="skill-name">{skill.name}</span>
                    </div>
                    <div class="skill-controls">
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
        {/snippet}
    </DropZone>
</div>

<!-- Optional Skills Modal -->
<!-- Remove the modal from here since it's now in the layout -->
<!-- <OptionalSkillsModal bind:isOpen={isOptionalSkillsModalOpen} /> -->

<style>
    /* Skills container - responsive grid */
    .skills-tab {
        display: block;
        width: 100%;
        min-height: 100vh;
        position: relative;
        padding: 1rem;
        overflow: visible; /* Allow papers to move freely */
    }

    /* Individual skill item wrapper */
    .skill-item-wrapper {
        margin-bottom: 0.5rem;
        width: fit-content;
        min-width: 250px;
        max-width: 400px;
        position: absolute; /* Changed to absolute for free positioning */
    }


    /* Remove duplicate styles - now using shared .paper-header, .paper-label, .paper-drag-handle classes */

    /* Skill controls - now just the input and info button */
    .skill-controls {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        gap: 0.5rem;
    }

    .skill-controls-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* Skills controls section */
    .skills-controls-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        background: rgba(217, 119, 6, 0.05);
        border-radius: 0.5rem;
        border: 1px dashed rgba(217, 119, 6, 0.3);
        backdrop-filter: blur(8px);
        z-index: 10;
        margin-bottom: 2rem;
    }

    :global(.dark) .skills-controls-section {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.4);
    }

    .optional-skills-info {
        flex: 1;
    }

    .optional-skills-description {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-surface-700);
        font-weight: 500;
        font-style: italic;
    }

    :global(.dark) .optional-skills-description {
        color: var(--color-surface-300);
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

    /* Remove duplicate styles - now using shared .paper-label classes */

    /* Skill input styling */
    .skill-input {
        width: 4rem;
        text-align: center;
        font-weight: bold;
        font-size: 1.2rem;
        flex-shrink: 0;
        padding-left: unset;
        max-height: 2rem;
    }

    /* Dark mode adjustments */


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

    /* Skills controls section */
    .skills-controls-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
        position: relative;
        z-index: 100;
    }

    /* Reset layout button for skills */
    .reset-layout-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, #dc2626, #991b1b);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-family: var(--font-user), sans-serif;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .reset-layout-button:hover {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        transform: translateY(-1px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    }

    .reset-layout-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .reset-layout-button svg {
        flex-shrink: 0;
    }

    /* Skills-specific paper styling */
    .skill-paper {
        cursor: default; /* Default cursor since only header is draggable */
        user-select: none;
        position: relative;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        will-change: transform;
        /* Add hardware acceleration for better performance */
        transform: translateZ(0);
        backface-visibility: hidden;
        min-width: 200px;
        min-height: 125px;
        /* Add a subtle border that becomes visible on hover to indicate resize areas */
        border: 3px solid transparent;
        border-radius: 4px;
    }

    .skill-paper:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        z-index: 10;
    }

    .skill-paper:active,
    .skill-paper.dragging,
    .skill-paper.resizing {
        z-index: 20;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
    }

    /* Skills content styling */
    .skill-item-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
        pointer-events: auto;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    /* Skills header styling */
    .skill-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding: 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        cursor: move; /* Make it clear this is the draggable area */
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px 4px 0 0;
        transition: background-color 0.2s ease;
        flex-shrink: 0; /* Don't shrink the header */
        /* Improve drag performance */
        transform: translateZ(0);
        backface-visibility: hidden;
    }

    :global(.dark) .skill-header {
        border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .skill-name {
        pointer-events: none;
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 1.1rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
    }

    :global(.dark) .skill-name {
        color: var(--color-surface-100);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .skills-controls-section {
            flex-direction: column;
            align-items: stretch;
        }
        
        .reset-layout-container {
            order: -1; /* Show reset button first on mobile */
        }

        .skill-paper {
            min-width: 180px;
        }
    }


</style>