<!--
Cloud Storage Integration Component
Provides UI for connecting to Google Drive and OneDrive
-->
<script lang="ts">
    import { onMount } from 'svelte';
    import { storageHandler } from '../utils/storageHandler';
    import { sheetState, type CharacterSheet } from '../states/character_sheet.svelte';
    import { Cloud, CloudDownload, CloudUpload, LogIn, LogOut, User } from '@lucide/svelte';

    // Cloud storage state

    type CharacterSheetFile = {
        id: string;
        name: string;
        source: string;
        lastModified: string;
    };


    let isGoogleDriveReady = $state(false);
    let isOneDriveReady = $state(false);
    let isCloudConnected = $state(false);
    let cloudUser: any | null = $state(null);
    let cloudProvider = $state('none');
    let cloudCharacters: CharacterSheetFile[] = $state([]);
    let statusMessage = $state('');
    let isLoading = $state(false);

    // Initialize cloud storage options
    onMount(async () => {
        await checkCloudStatus();
    });

    async function checkCloudStatus() {
        cloudProvider = storageHandler.cloudProviderName;
        isCloudConnected = storageHandler.isCloudAvailable;
        cloudUser = storageHandler.getCloudUser();
        
        if (isCloudConnected) {
            await loadCloudCharacters();
        }
    }

    async function initializeGoogleDrive() {
        isLoading = true;
        statusMessage = 'Initializing Google Drive...';
        
        try {
            const success = await storageHandler.initializeGoogleDrive();
            if (success) {
                isGoogleDriveReady = true;
                statusMessage = 'Google Drive initialized. Please sign in.';
            } else {
                statusMessage = 'Failed to initialize Google Drive.';
            }
        } catch (error) {
            statusMessage = 'Error initializing Google Drive: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    async function initializeOneDrive() {
        isLoading = true;
        statusMessage = 'Initializing OneDrive...';
        
        try {
            const success = await storageHandler.initializeOneDrive();
            if (success) {
                isOneDriveReady = true;
                statusMessage = 'OneDrive initialized. Please sign in.';
            } else {
                statusMessage = 'Failed to initialize OneDrive.';
            }
        } catch (error) {
            statusMessage = 'Error initializing OneDrive: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    async function signInToGoogleDrive() {
        isLoading = true;
        statusMessage = 'Signing in to Google Drive...';
        
        try {
            const success = await storageHandler.signInToGoogleDrive();
            if (success) {
                await checkCloudStatus();
                statusMessage = 'Successfully signed in to Google Drive!';
            } else {
                statusMessage = 'Failed to sign in to Google Drive.';
            }
        } catch (error) {
            statusMessage = 'Error signing in: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    async function signInToOneDrive() {
        isLoading = true;
        statusMessage = 'Signing in to OneDrive...';
        
        try {
            const success = await storageHandler.signInToOneDrive();
            if (success) {
                await checkCloudStatus();
                statusMessage = 'Successfully signed in to OneDrive!';
            } else {
                statusMessage = 'Failed to sign in to OneDrive.';
            }
        } catch (error) {
            statusMessage = 'Error signing in: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    async function signOut() {
        isLoading = true;
        statusMessage = 'Signing out...';
        
        try {
            await storageHandler.signOutFromCloud();
            await checkCloudStatus();
            cloudCharacters = [];
            statusMessage = 'Successfully signed out.';
        } catch (error) {
            statusMessage = 'Error signing out: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    async function loadCloudCharacters() {
        if (!isCloudConnected) return;
        
        try {
            cloudCharacters = await storageHandler.getCloudCharacters();
        } catch (error) {
            console.error('Failed to load cloud characters:', error);
        }
    }

    async function loadFromCloud(characterId: string) {
        isLoading = true;
        statusMessage = 'Loading character from cloud...';
        
        try {
            const data = await storageHandler.loadFromCloud(characterId);
            if (data) {
                // Apply loaded data to character sheet
                Object.assign(sheetState, data);
                statusMessage = `Character loaded from ${cloudProvider}!`;
            } else {
                statusMessage = 'Failed to load character from cloud.';
            }
        } catch (error) {
            statusMessage = 'Error loading character: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    async function syncToCloud() {
        if (!isCloudConnected) return;
        
        isLoading = true;
        statusMessage = 'Syncing to cloud...';
        
        try {
            await storageHandler.save(); // This will trigger cloud sync if enabled
            await loadCloudCharacters(); // Refresh the list
            statusMessage = `Character synced to ${cloudProvider}!`;
        } catch (error) {
            statusMessage = 'Error syncing to cloud: ' + (error as Error).message;
        } finally {
            isLoading = false;
            setTimeout(() => statusMessage = '', 3000);
        }
    }

    function toggleCloudSync() {
        const currentConfig = storageHandler.getStorageConfig();
        storageHandler.configureStorage({ 
            syncWithCloud: !currentConfig.syncWithCloud 
        });
    }
</script>

<div class="cloud-storage-panel">
    <h3 class="cloud-title">
        <Cloud size={20} />
        Cloud Storage
    </h3>

    <!-- Status Message -->
    {#if statusMessage}
        <div class="status-message" class:loading={isLoading}>
            {statusMessage}
        </div>
    {/if}

    <!-- Cloud Provider Selection -->
    {#if !isCloudConnected}
        <div class="cloud-providers">
            <h4>Choose Cloud Provider</h4>
            
            <div class="provider-buttons">
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-primary provider-btn"
                        onclick={initializeGoogleDrive}
                        disabled={isLoading}
                    >
                        <CloudUpload size={16} />
                        Google Drive
                    </button>
                </div>
                
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-primary provider-btn"
                        onclick={initializeOneDrive}
                        disabled={isLoading}
                    >
                        <CloudUpload size={16} />
                        OneDrive
                    </button>
                </div>
            </div>

            <!-- Sign-in buttons (shown after initialization) -->
            {#if isGoogleDriveReady}
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-success"
                        onclick={signInToGoogleDrive}
                        disabled={isLoading}
                    >
                        <LogIn size={16} />
                        Sign in to Google Drive
                    </button>
                </div>
            {/if}

            {#if isOneDriveReady}
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-success"
                        onclick={signInToOneDrive}
                        disabled={isLoading}
                    >
                        <LogIn size={16} />
                        Sign in to OneDrive
                    </button>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Connected State -->
        <div class="cloud-connected">
            <div class="user-info">
                <User size={16} />
                <span>Signed in as: <strong>{cloudUser?.name || cloudUser?.username}</strong></span>
                <span class="provider-name">({cloudProvider})</span>
            </div>

            <div class="cloud-actions">
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-primary"
                        onclick={syncToCloud}
                        disabled={isLoading}
                    >
                        <CloudUpload size={16} />
                        Sync Current Character
                    </button>
                </div>

                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-secondary"
                        onclick={loadCloudCharacters}
                        disabled={isLoading}
                    >
                        <CloudDownload size={16} />
                        Refresh List
                    </button>
                </div>

                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button 
                        class="btn btn-danger"
                        onclick={signOut}
                        disabled={isLoading}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>

            <!-- Auto-sync toggle -->
            <div class="auto-sync">
                <label class="sync-toggle">
                    <input 
                        type="checkbox" 
                        checked={storageHandler.getStorageConfig().syncWithCloud}
                        onchange={toggleCloudSync}
                    />
                    Automatically sync to cloud
                </label>
            </div>

            <!-- Cloud Characters List -->
            {#if cloudCharacters.length > 0}
                <div class="cloud-characters">
                    <h4>Characters in {cloudProvider}</h4>
                    <div class="characters-list">
                        {#each cloudCharacters as character}
                            <div class="character-item">
                                <div class="character-info">
                                    <span class="character-name">{character.name}</span>
                                    <span class="character-date">
                                        {new Date(character.lastModified).toLocaleDateString()}
                                    </span>
                                </div>
                                <div class="torn-paper-wrapper variant-7 btn-wrapper small">
                                    <button 
                                        class="btn btn-sm"
                                        onclick={() => loadFromCloud(character.id)}
                                        disabled={isLoading}
                                    >
                                        <CloudDownload size={12} />
                                        Load
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .cloud-storage-panel {
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .cloud-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: bold;
    }

    .status-message {
        background: rgba(0, 123, 255, 0.1);
        border: 1px solid rgba(0, 123, 255, 0.3);
        border-radius: 4px;
        padding: 0.5rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
        font-size: 0.9rem;
    }

    .status-message.loading {
        background: rgba(255, 193, 7, 0.1);
        border-color: rgba(255, 193, 7, 0.3);
    }

    .provider-buttons {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .provider-btn {
        min-width: 120px;
    }

    .cloud-connected {
        space-y: 1rem;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid rgba(40, 167, 69, 0.3);
        border-radius: 4px;
        color: var(--text-primary);
    }

    .provider-name {
        color: var(--text-secondary);
        font-size: 0.85rem;
    }

    .cloud-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .auto-sync {
        margin-bottom: 1rem;
    }

    .sync-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary);
        cursor: pointer;
    }

    .cloud-characters {
        margin-top: 1rem;
    }

    .characters-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
    }

    .character-item {
        display: flex;
        justify-content: between;
        align-items: center;
        padding: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .character-item:last-child {
        border-bottom: none;
    }

    .character-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .character-name {
        color: var(--text-primary);
        font-weight: 500;
    }

    .character-date {
        color: var(--text-secondary);
        font-size: 0.8rem;
    }

    h4 {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    /* Button styling adjustments */
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
    }

    .small .btn-wrapper {
        min-width: auto;
    }
</style>
