<!--
Storage Controls Modal
Provides a modal interface for all storage operations
-->
<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { closeDialogueOption, isDialogueOpen, openDialogueOption } from "../../states/modals.svelte";
    import { onDestroy, onMount } from "svelte";
    import { Archive, File, FileDown, FileJson, FileUp, Save, SquareCheckBig, Trash, UserPen, ChevronDown, RefreshCcw } from '@lucide/svelte';
    import CloudStorage from '../CloudStorage.svelte';
    import { sheetState, type CharacterSheetData } from "../../states/character_sheet.svelte";
    import { storageHandler } from "../../utils/storageHandler";
    import { toaster } from '../../utils/toaster';
    
    function closeModal() {
        closeDialogueOption('storageControls');
    }
    let currentFileName = $state('');
    let opfsCharacters = $state<{id: string, name: string, lastModified: string}[]>([]);
    let selectedOPFSCharacterId = $state('');

    // File auto-save functions
    async function setupFileAutoSave() {
        if (storageHandler.supportsFileSystemAccess) {
            const success = await storageHandler.createNewCharacterFile(sheetState);
            if (success) {
                await startAutoSave();
                toaster.create({
                    title: 'File selected!',
                    description: 'All changes will save to your selected file.',
                    duration: 5000,
                    type: 'info'
                });
                
                // Update current file name for display
                if (storageHandler.hasActiveFile) {
                    currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                }
            } else {
                toaster.create({
                    title: 'File Selection Failed',
                    description: 'Failed to select file.',
                    duration: 5000,
                    type: 'error'
                });
            }
        } else if (storageHandler.supportsOPFS) {
            const success = await storageHandler.createNewCharacterOPFS(sheetState);
            if (success) {
                await startAutoSave();
                
                toaster.create({
                    title: 'Auto-save Enabled',
                    description: 'All changes will be saved to browser storage.',
                    duration: 5000,
                    type: 'info'
                });
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
            } else {
                toaster.create({
                    title: 'Auto-save Failed',
                    description: 'Failed to set up auto-save.',
                    duration: 5000,
                    type: 'error'
                });
            }
        } else {
            toaster.create({
                title: 'Auto-save Not Supported',
                description: 'File auto-save not supported in this browser.',
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function startAutoSave(){
        storageHandler.startAutoSave(
            async () => {
                // Callback before saving
                sheetState.isSaving = true; // Set saving flag
            },
            async () => {
                // Callback after saving
                sheetState.isSaving = false; // Clear saving flag
            }
        );
    }

    async function loadFromFileSystem() {
        if (storageHandler.supportsFileSystemAccess) {
            try {
                const data = await storageHandler.loadFromFile();
                if (data) {
                    Object.assign(sheetState, data);
                    selectedCharacterId = sheetState.id;
                    
                    // Enable file auto-save since we now have a file handle
                    storageHandler.configureStorage({ autoSaveToFile: true });
                    await startAutoSave();
                    currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                    toaster.create({
                        title: 'Character Loaded',
                        description: `Character loaded from file. All changes will automatically save to this file.`,
                        duration: 10000,
                        type: 'success'
                    });
                }
            } catch (error) {
                // importStatus = 'Failed to load from file: ' + (error as Error).message;
                toaster.create({
                    title: 'Load Failed',
                    description: 'Failed to load character from file: ' + (error as Error).message,
                    duration: 5000,
                    type: 'error'
                });
            }
        } else if (storageHandler.supportsOPFS) {
            try {
                const data = await storageHandler.loadFromOPFS();
                if (data) {
                    Object.assign(sheetState, data);
                    selectedCharacterId = sheetState.id;
                    
                    // Enable OPFS auto-save since we now have a file handle
                    storageHandler.configureStorage({ autoSaveToFile: true });
                    await startAutoSave();
                    currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                    
                    toaster.create({
                        title: 'Character Loaded',
                        description: `Character loaded from browser storage. All changes will automatically save.`,
                        duration: 10000,
                        type: 'success'
                    });
                } else {
                    toaster.create({
                        title: 'No Character Found',
                        description: 'No character data found in browser storage.',
                        duration: 5000,
                        type: 'info'
                    });
                }
            } catch (error) {
                toaster.create({
                    title: 'Load Failed',
                    description: 'Failed to load character from browser storage: ' + (error as Error).message,
                    duration: 5000,
                    type: 'error'
                });
            }
        } else {
            toaster.create({
                title: 'Load Failed',
                description: 'File loading not supported in this browser.',
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function loadOPFSCharacter(characterId: string) {
        if (!characterId) return;
        
        try {
            const data = await storageHandler.loadFromOPFSWithId(characterId);
            if (data) {
                Object.assign(sheetState, data);
                selectedCharacterId = sheetState.id;
                
                // Enable OPFS auto-save
                storageHandler.configureStorage({ autoSaveToFile: true });
                await startAutoSave();
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                
                toaster.create({
                    title: 'Character Loaded',
                    description: `Character "${data.name}" loaded from browser storage.`,
                    duration: 10000,
                    type: 'success'
                });
                
                selectedOPFSCharacterId = characterId;
            }
        } catch (error) {
            toaster.create({
                title: 'Load Failed',
                description: 'Failed to load character from browser storage: ' + (error as Error).message,
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function deleteOPFSCharacter(characterId: string) {
        if (!characterId) return;
        
        try {
            const success = await storageHandler.deleteFromOPFS(characterId);
            if (success) {
                await refreshOPFSCharacters();
                
                toaster.create({
                    title: 'Character Deleted',
                    description: `Character deleted from browser storage.`,
                    duration: 5000,
                    type: 'success'
                });
                
                // If we deleted the currently selected character, clear the selection
                if (selectedCharacterId === characterId) {
                    selectedCharacterId = '';
                    currentFileName = '';
                }
            } else {
                toaster.create({
                    title: 'Delete Failed',
                    description: 'Failed to delete character from browser storage.',
                    duration: 5000,
                    type: 'error'
                });
            }
        } catch (error) {
            toaster.create({
                title: 'Delete Failed',
                description: 'Failed to delete character from browser storage: ' + (error as Error).message,
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function refreshOPFSCharacters() {
        if (storageHandler.supportsOPFS) {
            opfsCharacters = await storageHandler.getOPFSCharacters();
        }
    }

    async function importFromJSON() {
        try {
            const data = await storageHandler.importFromJSON();
            if (data) {
                // Apply imported data to character sheet - include all fields
                Object.assign(sheetState, data);
                toaster.create({
                    title: 'Character Imported',
                    description: `Character "${sheetState.name}" imported successfully.`,
                    duration: 5000,
                    type: 'success'
                });
                selectedCharacterId = sheetState.id; // Update selected character ID
                // Save the imported character to Owlbear if available
                
            } else {
                toaster.create({
                    title: 'Import Cancelled',
                    description: 'No character data found in the imported file.',
                    duration: 5000,
                    type: 'info'
                });
            }
        } catch (error) {
            toaster.create({
                title: 'Import Failed',
                description: 'Import failed: ' + (error as Error).message,
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function exportToJson() {
        try {
            await storageHandler.exportToJSON(sheetState);
            toaster.create({
                title: 'Export Successful',
                description: 'Character sheet exported successfully.',
                duration: 5000,
                type: 'success'
            });
        } catch (error) {
            toaster.create({
                title: 'Export Failed',
                description: 'Export failed: ' + (error as Error).message,
                duration: 5000,
                type: 'error'
            });
        }
    }


    let selectedCharacterId: string = $state('');
    
    async function createNewCharacter() {
        // Generate a new ID and set default values
        sheetState.id = crypto.randomUUID();
        sheetState.name = 'New Character'; // Default name
        sheetState.occupation = 'Enforcer'; // Default occupation

        selectedCharacterId = sheetState.id; // Select the new character
        
    // Automatically set up auto-save for the new character
        if (storageHandler.supportsFileSystemAccess) {
            await setupFileAutoSave();
            toaster.create({
                title: 'New Character Created',
                description: 'Select a file location for auto-save.',
                duration: 5000,
                type: 'info'
            });
        } else if (storageHandler.supportsOPFS) {
            const success = await storageHandler.createNewCharacterOPFS(sheetState);
            if (success) {
                await startAutoSave();
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                toaster.create({
                    title: 'New Character Created',
                    description: 'All changes will automatically save to browser storage.',
                    duration: 5000,
                    type: 'info'
                });
                selectedOPFSCharacterId = sheetState.id;
                // Refresh the character list to show the new character
                await refreshOPFSCharacters();
            } else {
                toaster.create({
                    title: 'New Character Created',
                    description: 'Auto-save setup failed.',
                    duration: 5000,
                    type: 'error'
                });
            }
        } else {
            toaster.create({
                title: 'New Character Created',
                description: 'Use export/import for saving.',
                duration: 5000,
                type: 'info'
            });
        }
    }


    onMount(async () => {
        // Refresh OPFS characters list
        await refreshOPFSCharacters();
        
        // Check if file auto-save was previously enabled
        if (storageHandler.hasActiveFile) {
            currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
        }
        // Check for existing OPFS data if File System Access API is not available
        else if (!storageHandler.supportsFileSystemAccess && storageHandler.supportsOPFS) {
            try {
                const data = await storageHandler.loadFromOPFS();
                if (data) {
                    Object.assign(sheetState, data);
                    selectedCharacterId = sheetState.id;
                    selectedOPFSCharacterId = sheetState.id;
                    currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                    storageHandler.configureStorage({ autoSaveToFile: true });
                    await startAutoSave();
                }
            } catch (error) {
                console.warn('Failed to load existing OPFS data:', error);
            }
        }

        if(!selectedCharacterId) {
            openDialogueOption('storageControls');
        }
        
        addEventListener('beforeunload', onBeforeUnload);
    });


    function onBeforeUnload(e: BeforeUnloadEvent) {
        e.preventDefault();
        return '';
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

    {#if !selectedCharacterId}
        <div class="status-message">Welcome to Mutant: Year Zero Character Sheet! Create a new character or load an existing one from a file.</div>
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
    {:else if storageHandler.supportsOPFS}
    <div class="control-group">
        <h4><File size={16} /> Browser Storage:</h4>
        <div class="control-row">
            <div class="file-status">
                <span class="file-indicator"><SquareCheckBig color={"var(--color-success-700)"} /> Auto-saving to browser storage:</span>
                <span class="file-name">{currentFileName}</span>
            </div>
            <div class="help-text">
                All changes are automatically saved to secure browser storage. Data persists between sessions.
            </div>
        </div>
    </div>
    {:else}
    <div class="control-group">
        <h4><File size={16} /> File Auto-Save</h4>
        <div class="help-text">
            File auto-save not supported in this browser. Please use manual export/import or a modern browser.
        </div>
    </div>
    {/if}

    {/if}

    <!-- Load from File -->
    <div class="control-group">
        <h4><FileJson size={16} /> Load Character</h4>
        <div class="control-row">
            {#if storageHandler.supportsFileSystemAccess}
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="btn btn-outline" onclick={loadFromFileSystem}>
                    <File size={16} /> Load from File
                </button>
            </div>
            {:else if storageHandler.supportsOPFS}
            <div class="opfs-character-selector">
                {#if opfsCharacters.length > 0}
                <div class="character-dropdown">
                    <select 
                        bind:value={selectedOPFSCharacterId} 
                        onchange={() => loadOPFSCharacter(selectedOPFSCharacterId)}
                        class="character-select"
                    >
                        <option value="">Select a character...</option>
                        {#each opfsCharacters as character}
                        <option value={character.id}>
                            {character.name} - (modified: {new Date(character.lastModified).toLocaleDateString()})
                        </option>
                        {/each}
                    </select>
                </div>
                <div class="character-actions">
                    {#if selectedOPFSCharacterId}
                    <button 
                        class="btn w-full" 
                        onclick={() => deleteOPFSCharacter(selectedOPFSCharacterId)}
                        title="Delete selected character"
                    >
                        <Trash size={14} />
                    </button>
                    {/if}
                    <button 
                        class="btn w-full" 
                        onclick={refreshOPFSCharacters}
                        title="Refresh character list"
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
                {:else}
                <div class="no-characters">
                    <p>No characters found in browser storage.</p>
                    <button class="btn" onclick={refreshOPFSCharacters}>
                        <File size={16} /> Refresh
                    </button>
                </div>
                {/if}

            </div>
            {/if}
            {#if !storageHandler.supportsFileSystemAccess}
            <h4 class="mt-4"><FileUp size={16} /> Import/Export</h4>
            <div class="torn-paper-wrapper variant-7 btn-wrapper w-full ">
                <button class="btn btn-outline" onclick={importFromJSON}>
                    <FileUp size={16} /> Import JSON
                </button>
            </div>
            {#if selectedCharacterId}
            <div class="torn-paper-wrapper variant-7 btn-wrapper w-full">
                <button class="btn btn-outline" onclick={exportToJson}>
                    <FileDown size={16} /> Export to JSON
                </button>
            </div>
            {/if}
            {/if}
        </div>
        <div class="help-text">
            {#if storageHandler.supportsFileSystemAccess}
                Load a character file and automatically enable auto-save to that file.
            {:else if storageHandler.supportsOPFS}
                Select from saved characters in browser storage, or use JSON import/export for file management.
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

    /* OPFS Character Selector Styles */
    .opfs-character-selector {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .character-dropdown {
        position: relative;
        flex: 1;
    }

    .character-select {
        width: 100%;
        padding: 0.5rem 2rem 0.5rem 0.75rem;
        border: 1px solid var(--color-surface-300);
        border-radius: 0.5rem;
        background: var(--color-surface-50);
        color: var(--color-surface-900);
        font-size: 0.85rem;
        appearance: none;
        cursor: pointer;
    }

    :global(.dark) .character-select {
        background: var(--color-surface-800);
        color: var(--color-surface-100);
        border-color: var(--color-surface-600);
    }

    .character-select:focus {
        outline: none;
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .select-icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--color-surface-500);
    }

    .character-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        min-width: auto;
    }

    .btn-danger {
        background: var(--color-error-600);
        color: white;
        border: 1px solid var(--color-error-500);
    }

    .btn-danger:hover {
        background: var(--color-error-700);
        transform: translateY(-1px);
    }

    .no-characters {
        text-align: center;
        padding: 1rem;
        color: var(--color-surface-600);
    }

    .no-characters p {
        margin: 0 0 0.5rem 0;
        font-style: italic;
    }

    :global(.dark) .no-characters {
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
