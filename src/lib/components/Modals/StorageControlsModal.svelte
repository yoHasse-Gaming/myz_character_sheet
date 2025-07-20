<!--
Storage Controls Modal
Provides a modal interface for all storage operations
-->
<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { closeDialogueOption, isDialogueOpen } from "../../states/modals.svelte";
    import { onDestroy, onMount } from "svelte";
    import { Archive, BrainCircuit, FileDown, FileJson, FileUp, FolderDown, Play, Save, Square, Trash } from "@lucide/svelte";
    import { useLocalStorage, useOwlbearSync } from "../../utils/owlbearIntegration";
    import { sheetState, type CharacterSheetData } from "../../states/character_sheet.svelte";
    
    function closeModal() {
        closeDialogueOption('storageControls');
    }

        // Initialize storage utilities
    const localStore = useLocalStorage();
    const owlbearSync = useOwlbearSync();

    let isAutoSaving = $state(false);
    let storageConfig = $state(localStore.getStorageConfig());
    let importStatus = $state('');
    let exportStatus = $state('');

        // Auto-save toggle
    function toggleAutoSave() {
        if (isAutoSaving) {
            stopAutoSave();

        } else {
            startAutoSave();
        }
    }

    function startAutoSave() {
            localStore.startAutoSave();
            owlbearSync.startAutoSave();
            isAutoSaving = true;
            localStorage.setItem('autoSave', 'true');
    }

    function stopAutoSave() {
        localStore.stopAutoSave();
        owlbearSync.stopAutoSave();
        isAutoSaving = false;
        localStorage.setItem('autoSave', 'false');
    }

    // Manual save operations
    function saveToLocalStorage() {
        localStore.save();
        exportStatus = 'Saved to localStorage';
        setTimeout(() => exportStatus = '', 3000);
    }

    function loadFromLocalStorage() {
        const data = localStore.load();
        if (data) {
            // Apply loaded data to character sheet - include all fields
            Object.assign(sheetState, data);
            importStatus = 'Loaded from localStorage';
        } else {
            importStatus = 'No saved data found';
        }
        setTimeout(() => importStatus = '', 3000);
    }

    function clearLocalStorage() {
        localStore.clear();
        exportStatus = 'localStorage cleared';
        setTimeout(() => exportStatus = '', 3000);
    }

    // JSON export/import
    function exportToJSON() {
        const filename = `${sheetState.name || 'unnamed'}-character-sheet.json`;
        localStore.exportJSON(filename);
        exportStatus = 'Character sheet exported';
        setTimeout(() => exportStatus = '', 3000);
    }

    async function importFromJSON() {
        try {
            const data = await localStore.importJSON();
            if (data) {
                // Apply imported data to character sheet - include all fields
                Object.assign(sheetState, data);
                importStatus = 'Character sheet imported successfully';
            } else {
                importStatus = 'Import cancelled';
            }
        } catch (error) {
            importStatus = 'Import failed: ' + (error as Error).message;
        }
        setTimeout(() => importStatus = '', 5000);
    }

    // Universal save/load (localStorage + Owlbear)
    async function saveUniversal() {
        await owlbearSync.saveUniversal();
        exportStatus = owlbearSync.isInOwlbear ? 
            'Saved to Owlbear and localStorage' : 
            'Saved to localStorage';
        setTimeout(() => exportStatus = '', 3000);
    }

    async function loadUniversal() {
        const data = await owlbearSync.loadUniversal();
        if (data) {
            // Apply loaded data to character sheet - include all fields
            Object.assign(sheetState, data);
            importStatus = owlbearSync.isInOwlbear ? 
                'Loaded from Owlbear (or localStorage fallback)' : 
                'Loaded from localStorage';
        } else {
            importStatus = 'No saved data found';
        }
        setTimeout(() => importStatus = '', 3000);
    }

    // Update storage configuration
    function updateAutoSaveInterval(event: Event) {
        const target = event.target as HTMLInputElement;
        const interval = parseInt(target.value) * 1000; // Convert seconds to milliseconds
        localStore.configureStorage({ autoSaveInterval: interval });
        storageConfig = localStore.getStorageConfig();
        
        if (isAutoSaving) {
            // Restart auto-save with new interval
            toggleAutoSave();
            toggleAutoSave();
        }
    }

    onMount(async () => {
        // Ensure the modal is closed when the component mounts
        await loadUniversal();
        isAutoSaving = localStorage.getItem('autoSave') === 'true';
        if (isAutoSaving) {
            startAutoSave();
        }
    });

    onDestroy(() => {
        // Cleanup if needed when the modal is destroyed
        localStore.stopAutoSave();
        owlbearSync.stopAutoSave();
    });


</script>

<Modal
    open={isDialogueOpen('storageControls')}
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
    {#snippet content()}
    <div class="storage-content">
        <button 
            class="modal-close-button" 
            onclick={closeModal} 
            aria-label="Stäng storlekskontroller"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    <div class="torn-paper-wrapper variant-1">
        <div class="card-content">
            <div class="storage-controls">
    <h3 class="storage-title"><Save /> Storage & Backup</h3>

    <!-- Status Messages -->
    {#if exportStatus}
        <div class="status-message success">{exportStatus}</div>
    {/if}
    {#if importStatus}
        <div class="status-message info">{importStatus}</div>
    {/if}

    <!-- Auto-save Controls -->
    <div class="control-group">
        <h4>Auto-Save</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button 
                    class="btn {isAutoSaving ? 'btn-danger' : 'btn-primary'}"
                    onclick={toggleAutoSave}
                >
                    {#if isAutoSaving}
                        <Square size={16} /> Stop Auto-Save
                    {:else}
                        <Play size={16} /> Start Auto-Save
                    {/if}
                </button>
            </div>
            
            <label class="interval-control">
                Interval (seconds):
                <input 
                    type="number" 
                    min="1" 
                    max="300" 
                    value={storageConfig.autoSaveInterval / 1000}
                    onchange={updateAutoSaveInterval}
                    class="interval-input"
                />
            </label>
        </div>
    </div>

    <!-- Universal Save/Load (Best of both worlds) -->
    <div class="control-group">
        <h4><BrainCircuit size={16} /> Smart Save/Load {owlbearSync.isInOwlbear ? '(Owlbear + localStorage)' : '(localStorage only)'}</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn" onclick={saveUniversal}>
                    <Save size={16} /> Smart Save
                </button>
            </div>
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn" onclick={loadUniversal}>
                    <FolderDown size={16} /> Smart Load
                </button>
            </div>
        </div>
    </div>

    <!-- localStorage Controls -->
    <div class="control-group">
        <h4><Archive size={16} /> localStorage</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">

            <button class="btn" onclick={saveToLocalStorage}>
                <Save size={16} /> Save Local
            </button>
            </div>
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn" onclick={loadFromLocalStorage}>
                    <FolderDown size={16} /> Load Local
                </button>
            </div>
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn " onclick={clearLocalStorage}>
                    <Trash size={16} color="red" /> Clear Local
            </button>
            </div>
        </div>
    </div>

    <!-- JSON Export/Import -->
    <div class="control-group">
        <h4><FileJson size={16} /> JSON Export/Import</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
            <button class="btn btn-outline" onclick={exportToJSON}>
                <FileDown size={16} /> Export JSON
            </button>
            </div>
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
            <button class="btn btn-outline" onclick={importFromJSON}>
                <FileUp size={16} /> Import JSON
            </button>
            </div>
        </div>
    </div>

</div>
        </div>
    </div>
    </div>
    {/snippet}
</Modal>

<style>
    .storage-content {
        padding: 1rem;
    }

    .modal-close-button {
        position: absolute;
    }

    .modal-close-button svg {
        width: 24px;
        height: 24px;
        /* stroke: var(--color-surface-800); */
    }

       .btn-wrapper {
        min-width: 250px;
        width: 250px;
        
    }
    .storage-controls {
        /* background: var(--color-surface-100); */
        /* border: 1px solid var(--color-surface-300); */
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        
    }

    .storage-title {
        margin: 0 0 1rem 0;
        color: var(--color-primary-600);
        font-size: 1.1rem;
        font-weight: 600;
    }

    .control-group {
        margin-bottom: 1rem;
    }

    .control-group h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        color: var(--color-surface-900);
        font-weight: 500;
    }

    :global(.dark) .control-group h4 {
        color: var(--color-surface-100);
    }

    .control-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .interval-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--color-surface-900);
    }

    :global(.dark) .interval-input {
        color: var(--color-surface-100);
    }

    .status-message {
        padding: 0.5rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        font-weight: 500;
    }

        .status-message.success {
        background: var(--color-success-100);
        color: var(--color-success-800);
        border: 1px solid var(--color-success-300);
    }

    .status-message.info {
        background: var(--color-tertiary-100);
        color: var(--color-tertiary-800);
        border: 1px solid var(--color-tertiary-300);
    }

        @container (max-width: 500px) {
        .control-row {
            flex-direction: column;
            align-items: stretch;
        }

        .btn {
            text-align: center;
        }

        .interval-control {
            justify-content: space-between;
        }
    }

</style>
