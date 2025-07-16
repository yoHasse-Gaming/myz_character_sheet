import interact from "interactjs";
import { characterActions } from "../states/character_sheet.svelte";

export function initInteractForElement(
    element: HTMLElement | string, 
    headerElem: HTMLElement | string | undefined = undefined,
    allowFrom: HTMLElement | string | undefined = undefined,
    options: {
        enableDraggable?: boolean;
        enableResizable?: boolean;
    } = { enableDraggable: true, enableResizable: true }
) {

    console.log('Initializing Interact.js for element:', element);
    // Initialize Interact.js for the given element
    const interactElement = interact(element);
    
    // Apply draggable functionality if enabled
    if (options.enableDraggable) {
        interactElement.draggable({
            allowFrom: allowFrom, // Use component-specific selector
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
                        throttledSaveLayout(paperId, { x, y });
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
                        const currentLayout = characterActions.getPaperLayout(paperId) || {};
                        characterActions.savePaperLayout(paperId, {
                            ...currentLayout,
                            x,
                            y
                        });
                    }
                }
            },
            modifiers: [
                // Restrict dragging to within the panzoom container
                // interact.modifiers.restrictRect({
                //     restriction: '.panzoom-content',
                //     endOnly: true
                // })
            ]
        });
    }
    
    // Apply resizable functionality if enabled
    if (options.enableResizable) {
        interactElement.resizable({
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
                    const minHeight = headerElem ? getMinHeightForContent(target, headerElem) : 120; // Default minimum height if no headerElem provided
                    
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
                        throttledSaveLayout(paperId, {
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
                        characterActions.savePaperLayout(paperId, {
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
    }
}

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

    export type LayoutType = {
        x: number;
        y: number;
        width?: number;
        height?: number;
    };

    export const throttledSaveLayout = throttle((paperId: string, layout: LayoutType) => {
        characterActions.savePaperLayout(paperId, layout);
    }, 100); // Save at most every 100ms

    export function getMinHeightForContent(element: HTMLElement, headerElem: HTMLElement | string): number {
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
        // Get element either by string or HTMLElement
        const header = typeof headerElem === 'string' ? element.querySelector(headerElem) : headerElem;
        const headerHeight = header ? (header as HTMLElement).offsetHeight : 40;
        
        // Calculate total minimum height: header + content padding + text height + some margin
        const contentPadding = 32; // 1rem top + 1rem bottom
        const minHeight = headerHeight + contentPadding + textHeight + paddingTop + paddingBottom + 20; // +20 for margin
        
        return Math.max(120, minHeight); // Never smaller than default minimum
    }

    export function autoResizePaper(textarea: HTMLTextAreaElement) {
        const paper = textarea.closest('.paper-card') as HTMLElement;
        if (!paper) return;
        
        // Prevent infinite resize loops and conflicts with manual resize
        if (paper.hasAttribute('data-auto-resizing') || paper.hasAttribute('data-manual-resizing')) return;
        paper.setAttribute('data-auto-resizing', 'true');
        
        try {
            const currentHeight = parseFloat(paper.style.height) || paper.offsetHeight;
            console.log('Current paper height:', currentHeight);
            const minHeight =  getMinHeightForContent(paper, '.paper-header');
            console.log('Calculated minimum height for content:', minHeight);
            
            // Only grow the paper if content needs more space, and add a small buffer to prevent constant resizing
            const buffer = 10; // Small buffer to prevent continuous resizing
            if (minHeight > currentHeight + buffer) {
                paper.style.height = minHeight + 'px';
                
                // Save the new layout
                const paperId = paper.getAttribute('data-paper-id');
                if (paperId) {
                    const x = parseFloat(paper.getAttribute('data-x') || '0') || 0;
                    const y = parseFloat(paper.getAttribute('data-y') || '0') || 0;
                    const width = parseFloat(paper.style.width) || paper.offsetWidth;
                    
                    characterActions.savePaperLayout(paperId, {
                        x,
                        y,
                        width,
                        height: minHeight
                    });
                }
            }
        } finally {
            // Always remove the flag after processing
            setTimeout(() => {
                paper.removeAttribute('data-auto-resizing');
            }, 50);
        }
    }

        // Debounced auto-resize function to avoid excessive calls during typing
    export const debouncedAutoResize = throttle((textarea: HTMLTextAreaElement) => {
        console.log('Debounced auto-resize triggered for:', textarea);
        autoResizePaper(textarea);
    }, 150); // Wait 150ms after user stops typing

