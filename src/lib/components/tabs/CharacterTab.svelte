<script lang="ts">
    import { onMount } from 'svelte';
    import interact from 'interactjs';
    import FormSection from '../FormSection.svelte';
    import { generateUniqueVariants } from '../../utils/styleUtils';
    import { characterActions } from '../../states/character_sheet.svelte';

    let formData = {
        name: '',
        job: '',
        appearance: {
            face: '',
            body: '',
            clothes: ''
        }
    };

    // Generate random variants for each input to make them unique
    const [nameVariant, jobVariant, faceVariant, bodyVariant, clothesVariant] = generateUniqueVariants(5);

    onMount(() => {
        // Initialize InteractJS for draggable and resizable character papers
        console.log('Initializing InteractJS for character tab...');
        const characterElements = document.querySelectorAll('.character-paper');
        console.log('Found character papers:', characterElements.length);
        
        // Restore saved positions and sizes
        characterElements.forEach((element, index) => {
            const paperId = element.getAttribute('data-paper-id');
            if (paperId) {
                const savedLayout = characterActions.getPaperLayout('characterTab', paperId);
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
            }
        });
        
        interact('.character-paper')
            .draggable({
                allowFrom: '.paper-header', // Only allow dragging from the header
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
                        
                        // Save position to state
                        const paperId = target.getAttribute('data-paper-id');
                        if (paperId) {
                            const currentLayout = characterActions.getPaperLayout('characterTab', paperId) || {};
                            characterActions.savePaperLayout('characterTab', paperId, {
                                ...currentLayout,
                                x,
                                y
                            });
                        }
                    },
                    end: (event) => {
                        event.target.style.zIndex = '';
                    }
                }
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

                        // Update the element's style
                        target.style.width = event.rect.width + 'px';
                        target.style.height = event.rect.height + 'px';

                        // Translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x.toString());
                        target.setAttribute('data-y', y.toString());
                        
                        // Save layout to state
                        const paperId = target.getAttribute('data-paper-id');
                        if (paperId) {
                            characterActions.savePaperLayout('characterTab', paperId, {
                                x,
                                y,
                                width: event.rect.width,
                                height: event.rect.height
                            });
                        }
                    },
                    end: (event) => {
                        event.target.style.zIndex = '';
                    }
                },
                modifiers: [
                    // Minimum size
                    interact.modifiers.restrictSize({
                        min: { width: 250, height: 120 }
                    })
                ]
            });
    });

    function resetCharacterLayout() {
        // Clear saved layouts
        characterActions.clearPaperLayouts('characterTab');
        
        // Reset all character papers to default positions and sizes
        const characterElements = document.querySelectorAll('.character-paper');
        characterElements.forEach((element) => {
            const htmlElement = element as HTMLElement;
            // Reset transform
            htmlElement.style.transform = '';
            htmlElement.setAttribute('data-x', '0');
            htmlElement.setAttribute('data-y', '0');
            // Reset size
            htmlElement.style.width = '';
            htmlElement.style.height = '';
        });
        
        console.log('Character layout reset to defaults');
    }

</script>




<div class="character-tab">
    <!-- Reset Layout Button -->
    <div class="reset-layout-container">
        <button 
            class="reset-layout-button"
            onclick={resetCharacterLayout}
            title="Återställ alla pappersposter till standardpositioner"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
            </svg>
            Återställ layout
        </button>
    </div>
    
    <div class="character-papers-container">
        <!-- Name Field -->
        <div class="character-item-wrapper" style="top: 20px; left: 20px;">
            <div class="torn-input-wrapper {nameVariant} character-paper draggable-paper" data-x="0" data-y="0" data-paper-id="character-name">
                <div class="character-item-content paper-content">
                    <div class="character-header paper-header">
                        <label for="name" class="character-label paper-label">Namn</label>
                    </div>
                    <input type="text" 
                        class="torn-input font-user character-input paper-input" 
                        data-tooltip="Vad kallar dig de andra överlevarna?" 
                        id="name" 
                        data-placement="bottom" 
                        placeholder="t.ex. Rust, Echo, Zero..." 
                        bind:value={formData.name} />
                </div>
            </div>
        </div>

        <!-- Job Field -->
        <div class="character-item-wrapper" style="top: 20px; left: 350px;">
            <div class="torn-input-wrapper {jobVariant} character-paper draggable-paper" data-x="0" data-y="0" data-paper-id="character-job">
                <div class="character-item-content paper-content">
                    <div class="character-header paper-header">
                        <label for="job" class="character-label paper-label">Syssla</label>
                    </div>
                    <input type="text" 
                        class="torn-input font-user character-input paper-input" 
                        id="job" 
                        placeholder="t.ex. Skräpsamlare, Vakt, Mekaniker..." 
                        bind:value={formData.job} />
                </div>
            </div>
        </div>

        <!-- Face Field -->
        <div class="character-item-wrapper" style="top: 200px; left: 50px;">
            <div class="torn-input-wrapper {faceVariant} character-paper draggable-paper" data-x="0" data-y="0" data-paper-id="character-face">
                <div class="character-item-content paper-content">
                    <div class="character-header paper-header">
                        <label for="face" class="character-label paper-label">Ansikte</label>

                    </div>
                    <textarea 
                        class="torn-input font-user character-textarea paper-textarea" 
                        placeholder="Ärrat, väderbitit, maskerat..." 
                        bind:value={formData.appearance.face}></textarea>
                </div>
            </div>
        </div>

        <!-- Body Field -->
        <div class="character-item-wrapper" style="top: 200px; left: 400px;">
            <div class="torn-input-wrapper {bodyVariant} character-paper draggable-paper" data-x="0" data-y="0" data-paper-id="character-body">
                <div class="character-item-content paper-content">
                    <div class="character-header paper-header">
                        <label for="body" class="character-label paper-label">Kropp</label>
                    </div>
                    <textarea 
                        class="torn-input font-user character-textarea paper-textarea" 
                        placeholder="Mager, muskulös, deformerad..." 
                        bind:value={formData.appearance.body}></textarea>
                </div>
            </div>
        </div>

        <!-- Clothes Field -->
        <div class="character-item-wrapper" style="top: 380px; left: 120px;">
            <div class="torn-input-wrapper {clothesVariant} character-paper draggable-paper" data-x="0" data-y="0" data-paper-id="character-clothes">
                <div class="character-item-content paper-content">
                    <div class="character-header paper-header">
                        <label for="clothes" class="character-label paper-label">Kläder</label>

                    </div>
                    <textarea 
                        class="torn-input font-user character-textarea paper-textarea" 
                        placeholder="Lappade trasor, läder, folie..." 
                        bind:value={formData.appearance.clothes}></textarea>
                </div>
            </div>
        </div>
    </div>
</div>


<style>
    /* Character tab container */
    .character-tab {
        display: block;
        width: 100%;
        min-height: 100vh;
        position: relative;
        padding: 1rem;
        overflow: visible; /* Allow papers to move freely */
    }

    /* Reset layout button */
    .reset-layout-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1001;
    }

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

    .character-papers-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        width: 100%;
        position: relative;
        min-height: 80vh; /* Give plenty of space for dragging */
    }

    /* Character item wrapper */
    .character-item-wrapper {
        width: fit-content;
        min-width: 300px;
        max-width: 450px;
        position: absolute; /* Changed to absolute for free positioning */
    }

    /* Character-specific paper styling */
    .character-paper {
        min-width: 250px;
        min-height: 120px;
    }

    /* Remove duplicate styles - now using shared .paper-content, .paper-input, .paper-textarea classes */

    /* Remove duplicate styles - now using shared .paper-header, .paper-label, .paper-drag-handle classes */

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .character-item-wrapper {
            min-width: 250px;
        }

        .character-papers-container {
            flex-direction: column;
        }
    }
</style>