<!--
Storage Controls Component
Provides UI controls for localStorage operations and JSON export/import
-->
<script lang="ts">
    import { useLocalStorage, useOwlbearSync, type CharacterData } from '../utils/owlbearIntegration'
    import { sheetState } from '../states/character_sheet.svelte';

    // Get character data function
    const getCharacterData = (): CharacterData => ({
        name: sheetState.name,
        baseAbilities: sheetState.baseAbilities,
        skills: sheetState.skills,
        conditions: sheetState.conditions
    });

    // Initialize storage utilities
    const localStorage = useLocalStorage(getCharacterData);
    const owlbearSync = useOwlbearSync(getCharacterData);

    let isAutoSaving = $state(false);
    let storageConfig = $state(localStorage.getStorageConfig());
    let importStatus = $state('');
    let exportStatus = $state('');

    // Auto-save toggle
    function toggleAutoSave() {
        if (isAutoSaving) {
            localStorage.stopAutoSave();
            owlbearSync.stopAutoSave();
            isAutoSaving = false;
        } else {
            localStorage.startAutoSave();
            owlbearSync.startAutoSave();
            isAutoSaving = true;
        }
    }

    // Manual save operations
    function saveToLocalStorage() {
        localStorage.save();
        exportStatus = 'Saved to localStorage';
        setTimeout(() => exportStatus = '', 3000);
    }

    function loadFromLocalStorage() {
        const data = localStorage.load();
        if (data) {
            // Apply loaded data to character sheet
            sheetState.name = data.name;
            sheetState.baseAbilities = data.baseAbilities;
            sheetState.skills = data.skills;
            sheetState.conditions = data.conditions;
            importStatus = 'Loaded from localStorage';
        } else {
            importStatus = 'No saved data found';
        }
        setTimeout(() => importStatus = '', 3000);
    }

    function clearLocalStorage() {
        localStorage.clear();
        exportStatus = 'localStorage cleared';
        setTimeout(() => exportStatus = '', 3000);
    }

    // JSON export/import
    function exportToJSON() {
        const filename = `${sheetState.name || 'unnamed'}-character-sheet.json`;
        localStorage.exportJSON(filename);
        exportStatus = 'Character sheet exported';
        setTimeout(() => exportStatus = '', 3000);
    }

    async function importFromJSON() {
        try {
            const data = await localStorage.importJSON();
            if (data) {
                // Apply imported data to character sheet
                sheetState.name = data.name;
                sheetState.baseAbilities = data.baseAbilities;
                sheetState.skills = data.skills;
                sheetState.conditions = data.conditions;
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
            sheetState.name = data.name;
            sheetState.baseAbilities = data.baseAbilities;
            sheetState.skills = data.skills;
            sheetState.conditions = data.conditions;
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
        localStorage.configureStorage({ autoSaveInterval: interval });
        storageConfig = localStorage.getStorageConfig();
        
        if (isAutoSaving) {
            // Restart auto-save with new interval
            toggleAutoSave();
            toggleAutoSave();
        }
    }
</script>

<div class="storage-controls">
    <h3 class="storage-title">💾 Storage & Backup</h3>
    
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
            <button 
                class="btn {isAutoSaving ? 'btn-danger' : 'btn-primary'}"
                onclick={toggleAutoSave}
            >
                {isAutoSaving ? '⏹️ Stop Auto-Save' : '▶️ Start Auto-Save'}
            </button>
            
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
        <h4>📡 Smart Save/Load {owlbearSync.isInOwlbear ? '(Owlbear + localStorage)' : '(localStorage only)'}</h4>
        <div class="control-row">
            <button class="btn btn-primary" onclick={saveUniversal}>
                💾 Smart Save
            </button>
            <button class="btn btn-secondary" onclick={loadUniversal}>
                📂 Smart Load
            </button>
        </div>
    </div>

    <!-- localStorage Controls -->
    <div class="control-group">
        <h4>🗄️ localStorage</h4>
        <div class="control-row">
            <button class="btn btn-outline" onclick={saveToLocalStorage}>
                💾 Save Local
            </button>
            <button class="btn btn-outline" onclick={loadFromLocalStorage}>
                📂 Load Local
            </button>
            <button class="btn btn-outline btn-danger" onclick={clearLocalStorage}>
                🗑️ Clear Local
            </button>
        </div>
    </div>

    <!-- JSON Export/Import -->
    <div class="control-group">
        <h4>📄 JSON Export/Import</h4>
        <div class="control-row">
            <button class="btn btn-outline" onclick={exportToJSON}>
                📤 Export JSON
            </button>
            <button class="btn btn-outline" onclick={importFromJSON}>
                📥 Import JSON
            </button>
        </div>
    </div>
</div>

<style>
    .storage-controls {
        background: var(--color-surface-100);
        border: 1px solid var(--color-surface-300);
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        font-family: inherit;
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
        color: var(--color-surface-700);
        font-weight: 500;
    }

    .control-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .btn {
        padding: 0.5rem 1rem;
        border: 1px solid transparent;
        border-radius: 4px;
        background: var(--color-surface-200);
        color: var(--color-surface-800);
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-primary {
        background: var(--color-primary-500);
        color: white;
    }

    .btn-primary:hover {
        background: var(--color-primary-600);
    }

    .btn-secondary {
        background: var(--color-secondary-500);
        color: white;
    }

    .btn-secondary:hover {
        background: var(--color-secondary-600);
    }

    .btn-outline {
        background: transparent;
        border-color: var(--color-surface-400);
    }

    .btn-outline:hover {
        background: var(--color-surface-200);
    }

    .btn-danger {
        background: var(--color-error-500);
        color: white;
    }

    .btn-danger:hover {
        background: var(--color-error-600);
    }

    .interval-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--color-surface-700);
    }

    .interval-input {
        width: 60px;
        padding: 0.25rem;
        border: 1px solid var(--color-surface-400);
        border-radius: 4px;
        text-align: center;
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

    /* Responsive design */
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
