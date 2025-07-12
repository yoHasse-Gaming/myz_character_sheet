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

    // Debounced auto-resize function to avoid excessive calls during typing
    const debouncedAutoResize = throttle((textarea: HTMLTextAreaElement) => {
        autoResizePaper(textarea);
    }, 150); // Wait 150ms after user stops typing

    // Function to calculate minimum height based on textarea content
    function getMinHeightForContent(element: HTMLElement): number {
        const textarea = element.querySelector('textarea');
        if (!textarea) return 120; // Default minimum for input fields
        
        // Get the current styles
        const styles = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(styles.lineHeight) || 20;
        const paddingTop = parseFloat(styles.paddingTop) || 0;
        const paddingBottom = parseFloat(styles.paddingBottom) || 0;
        
        // Calculate text height by creating a temporary element
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            position: absolute;
            visibility: hidden;
            width: ${textarea.offsetWidth}px;
            font: ${styles.font};
            font-size: ${styles.fontSize};
            font-family: ${styles.fontFamily};
            line-height: ${styles.lineHeight};
            word-wrap: break-word;
            white-space: pre-wrap;
            padding: 0;
            margin: 0;
        `;
        tempDiv.textContent = textarea.value || textarea.placeholder;
        document.body.appendChild(tempDiv);
        
        const textHeight = tempDiv.offsetHeight;
        document.body.removeChild(tempDiv);
        
        // Get header height
        const header = element.querySelector('.character-header');
        const headerHeight = header ? (header as HTMLElement).offsetHeight : 40;
        
        // Calculate total minimum height: header + content padding + text height + some margin
        const contentPadding = 32; // 1rem top + 1rem bottom
        const minHeight = headerHeight + contentPadding + textHeight + paddingTop + paddingBottom + 20; // +20 for margin
        
        return Math.max(120, minHeight); // Never smaller than default minimum
    }

    // Function to auto-resize a paper when its textarea content changes
    function autoResizePaper(textarea: HTMLTextAreaElement) {
        const paper = textarea.closest('.character-paper') as HTMLElement;
        if (!paper) return;
        
        const currentHeight = parseFloat(paper.style.height) || paper.offsetHeight;
        const minHeight = getMinHeightForContent(paper);
        
        // Only grow the paper if content needs more space
        if (minHeight > currentHeight) {
            paper.style.height = minHeight + 'px';
            
            // Save the new layout
            const paperId = paper.getAttribute('data-paper-id');
            if (paperId) {
                const x = parseFloat(paper.getAttribute('data-x') || '0') || 0;
                const y = parseFloat(paper.getAttribute('data-y') || '0') || 0;
                const width = parseFloat(paper.style.width) || paper.offsetWidth;
                
                characterActions.savePaperLayout('characterTab', paperId, {
                    x,
                    y,
                    width,
                    height: minHeight
                });
            }
        }
    }

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
                allowFrom: '.character-header', // Use component-specific selector
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
                            throttledSaveLayout('characterTab', paperId, { x, y });
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
                            const currentLayout = characterActions.getPaperLayout('characterTab', paperId) || {};
                            characterActions.savePaperLayout('characterTab', paperId, {
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
                            throttledSaveLayout('characterTab', paperId, {
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
                            characterActions.savePaperLayout('characterTab', paperId, {
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
            <div class="torn-input-wrapper {nameVariant} character-paper" data-x="0" data-y="0" data-paper-id="character-name">
                <div class="character-item-content">
                    <div class="character-header">
                        <label for="name" class="character-label">Namn</label>
                    </div>
                    <input type="text" 
                        class="torn-input font-user character-input" 
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
            <div class="torn-input-wrapper {jobVariant} character-paper" data-x="0" data-y="0" data-paper-id="character-job">
                <div class="character-item-content">
                    <div class="character-header">
                        <label for="job" class="character-label">Syssla</label>
                    </div>
                    <input type="text" 
                        class="torn-input font-user character-input" 
                        id="job" 
                        placeholder="t.ex. Skräpsamlare, Vakt, Mekaniker..." 
                        bind:value={formData.job} />
                </div>
            </div>
        </div>

        <!-- Face Field -->
        <div class="character-item-wrapper" style="top: 200px; left: 50px;">
            <div class="torn-input-wrapper {faceVariant} character-paper" data-x="0" data-y="0" data-paper-id="character-face">
                <div class="character-item-content">
                    <div class="character-header">
                        <label for="face" class="character-label">Ansikte</label>
                    </div>
                    <textarea 
                        class="torn-input font-user character-textarea" 
                        placeholder="Ärrat, väderbitit, maskerat..." 
                        bind:value={formData.appearance.face}
                        oninput={(e) => debouncedAutoResize(e.target as HTMLTextAreaElement)}></textarea>
                </div>
            </div>
        </div>

        <!-- Body Field -->
        <div class="character-item-wrapper" style="top: 200px; left: 400px;">
            <div class="torn-input-wrapper {bodyVariant} character-paper" data-x="0" data-y="0" data-paper-id="character-body">
                <div class="character-item-content">
                    <div class="character-header">
                        <label for="body" class="character-label">Kropp</label>
                    </div>
                    <textarea 
                        class="torn-input font-user character-textarea" 
                        placeholder="Mager, muskulös, deformerad..." 
                        bind:value={formData.appearance.body}
                        oninput={(e) => debouncedAutoResize(e.target as HTMLTextAreaElement)}></textarea>
                </div>
            </div>
        </div>

        <!-- Clothes Field -->
        <div class="character-item-wrapper" style="top: 380px; left: 120px;">
            <div class="torn-input-wrapper {clothesVariant} character-paper" data-x="0" data-y="0" data-paper-id="character-clothes">
                <div class="character-item-content">
                    <div class="character-header">
                        <label for="clothes" class="character-label">Kläder</label>
                    </div>
                    <textarea 
                        class="torn-input font-user character-textarea" 
                        placeholder="Lappade trasor, läder, folie..." 
                        bind:value={formData.appearance.clothes}
                        oninput={(e) => autoResizePaper(e.target as HTMLTextAreaElement)}></textarea>
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
        cursor: default; /* Default cursor since only header is draggable */
        user-select: none;
        position: relative;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        will-change: transform;
        /* Add hardware acceleration for better performance */
        transform: translateZ(0);
        backface-visibility: hidden;
        min-width: 250px;
        min-height: 120px;
        /* Add a subtle border that becomes visible on hover to indicate resize areas */
        border: 3px solid transparent;
        border-radius: 4px;
    }

    .character-paper:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        z-index: 10;
    }

    .character-paper:active,
    .character-paper.dragging,
    .character-paper.resizing {
        z-index: 20;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
    }

    /* Ensure content doesn't interfere with resizing */
    .character-item-content {
        padding: 1rem;
        position: relative;
        z-index: 2;
        pointer-events: auto;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    /* Make textareas and inputs resize with the container */
    .character-textarea {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.5rem 0;
        resize: none; /* Disable default resize since we're using InteractJS */
        box-sizing: border-box;
        flex: 1; /* Take up remaining space after header */
        min-height: 3rem;
    }

    .character-input {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 1rem;
        padding: 0.5rem 0;
        box-sizing: border-box;
    }

    /* Character header with label and drag handle */
    .character-header {
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

    :global(.dark) .character-header {
        border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .character-label {
        pointer-events: none;
        font-family: var(--font-user), serif;
        font-weight: bold;
        font-size: 1.1rem;
        letter-spacing: 0.05em;
        color: var(--color-surface-900);
        text-transform: uppercase;
        flex-grow: 1;
    }

    :global(.dark) .character-label {
        color: var(--color-surface-100);
    }

    .drag-handle {
        color: var(--color-surface-200);
        opacity: 0.7;
        transition: all 0.2s ease;
    }

    .drag-handle:hover {
        opacity: 1;
        color: var(--color-primary-600);
    }

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