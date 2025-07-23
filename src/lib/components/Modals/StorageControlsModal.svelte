<!--
Storage Controls Modal
Provides a modal interface for all storage operations
-->
<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { closeDialogueOption, isDialogueOpen, openDialogueOption } from "../../states/modals.svelte";
    import { onDestroy, onMount } from "svelte";
        import ConfirmationModal from './ConfirmationModal.svelte';
    import { Archive, BrainCircuit, File, FileDown, FileJson, FileUp, FolderDown, Play, Save, Square, Trash, UserPen } from '@lucide/svelte';
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

        // Auto-save toggle
    function toggleAutoSave() {
        if (isAutoSaving) {
            stopAutoSave();

        } else {
            startAutoSave();
        }
    }

    function startAutoSave() {
        storageHandler.startAutoSave();
        isAutoSaving = true;
        localStorage.setItem('autoSave', 'true');
    }

    function stopAutoSave() {
        storageHandler.stopAutoSave();
        isAutoSaving = false;
        localStorage.setItem('autoSave', 'false');
    }

    // File auto-save functions
    async function setupFileAutoSave() {
        if (!storageHandler.supportsFileSystemAccess) {
            exportStatus = 'File System Access API not supported in this browser. Please use Chrome, Edge, or another compatible browser.';
            setTimeout(() => exportStatus = '', 5000);
            return;
        }

        const success = await storageHandler.selectFileForAutoSave(sheetState);
        if (success) {
            isAutoSavingToFile = true;
            storageHandler.configureStorage({ autoSaveToFile: true });
            exportStatus = 'File selected for auto-save. Changes will automatically save to your chosen file.';
            
            // Update current file name for display
            if (storageHandler.hasActiveFile) {
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
            }
        } else {
            exportStatus = 'Failed to set up file auto-save.';
        }
        setTimeout(() => exportStatus = '', 3000);
    }

    function stopFileAutoSave() {
        storageHandler.configureStorage({ autoSaveToFile: false });
        storageHandler.clearFileHandle();
        isAutoSavingToFile = false;
        currentFileName = '';
        exportStatus = 'File auto-save disabled.';
        setTimeout(() => exportStatus = '', 3000);
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
                await save();
                
                // Enable file auto-save since we now have a file handle
                isAutoSavingToFile = true;
                storageHandler.configureStorage({ autoSaveToFile: true });
                currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
                
                importStatus = 'Character loaded from file and file auto-save enabled.';
            }
        } catch (error) {
            importStatus = 'Failed to load from file: ' + (error as Error).message;
        }
        setTimeout(() => importStatus = '', 5000);
    }


    // JSON export/import
    function exportToJSON() {
        const filename = `${sheetState.name || 'unnamed'}-character-sheet.json`;
        storageHandler.exportToJSON(sheetState, filename);
        exportStatus = 'Character sheet exported';
        setTimeout(() => exportStatus = '', 3000);
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
                await save();
            } else {
                importStatus = 'Import cancelled';
            }
        } catch (error) {
            importStatus = 'Import failed: ' + (error as Error).message;
        }
        setTimeout(() => importStatus = '', 5000);
    }

    // Universal save/load (localStorage + Owlbear)
    async function save() {
        await storageHandler.save();
        exportStatus = OBR.isAvailable ? 
            'Saved to Owlbear and localStorage' : 
            'Saved to localStorage';
        setTimeout(() => exportStatus = '', 3000);
    }

    let characters: { id: string, name: string, occupation: string }[] = $state([]);
    let selectedCharacterId: string = $state('');
    
    async function createNewCharacter() {
        // Generate a new ID using crypto if it doesn't exist
        sheetState.id = crypto.randomUUID();
        sheetState.name = 'Ny karaktär'; // Default name
        sheetState.occupation = 'Krossare'; // Default occupation
        await save(); // Save the new character
        characters.push({
            id: sheetState.id,
            name: sheetState.name,
            occupation: sheetState.occupation || ''
        });
        selectedCharacterId = sheetState.id; // Select the new character
        importStatus = 'En ny karaktär har skapats och sparats.';
    }

    async function load(characterId: string = '') {

        if (!characterId) {
            const storedCharacters = await storageHandler.getStoredCharacters();
            if (storedCharacters.length === 0) {
                importStatus = 'Välkommen till Mutant: År noll karaktärsblad! Det finns inga tidigare sparade karaktärer. Välj nedan om du önskar att skapa en ny karaktär eller ladda in en tidigare sparad karaktär via JSON import.';
                return;
            } else {
                console.log('Loaded stored characters:', storedCharacters);
                characters = storedCharacters;
                selectedCharacterId = characters[0].id;
            }
        }else {
            selectedCharacterId = characterId;
        }

        const data: CharacterSheetData | null = await storageHandler.load(selectedCharacterId);

        if (!data) {
            importStatus = 'Inget data hittades för vald karaktär.';
            return;
        }
        // Apply loaded data to character sheet - include all fields
        Object.assign(sheetState, data);
        importStatus = OBR.isAvailable ? 
            'Loaded from Owlbear (or localStorage fallback)' : 
            'Loaded from localStorage';
        setTimeout(() => importStatus = '', 3000);
    }

    // Update storage configuration
    function updateAutoSaveInterval(event: Event) {
        const target = event.target as HTMLInputElement;
        const interval = parseInt(target.value) * 1000; // Convert seconds to milliseconds
        storageHandler.configureStorage({ autoSaveInterval: interval });

        if (isAutoSaving) {
            // Restart auto-save with new interval
            stopAutoSave();
            startAutoSave();
        }
    }
    // Delete character
    async function clearAllData() {
        const confirmed = confirm('Are you sure you want to clear all stored data?');
        if (!confirmed) return;

        await storageHandler.resetData();
        characters = [];
        selectedCharacterId = '';
    }


    onMount(async () => {
        // Ensure the modal is closed when the component mounts
        if(localStorage.getItem('autoSave') === null) {
            localStorage.setItem('autoSave', selectedCharacterId !== '' ? 'true' : 'false');
        }
        isAutoSaving = localStorage.getItem('autoSave') === 'true';
        
        // Check if file auto-save was previously enabled
        isAutoSavingToFile = storageConfig.autoSaveToFile || false;
        if (isAutoSavingToFile && storageHandler.hasActiveFile) {
            currentFileName = `${sheetState.name || 'unnamed'}-character-sheet.json`;
        }
        
        addEventListener('beforeunload', onBeforeUnload);
        
        if(OBR.isAvailable) {
            OBR.onReady(async () => {

                await load(); // Wait for OBR to be ready before loading data
                if(!selectedCharacterId) {
                    // If no character is selected, load the first available character
                    openDialogueOption('storageControls');

                }
                if (isAutoSaving) {
                    startAutoSave();
                }
            });
        }else {
            // If Owlbear is not available, just load from localStorage immediately
            await load();
            if (!selectedCharacterId) {
                // If no character is selected, load the first available character
                openDialogueOption('storageControls');
            }
            if (isAutoSaving) {
                startAutoSave();
            }
        }

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
    <h3 class="storage-title"><Save /> Storage & Backup</h3>

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

    <div class="control-group">
        <h4><Archive size={16} /> Stored Characters</h4>
        <div class="control-row">
            {#if characters.length === 0}
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn "
                        onclick={createNewCharacter}
                    >
                    <UserPen size={20} /> Skapa ny karaktär
                    </button>
                </div>
            {:else}
                <select 
                    bind:value={selectedCharacterId} 
                    onchange={() => load(selectedCharacterId)}
                    class="character-select"
                >
                    <option value="" disabled>Select a character</option>
                    {#each characters as character}
                        <option value={character.id} selected={true}>{character.name} - {character.occupation}</option>
                    {/each}
                </select>
            {/if}

        </div>
    </div>

    {#if selectedCharacterId}
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

    <!-- File Auto-save Controls -->
    {#if storageHandler.supportsFileSystemAccess}
    <div class="control-group">
        <h4><File size={16} /> Auto-Save to Local File</h4>
        <div class="control-row">
            {#if !isAutoSavingToFile}
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-primary"
                        onclick={setupFileAutoSave}
                    >
                        <FileDown size={16} /> Set Up File Auto-Save
                    </button>
                </div>
            {:else}
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-danger"
                        onclick={stopFileAutoSave}
                    >
                        <Square size={16} /> Stop File Auto-Save
                    </button>
                </div>
                {#if currentFileName}
                    <span class="file-name">Saving to: {currentFileName}</span>
                {/if}
            {/if}
        </div>
        <div class="help-text">
            Similar to draw.io: Select a file once, and all changes will automatically save to that file.
        </div>
    </div>
    {:else}
    <div class="control-group">
        <h4><File size={16} /> Auto-Save to Local File</h4>
        <div class="help-text">
            File System Access API not supported in this browser. Please use Chrome, Edge, or another compatible browser for this feature.
        </div>
    </div>
    {/if}

    <!-- Universal Save/Load (Best of both worlds) -->
    <div class="control-group">
        <h4><BrainCircuit size={16} /> Manual Save/Load {OBR.isAvailable ? '(Owlbear + localStorage)' : '(localStorage only)'}</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper w250">
                <button class="btn" onclick={save}>
                    <Save size={16} /> Save Character
                </button>
            </div>
            <div class="torn-paper-wrapper variant-7 btn-wrapper w250">
                <button class="btn" onclick={() => load(selectedCharacterId)}>
                    <FolderDown size={16} /> Load Character
                </button>
            </div>
        </div>
        
    </div>

    {/if}

    <!-- JSON Export/Import -->
    <div class="control-group">
        <h4><FileJson size={16} /> JSON Export/Import</h4>
        <div class="control-row">
            {#if selectedCharacterId}
            <div class="torn-paper-wrapper variant-7 btn-wrapper w250">
            <button class="btn btn-outline" onclick={exportToJSON}>
                <FileDown size={16} /> Export JSON
            </button>
            </div>
            {/if}
            <div class="torn-paper-wrapper variant-7 btn-wrapper {selectedCharacterId ? 'w250' : ''}">
            
            <button class="btn btn-outline" onclick={importFromJSON}>
                <FileUp size={16} /> Import JSON
            </button>
            </div>
            {#if storageHandler.supportsFileSystemAccess}
            <div class="torn-paper-wrapper variant-7 btn-wrapper w250">
                <button class="btn btn-outline" onclick={loadFromFileSystem}>
                    <File size={16} /> Load from File
                </button>
            </div>
            {/if}
        </div>
    </div>

    <!-- Clear All Data -->
    <div class="control-group">
        <h4><Trash size={16} /> Clear All Data</h4>
        <div class="control-row">
            <div class="torn-paper-wrapper variant-7 btn-wrapper w-full">
                <button class="btn btn-danger" onclick={clearAllData}>
                    <Trash size={16} /> Clear All Stored Data
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

    .w250 {
        min-width: 250px;
        width: 250px;
    }

    .btn-danger {
        filter: sepia(100%) saturate(200%) brightness(80%) hue-rotate(300deg);
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

    :global(.dark) .interval-control {
        color: var(--color-surface-100);
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
        font-style: italic;
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

    .file-name {
        font-size: 0.8rem;
        color: var(--color-surface-600);
        font-style: italic;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(.dark) .file-name {
        color: var(--color-surface-400);
    }

    .help-text {
        font-size: 0.75rem;
        color: var(--color-surface-600);
        margin-top: 0.25rem;
        font-style: italic;
    }

    :global(.dark) .help-text {
        color: var(--color-surface-400);
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
