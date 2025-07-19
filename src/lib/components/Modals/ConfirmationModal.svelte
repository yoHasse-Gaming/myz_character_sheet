<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { AlertTriangle } from '@lucide/svelte';

    let {
        open = $bindable(false),
        title = "Bekräfta",
        message = "Är du säker?",
        confirmText = "Ja",
        cancelText = "Avbryt",
        onConfirm = () => {},
        onCancel = () => {}
    }: {
        open: boolean;
        title?: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    } = $props();

    function handleConfirm() {
        onConfirm();
        open = false;
    }

    function handleCancel() {
        onCancel();
        open = false;
    }

    function handleClose() {
        handleCancel();
    }
</script>

<Modal
    {open}
    onOpenChange={(e) => {
        if (!e.open) {
            handleClose();
        }
    }}
    classes="panzoom-exclude"
    backdropClasses="!z-[100] backdrop-blur-sm bg-black/50 left-0 top-0 h-screen w-screen"
    contentBase="!z-[101] card p-6 space-y-4 shadow-xl max-w-md max-h-[90vh] overflow-y-auto"
    positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
    closeOnInteractOutside={true}
    closeOnEscape={true}
>
    {#snippet content()}
        <div class="confirmation-modal-content torn-paper-wrapper variant-2 modal-content-wrapper">
            <div class="modal-header">
                <div class="modal-title-container">
                    <AlertTriangle size={28} class="modal-icon text-warning-500" />
                    <h3 class="modal-title">{title}</h3>
                </div>
                <button class="modal-close"
                        aria-label="Stäng modal" 
                        onclick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-message">
                <p>{message}</p>
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick={handleCancel}>
                    {cancelText}
                </button>
                <div class="torn-paper-wrapper variant-5 btn-wrapper">
                    <button type="button" class="btn-primary btn-danger" onclick={handleConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    {/snippet}
</Modal>

<style>
    .confirmation-modal-content {
        min-height: 200px;
    }

    .modal-message {
        text-align: center;
        padding: 1rem 0;
    }

    .modal-message p {
        font-size: 1.1rem;
        color: var(--color-surface-800);
        margin: 0;
        line-height: 1.5;
    }

    :global(.dark) .modal-message p {
        color: var(--color-surface-200);
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }

    .btn-danger {
        background: linear-gradient(135deg, var(--color-error-600), var(--color-error-700));
        border: 2px solid var(--color-error-500);
    }

    .btn-danger:hover {
        background: linear-gradient(135deg, var(--color-error-700), var(--color-error-800));
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .text-warning-500 {
        color: var(--color-warning-500);
    }
</style>
