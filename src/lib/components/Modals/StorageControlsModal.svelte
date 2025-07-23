<!--
Storage Controls Modal
Provides a modal interface for all storage operations
-->
<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { closeDialogueOption, isDialogueOpen, openDialogueOption } from "../../states/modals.svelte";
    import { onDestroy, onMount } from "svelte";
        import ConfirmationModal from './ConfirmationModal.svelte';
    import { Archive, File, FileDown, FileJson, FileUp, Save, SquareCheckBig, Trash, UserPen } from '@lucide/svelte';
    import CloudStorage from '../CloudStorage.svelte';
    import { sheetState, type CharacterSheetData } from "../../states/character_sheet.svelte";
    import { storageHandler } from "../../utils/storageHandler";
    import OBR from "@owlbear-rodeo/sdk";
    
    function closeModal() {
        closeDialogueOption('storageControls');
    }

        // Initialize storage utilities

    let storageConfig = $state(storageHandler.getStorageConfig());

    let isAutoSaving = $state(false);
    let isAutoSavingToFile = $state(false);
    let currentFileName = $state('');
    let importStatus = $state('');
    let exportStatus = $state('');

    // File auto-save functions
    async function setupFileAutoSave() {
        if (!storageHandler.supportsFileSystemAccess) {
            exportStatus = 'File System Access API not supported in this browser. Please use Chrome, Edge, or another compatible browser.';
            setTimeout(() => exportStatus = '', 5000);
            return;
        }

        const success = await storageHandler.createNewCharacterFile(sheetState);
        if (success) {
            isAutoSavingToFile = true;
            storageHandler.configureStorage({ autoSaveToFile: true });
            await startAutoSave();
            exportStatus = 'File selected! All changes will automatically save to your chosen file.';
            
            // Update current file name for display
            if (storageHandler.hasActiveFile) {
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
            }
        } else {
            exportStatus = 'Failed to select file.';
        }
        setTimeout(() => exportStatus = '', 3000);
    }

    async function startAutoSave(){
        storageHandler.startAutoSave(
            async () => {
                // Callback before saving
                console.log('Saving character sheet to file...');
                sheetState.isSaving = true; // Set saving flag
            },
            async () => {
                // Callback after saving
                console.log('Character sheet saved to file successfully.');
                sheetState.isSaving = false; // Clear saving flag
            }
        );
    }

    async function loadFromFileSystem() {
        if (!storageHandler.supportsFileSystemAccess) {
            importStatus = 'File System Access API not supported in this browser.';
            setTimeout(() => importStatus = '', 3000);
            return;
        }

        try {
            const data = await storageHandler.loadFromFile();
            if (data) {
                Object.assign(sheetState, data);
                selectedCharacterId = sheetState.id;
                
                // Enable file auto-save since we now have a file handle
                isAutoSavingToFile = true;
                storageHandler.configureStorage({ autoSaveToFile: true });
                await startAutoSave();
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                
                importStatus = 'Character loaded from file. All changes will automatically save to this file.';
            }
        } catch (error) {
            importStatus = 'Failed to load from file: ' + (error as Error).message;
        }
        setTimeout(() => importStatus = '', 5000);
    }

    async function importFromJSON() {
        try {
            const data = await storageHandler.importFromJSON();
            if (data) {
                // Apply imported data to character sheet - include all fields
                Object.assign(sheetState, data);
                importStatus = 'Character sheet imported successfully';
                selectedCharacterId = sheetState.id; // Update selected character ID
                // Save the imported character to Owlbear if available
                
            } else {
                importStatus = 'Import cancelled';
            }
        } catch (error) {
            importStatus = 'Import failed: ' + (error as Error).message;
        }
        setTimeout(() => importStatus = '', 5000);
    }


    let selectedCharacterId: string = $state('');
    
    async function createNewCharacter() {
        // Generate a new ID and set default values
        sheetState.id = crypto.randomUUID();
        sheetState.name = 'New Character'; // Default name
        sheetState.occupation = 'Enforcer'; // Default occupation

        selectedCharacterId = sheetState.id; // Select the new character
        importStatus = 'New character created! All changes will automatically save to your selected file.';
        
        // Automatically set up file auto-save for the new character
        await setupFileAutoSave();
    }


    onMount(async () => {
        // Check if file auto-save was previously enabled
        isAutoSavingToFile = storageConfig.autoSaveToFile || false;
        if (isAutoSavingToFile && storageHandler.hasActiveFile) {
            currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
        }


        if(!selectedCharacterId) {
            importStatus = 'Welcome to Mutant: Year Zero Character Sheet! Create a new character or load an existing one from a file.';
            openDialogueOption('storageControls');
        }
        
        addEventListener('beforeunload', onBeforeUnload);
    });


    function onBeforeUnload(e: BeforeUnloadEvent) {
        if (!isAutoSaving) {
            e.preventDefault();
            return '';
        }
    }
    

    onDestroy(() => {
        // Cleanup if needed when the modal is destroyed
        storageHandler.stopAutoSave();
        removeEventListener('beforeunload', onBeforeUnload);
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
    closeOnInteractOutside={selectedCharacterId !== ''}
    closeOnEscape={selectedCharacterId !== ''}

>
    {#snippet content()}
    <div class="storage-content">
        {#if selectedCharacterId}
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
        {/if}
    <div class="torn-paper-wrapper variant-1">
        <div class="card-content">
            <div class="storage-controls">
    <h3 class="storage-title"><Save /> File Storage & Backup</h3>

    <!-- Cloud Storage Integration -->
     {#if false}
    <CloudStorage />
    {/if}

    <!-- Status Messages -->
    {#if exportStatus}
        <div class="status-message">{exportStatus}</div>
    {/if}
    {#if importStatus}
        <div class="status-message">{importStatus}</div>
    {/if}

    {#if !selectedCharacterId}
    <div class="control-group">
        <h4><Archive size={16} /> Character</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button 
                    class="btn "
                    onclick={createNewCharacter}
                >
                <UserPen size={20} /> Create New Character
                </button>
            </div>
        </div>
    </div>
    {/if}


    {#if selectedCharacterId}
    <!-- File Auto-save Status -->
    {#if storageHandler.supportsFileSystemAccess}
    <div class="control-group">
        <h4><File size={16} /> File:</h4>
        <div class="control-row">

            <div class="file-status">
                <span class="file-indicator"><SquareCheckBig color={"var(--color-success-700)"} /> Auto-saving to:</span>
                <span class="file-name">{currentFileName}</span>
            </div>
            <div class="help-text">
                All changes are automatically saved to your file. No manual saving needed!
            </div>

        </div>
    </div>
    {:else}
    <div class="control-group">
        <h4><File size={16} /> File Auto-Save</h4>
        <div class="help-text">
            File System Access API not supported in this browser. Please use Chrome, Edge, or another compatible browser for this feature.
        </div>
    </div>
    {/if}

    {/if}

    <!-- Load from File -->
    <div class="control-group">
        <h4><FileJson size={16} /> Load Character from File</h4>
        <div class="control-row">
            {#if storageHandler.supportsFileSystemAccess}
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn btn-outline" onclick={loadFromFileSystem}>
                    <File size={16} /> Load from File
                </button>
            </div>
            {:else}
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn btn-outline" onclick={importFromJSON}>
                    <FileUp size={16} /> Import JSON (Fallback)
                </button>
            </div>
            {/if}
        </div>
        <div class="help-text">
            {#if storageHandler.supportsFileSystemAccess}
                Load a character file and automatically enable auto-save to that file.
            {:else}
                Use the file picker to import a character JSON file.
            {/if}
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

    .status-message {
        padding: 0.5rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        font-weight: 500;
        font-style: italic;
    }

    .file-name {
        font-size: 0.8rem;
        color: var(--color-surface-600);
        font-style: italic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(.dark) .file-name {
        color: var(--color-surface-200);
    }

    .file-status {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        width: 100%;
    }

    .file-indicator {
        font-size: 0.8rem;
        color: var(--color-success-700);
        font-weight: 600;
    }

    :global(.dark) .file-indicator {
        color: var(--color-success-400);
    }

    .help-text {
        font-size: 0.75rem;
        color: var(--color-surface-600);
        margin-top: 0.25rem;
        font-style: italic;
    }

    :global(.dark) .help-text {
        color: var(--color-surface-200);
    }

        @container (max-width: 500px) {
        .control-row {
            flex-direction: column;
            align-items: stretch;
        }

        .btn {
            text-align: center;
        }
    }

</style>
