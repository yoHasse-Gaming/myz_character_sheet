<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { closeDialogueOption, infoModalState, isDialogueOpen } from "../../states/modals.svelte";
    import { Modal } from "@skeletonlabs/skeleton-svelte";


    function closeModal() {
        closeDialogueOption('info');
    }

    // Close modal on Escape key (handled by Modal component now)
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

</script>

<Modal
  open={isDialogueOpen('info')}
  onOpenChange={(e) => {
    if (!e.open) {
      closeModal();
    }
  }}
  classes="panzoom-exclude"
  backdropClasses="!z-[100] backdrop-blur-sm bg-black/50 left-0 top-0 h-screen w-screen"
  contentBase="!z-[101] card p-0 shadow-xl max-w-2xl max-h-[90vh] overflow-hidden"
  positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
  closeOnInteractOutside={true}
  closeOnEscape={true}
>
  {#snippet trigger()}
    <!-- No trigger needed since modal is controlled externally -->
  {/snippet}
  
  {#snippet content()}
    <div class="info-modal-content">
            <button 
                class="modal-close-button" 
                onclick={closeModal} 
                aria-label="Stäng talangfönster"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>

            </button>
            <div class="torn-paper-wrapper variant-1 info-modal-wrapper">
                <div class="info-modal-content">
                    <div class="info-modal-header">
                        <h2 class="info-modal-title">{infoModalState.title}</h2>
                    </div>
                    
                    <div class="info-modal-body {infoModalState.type}">
                        {@html infoModalState.content}
                    </div>
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
    
    /* Info-specific styles that override common styles if needed */

    .info-modal-container {
        max-width: min(90vw, 800px);
        max-height: min(90vh, 700px);
        width: 100%;
        position: relative;
    }
    
    .info-modal-wrapper {
        width: 100%;
        height: 100%;
        min-height: 300px;
    }
    
    .info-modal-content {
        padding: 2rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        overflow-y: auto;
        position: relative;
        z-index: 2;
    }
    
    .info-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid var(--color-primary-600);
        padding-bottom: 1rem;
    }
    
    .info-modal-title {
        
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--color-surface-900);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    :global(.dark) .info-modal-title {
        color: var(--color-surface-100);
    }
    
    .close-button {
        background: none;
        border: none;
        color: var(--color-surface-600);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-button:hover {
        background: rgba(217, 119, 6, 0.1);
        color: var(--color-primary-600);
        transform: scale(1.1);
    }
    
    :global(.dark) .close-button {
        color: var(--color-surface-400);
    }
    
    :global(.dark) .close-button:hover {
        background: rgba(217, 119, 6, 0.2);
        color: var(--color-primary-400);
    }
    
    .info-modal-body {
        flex: 1;
        font-size: 1rem;
        line-height: 1.6;
        color: var(--color-surface-800);
        overflow-y: auto;
    }
    
    :global(.dark) .info-modal-body {
        color: var(--color-surface-200);
    }
    
    /* Style for different content types */
    .info-modal-body.trauma {
        text-align: center;
        font-size: 1.1rem;
    }
    
    /* Style HTML content within the modal */
    .info-modal-body :global(h3) {
        
        font-size: 1.3rem;
        font-weight: bold;
        color: var(--color-primary-600);
        margin: 1.5rem 0 0.75rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    :global(.dark) .info-modal-body :global(h3) {
        color: var(--color-primary-400);
    }
    
    .info-modal-body :global(h4) {
        font-weight: bold;
        font-size: 1rem;
        color: var(--color-surface-700);
        margin: 1rem 0 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    :global(.dark) .info-modal-body :global(h4) {
        color: var(--color-surface-300);
    }
    
    .info-modal-body :global(p) {
        margin: 0.75rem 0;
    }
    
    .info-modal-body :global(p:first-child) {
        margin-top: 0;
    }
    
    .info-modal-body :global(p:last-child) {
        margin-bottom: 0;
    }
    
    .info-modal-body :global(ul) {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
    }
    
    .info-modal-body :global(li) {
        margin: 0.5rem 0;
        line-height: 1.5;
    }
    
    .info-modal-body :global(strong) {
        color: var(--color-primary-600);
        font-weight: 600;
    }
    
    :global(.dark) .info-modal-body :global(strong) {
        color: var(--color-primary-400);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .info-modal-container {
            max-width: 95vw;
            max-height: 95vh;
        }
        
        .info-modal-content {
            padding: 1.5rem;
        }
        
        .info-modal-title {
            font-size: 1.5rem;
        }
        
        .info-modal-body {
            font-size: 0.95rem;
        }
    }
    
    @media (max-width: 480px) {
        .info-modal-content {
            padding: 1rem;
        }
        
        .info-modal-title {
            font-size: 1.3rem;
        }
        
        .close-button {
            padding: 0.25rem;
        }
    }
</style>
