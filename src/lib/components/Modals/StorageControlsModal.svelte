<!--
Storage Controls Modal
Provides a modal interface for all storage operations
-->
<script lang="ts">
    import { Modal } from "@skeletonlabs/skeleton-svelte";
    import { closeDialogueOption, isDialogueOpen, openDialogueOption } from "../../states/modals.svelte";
    import { onDestroy, onMount } from "svelte";
    import { Archive, File, FileDown, FileJson, FileUp, Save, SquareCheckBig, Trash, UserPen, ChevronDown, RefreshCcw, Cloud, User, LogOut, LogIn, ServerCog } from '@lucide/svelte';
    import { sheetState } from "../../states/character_sheet.svelte";
    import { storageHandler } from "../../utils/storageHandler";
    import { toaster } from '../../utils/toaster';
    import { SupabaseIntegration, supabaseIntegration, type StoragePreference } from '../../utils/supaBaseIntegration';
    import OBR from "@owlbear-rodeo/sdk";
    import type { User as SessionUser } from "@supabase/supabase-js";
    import { DiscordIcon } from "../icons";
    
    function closeModal() {
        closeDialogueOption('storageControls');
    }
    let currentFileName = $state('');
    let opfsCharacters = $state<{id: string, name: string, lastModified: string}[]>([]);
    let selectedOPFSCharacterId = $state('');
    let supabaseCharacters = $state<{id: string, name: string, playerId: string, lastModified: string}[]>([]);
    let selectedSupabaseCharacterId = $state('');
    let isSupabaseAvailable = $state(false);
    let currentUser = $state<SessionUser | null>(null);
    let authMethod = $state<'discord' | null>(null);
    let storagePreference = $state<StoragePreference | null>(null);
    let needsStorageSelection = $state(false);

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

    // Supabase functions
    async function initializeSupabase() {
        isSupabaseAvailable = await supabaseIntegration.initialize();
        
        if (isSupabaseAvailable) {
            await updateAuthStatus();
            await refreshSupabaseCharacters();
        }
    }

    async function refreshSupabaseCharacters() {
        if (isSupabaseAvailable && currentUser) {
            supabaseCharacters = await supabaseIntegration.getCharacterSheetList();
        }
    }

    async function saveToSupabase() {
        if (!isSupabaseAvailable) {
            toaster.create({
                title: 'Save Failed',
                description: 'Supabase not available.',
                duration: 5000,
                type: 'error'
            });
            return;
        }

        const success = await supabaseIntegration.saveCharacterSheet(sheetState);
        if (success) {
            await refreshSupabaseCharacters();
            toaster.create({
                title: 'Character Saved',
                description: 'Character saved to cloud.',
                duration: 5000,
                type: 'success'
            });
        } else {
            toaster.create({
                title: 'Save Failed',
                description: 'Failed to save character to cloud.',
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function loadFromSupabase(characterId: string) {
        if (!characterId || !isSupabaseAvailable) return;

        try {
            const data = await supabaseIntegration.loadCharacterSheet(characterId);
            if (data) {
                Object.assign(sheetState, data);
                selectedCharacterId = sheetState.id;
                selectedSupabaseCharacterId = characterId;
                
                toaster.create({
                    title: 'Character Loaded',
                    description: `Character "${data.name}" loaded from room storage.`,
                    duration: 10000,
                    type: 'success'
                });
            }
        } catch (error) {
            toaster.create({
                title: 'Load Failed',
                description: 'Failed to load character from room storage: ' + (error as Error).message,
                duration: 5000,
                type: 'error'
            });
        }
    }

    async function deleteFromSupabase(characterId: string) {
        if (!characterId || !isSupabaseAvailable) return;

        try {
            const success = await supabaseIntegration.deleteCharacterSheet(characterId);
            if (success) {
                await refreshSupabaseCharacters();
                
                toaster.create({
                    title: 'Character Deleted',
                    description: 'Character deleted from room storage.',
                    duration: 5000,
                    type: 'success'
                });
                
                // If we deleted the currently selected character, clear the selection
                if (selectedCharacterId === characterId) {
                    selectedCharacterId = '';
                    currentFileName = '';
                    selectedSupabaseCharacterId = '';
                }
            } else {
                toaster.create({
                    title: 'Delete Failed',
                    description: 'Failed to delete character from room storage.',
                    duration: 5000,
                    type: 'error'
                });
            }
        } catch (error) {
            toaster.create({
                title: 'Delete Failed',
                description: 'Failed to delete character from room storage: ' + (error as Error).message,
                duration: 5000,
                type: 'error'
            });
        }
    }

    // Discord authentication functions
    async function signInWithDiscord() {
        toaster.create({
            title: 'Opening Discord Login',
            description: 'A popup window will open for Discord authentication.',
            duration: 3000,
            type: 'info'
        });

        const success = await supabaseIntegration.signInWithDiscord();
        
        if (success) {
            // Update UI after successful authentication
            await updateAuthStatus();
            await refreshSupabaseCharacters();
            isSupabaseAvailable = true;
            
            toaster.create({
                title: 'Discord Login Successful',
                description: 'Successfully signed in with Discord. Cloud storage is now available.',
                duration: 5000,
                type: 'success'
            });
        } else {
            toaster.create({
                title: 'Discord Sign In Failed',
                description: 'Failed to complete Discord authentication. Please try again.',
                duration: 5000,
                type: 'error'
            });
            
            // If sign in failed and this was from storage preference selection, reset preference
            if (needsStorageSelection) {
                storagePreference = null;
                needsStorageSelection = true;
            }
        }
    }

    async function signOutSupabase() {
        await supabaseIntegration.signOut();
        isSupabaseAvailable = false;
        authMethod = null;
        supabaseCharacters = [];

        if(currentUser){
            currentUser = null;
            toaster.create({
                title: 'Signed Out',
                description: 'Signed out from cloud storage.',
                duration: 5000,
                type: 'info'
            });
        }

    }

    async function updateAuthStatus() {
        if (supabaseIntegration.isAvailable) {
            authMethod = supabaseIntegration.authMethod;
            currentUser = await supabaseIntegration.getCurrentUser();
        } else {
            authMethod = null;
            currentUser = null;
        }
    }

    // Storage preference functions
    async function selectStoragePreference(preference: StoragePreference) {
        SupabaseIntegration.setStoragePreference(preference);
        storagePreference = preference;
        needsStorageSelection = false;

        if (preference === 'discord') {
            toaster.create({
                title: 'Cloud Storage Selected',
                description: 'Characters will be saved in your cloud storage when signed in',
                duration: 5000,
                type: 'success'
            });
        } else if (preference === 'opfs') {
            toaster.create({
                title: 'Browser Storage Selected',
                description: 'Characters will be saved in your browser\'s local storage.',
                duration: 5000,
                type: 'success'
            });
        }
    }

    async function changeStoragePreference() {
        SupabaseIntegration.clearStoragePreference();
        storagePreference = null;
        needsStorageSelection = true;
        
        // Sign out from Supabase if currently signed in
        if (isSupabaseAvailable) {
            await signOutSupabase();
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
        // Check storage preference first
        storagePreference = SupabaseIntegration.getStoragePreference();
        
        // If in Owlbear environment and no storage preference set, user needs to choose
        if (OBR.isAvailable && !storagePreference) {
            needsStorageSelection = true;
        }
        
        // Initialize Supabase if in Owlbear environment
        if (OBR.isAvailable) {
            await initializeSupabase();
        }
        
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

        if(!selectedCharacterId || needsStorageSelection) {
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
    contentBase="!z-[101] card p-0 shadow-xl max-w-2xl max-h-[90vh]"
    positionerClasses="!z-[100] items-center justify-center p-4 fixed inset-0"
    closeOnInteractOutside={selectedCharacterId !== '' && !needsStorageSelection}
    closeOnEscape={selectedCharacterId !== '' && !needsStorageSelection}

>
{#snippet content()}

    <div class="p-4 max-h-[90vh] overflow-y-auto">
        {#if selectedCharacterId !== '' && !needsStorageSelection}
        <button 
            class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10" 
            onclick={closeModal} 
            aria-label="Stäng storlekskontroller"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-gray-400">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        {/if}
    <div class="torn-paper-wrapper variant-1">
        <div class="card-content">
            <div class="rounded-lg p-4 my-4">
    <div class="mb-4">
        <span class="text-primary-600 dark:text-primary-400 text-lg font-semibold flex items-center gap-2">
        {#if storagePreference === 'discord'}
            <Cloud size={16} /> Cloud Storage
        {:else if storagePreference === 'opfs'}
            <File size={16} /> Local Storage
        {:else}
            <Save /> File Storage & Backup
        {/if}
        </span>
        
        
    </div>
    <!-- Storage Preference Selection -->
    {#if needsStorageSelection}
        <div class="p-2 rounded mb-4 text-sm font-medium italic">Welcome to Mutant: Year Zero Character Sheet! Before creating a new character, please select your preferred storage option.</div>
    {/if}
    {#if needsStorageSelection && OBR.isAvailable}
    <div class="mb-4">
        <h4 class="text-base font-medium mb-4">Choose Your Storage Option</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button 
                    class="flex flex-col items-center gap-4 p-6 rounded-lg text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 text-center min-h-[160px] z-[1] w-full" 
                    onclick={() => selectStoragePreference('opfs')}
                >
                    <div class="text-primary-600 dark:text-primary-400">
                        <File size={32} />
                    </div>
                    <div class="space-y-2">
                        <h5 class="text-lg font-semibold text-gray-900 dark:text-gray-100 m-0">Store in Browser</h5>
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed m-0">Save characters locally in your browser's storage. Data stays on this device only.</p>
                    </div>
                </button>
            </div>
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
            
                <button 
                    class="flex flex-col items-center gap-4 p-6 rounded-lg text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 text-center min-h-[160px] z-[1] w-full" 
                    onclick={() => selectStoragePreference('discord')}
                >
                    <div class="text-primary-600 dark:text-primary-400">
                        <Cloud size={32} />
                    </div>
                    <div class="space-y-2">
                        <h5 class="text-lg font-semibold text-gray-900 dark:text-gray-100 m-0">Cloud Storage</h5>
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed m-0">Sign in with Discord and sync characters across devices and with your gaming group.</p>
                    </div>
                </button>
            </div>
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-200 mt-1 italic">
            You can change this preference later in the storage settings.
        </div>
    </div>

    {/if}


    <!-- Supabase Room Storage (Owlbear Only) -->
    {#if OBR.isAvailable && storagePreference === 'discord' && !needsStorageSelection}
    <div class="mb-4">
        
        <div class="flex gap-2 items-center flex-wrap">
            {#if currentUser}
                <hr class="border-none border-t border-gray-300 dark:border-gray-600 my-2 w-full" />

                <!-- Authentication Status -->
                <div class="flex mt-4 w-full mb-2">
                    <div class="flex items-center justify-center gap-2 p-4 rounded-lg text-sm w-full">
                        
                        <span class="flex-1 font-medium z-[1]">Signed in as: {currentUser?.user_metadata?.full_name || currentUser?.email || 'Discord User'} <DiscordIcon size={16} /></span>
                        <div class="flex-1">
                        <div class="torn-paper-wrapper variant-7 btn-wrapper">
                            <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" onclick={signOutSupabase} title="Sign out">
                                <LogOut size={14} /> Sign out
                            </button>
                        </div>
                        <div class="torn-paper-wrapper variant-7 btn-wrapper">
                            <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" onclick={changeStoragePreference}><ServerCog size={14} /> Change type</button>
                        </div>
                        </div>
                    </div>
                </div>
                <hr class="border-none border-t border-gray-300 dark:border-gray-600 my-2 w-full" />
                {#if selectedCharacterId}
                <div class="torn-paper-wrapper variant-7 btn-wrapper">
                    <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" onclick={saveToSupabase}>
                        <Cloud size={16} /> Save to Cloud
                    </button>
                </div>
                {/if}
                
                <div class="flex flex-col gap-2 w-full">
                    {#if supabaseCharacters.length > 0}
                    <div class="relative flex-1">
                        <select 
                            bind:value={selectedSupabaseCharacterId} 
                            onchange={() => loadFromSupabase(selectedSupabaseCharacterId)}
                            class="w-full py-2 pr-8 pl-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-primary-500 text-gray-900 dark:text-gray-100 text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                        >
                            <option value="">Select a character from cloud storage...</option>
                            {#each supabaseCharacters as character}
                            <option value={character.id}>
                                {character.name} - Player: {character.playerId} - (modified: {new Date(character.lastModified).toLocaleDateString()})
                            </option>
                            {/each}
                        </select>
                    </div>
                    <div class="flex gap-2 items-center">
                        {#if selectedSupabaseCharacterId}
                        <button 
                            class="px-2 py-1 text-xs min-w-0 bg-red-600 text-white border border-red-500 rounded-2xl cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:bg-red-700 hover:transform hover:-translate-y-0.5" 
                            onclick={() => deleteFromSupabase(selectedSupabaseCharacterId)}
                            title="Delete selected character"
                        >
                            <Trash size={14} />
                        </button>
                        {/if}
                        <button 
                            class="px-2 py-1 text-xs min-w-0 rounded-2xl cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" 
                            onclick={refreshSupabaseCharacters}
                            title="Refresh character list"
                        >
                            <RefreshCcw size={16} />
                        </button>
                    </div>
                    {:else}
                    <div class="text-center p-4 text-gray-600 dark:text-gray-200">
                        <p class="mb-2 italic m-0">No characters found in cloud storage.</p>
                        {#if selectedCharacterId}
                        <div class="torn-paper-wrapper variant-7 btn-wrapper">
                            <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" onclick={saveToSupabase}>
                                <Cloud size={16} /> Save Current Character
                            </button>
                        </div>
                        {/if}
                        <div class="torn-paper-wrapper variant-7 btn-wrapper">
                            <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" onclick={refreshSupabaseCharacters}>
                                <RefreshCcw size={16} /> Refresh
                            </button>
                        </div>
                        
                    </div>
                    {/if}
                </div>
            {:else}
                <div class="text-center p-2">
                    <p class="mb-2 italic m-0">Sign in to access cloud storage and character sheets.</p>
                    <div class="flex gap-2">
                        <div class="torn-paper-wrapper variant-7 btn-wrapper">
                            <button class="flex flex-col items-center gap-4 p-6 rounded-lg text-gray-900 dark:text-gray-100 cursor-pointer transition-all duration-200 text-center min-h-[160px] z-[1]" onclick={signInWithDiscord}>
                                <DiscordIcon size={42} />
                                Sign in with Discord
                            </button>
                        </div>
                        <!-- Optional: Add more options in the future -->

                    </div>
                </div>
            {/if}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-200 mt-1 italic">
            {#if isSupabaseAvailable}
                Share character sheets that are connected to your account.
            {:else}
                Connect to cloud storage to access your character sheets.
            {/if}
        </div>
    </div>
    {/if}

    {#if !selectedCharacterId && !needsStorageSelection && currentUser}
    <hr class="border-none border-t border-gray-300 dark:border-gray-600 my-2 w-full" />

    <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"><Archive size={16} /> Character</h4>
        <div class="flex gap-2 items-center flex-wrap">
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button 
                    class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md"
                    onclick={createNewCharacter}
                >
                <UserPen size={20} /> Create New Character
                </button>
            </div>
        </div>
    </div>
    {/if}

    {#if selectedCharacterId && !needsStorageSelection && (!OBR.isAvailable || storagePreference === 'opfs')}
    <!-- File Auto-save Status -->
    {#if storageHandler.supportsFileSystemAccess}
    <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"><File size={16} /> File:</h4>
        <div class="flex gap-2 items-center flex-wrap">

            <div class="flex flex-col gap-1 p-2 rounded-lg w-full">
                <span class="text-sm text-green-700 dark:text-green-400 font-semibold flex items-center gap-2"><SquareCheckBig color={"var(--color-success-700)"} /> Auto-saving to:</span>
                <span class="text-xs text-gray-600 dark:text-gray-200 italic overflow-hidden text-ellipsis whitespace-nowrap">{currentFileName}</span>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-200 mt-1 italic">
                All changes are automatically saved to your file. No manual saving needed!
            </div>

        </div>
    </div>
    {:else if storageHandler.supportsOPFS}
    <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"><File size={16} /> Browser Storage:</h4>
        <div class="flex gap-2 items-center flex-wrap">
            <div class="flex flex-col gap-1 p-2 rounded-lg w-full">
                <span class="text-sm text-green-700 dark:text-green-400 font-semibold flex items-center gap-2"><SquareCheckBig color={"var(--color-success-700)"} /> Auto-saving to browser storage:</span>
                <span class="text-xs text-gray-600 dark:text-gray-200 italic overflow-hidden text-ellipsis whitespace-nowrap">{currentFileName}</span>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-200 mt-1 italic">
                All changes are automatically saved to secure browser storage. Data persists between sessions.
            </div>
        </div>
    </div>
    {:else}
    <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"><File size={16} /> File Auto-Save</h4>
        <div class="text-xs text-gray-600 dark:text-gray-200 mt-1 italic">
            File auto-save not supported in this browser. Please use manual export/import or a modern browser.
        </div>
    </div>
    {/if}

    {/if}

    <!-- Load from File -->
    {#if !needsStorageSelection && (!OBR.isAvailable || storagePreference === 'opfs')}
    <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2"><FileJson size={16} /> Load Character</h4>
        <div class="flex gap-2 items-center flex-wrap">
            {#if storageHandler.supportsFileSystemAccess}
            <div class="torn-paper-wrapper variant-7 btn-wrapper">
                <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md border border-gray-300 dark:border-gray-600" onclick={loadFromFileSystem}>
                    <File size={16} /> Load from File
                </button>
            </div>
            {:else if storageHandler.supportsOPFS}
            <div class="flex flex-col gap-2 w-full">
                {#if opfsCharacters.length > 0}
                <div class="relative flex-1">
                    <select 
                        bind:value={selectedOPFSCharacterId} 
                        onchange={() => loadOPFSCharacter(selectedOPFSCharacterId)}
                        class="w-full py-2 pr-8 pl-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                    >
                        <option value="">Select a character...</option>
                        {#each opfsCharacters as character}
                        <option value={character.id}>
                            {character.name} - (modified: {new Date(character.lastModified).toLocaleDateString()})
                        </option>
                        {/each}
                    </select>
                </div>
                <div class="flex gap-2 items-center">
                    {#if selectedOPFSCharacterId}
                    <button 
                        class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md w-full" 
                        onclick={() => deleteOPFSCharacter(selectedOPFSCharacterId)}
                        title="Delete selected character"
                    >
                        <Trash size={14} />
                    </button>
                    {/if}
                    <button 
                        class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md w-full" 
                        onclick={refreshOPFSCharacters}
                        title="Refresh character list"
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
                {:else}
                <div class="text-center p-4 text-gray-600 dark:text-gray-200">
                    <p class="mb-2 italic m-0">No characters found in browser storage.</p>
                    <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md" onclick={refreshOPFSCharacters}>
                        <File size={16} /> Refresh
                    </button>
                </div>
                {/if}

            </div>
            {/if}
            {#if !storageHandler.supportsFileSystemAccess}
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2 mt-4"><FileUp size={16} /> Import/Export</h4>
            <div class="torn-paper-wrapper variant-7 btn-wrapper w-full ">
                <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md border border-gray-300 dark:border-gray-600" onclick={importFromJSON}>
                    <FileUp size={16} /> Import JSON
                </button>
            </div>
            {#if selectedCharacterId}
            <div class="torn-paper-wrapper variant-7 btn-wrapper w-full">
                <button class="px-4 py-2 rounded-2xl text-sm cursor-pointer transition-all duration-200 whitespace-nowrap z-[1] hover:transform hover:-translate-y-0.5 hover:shadow-md border border-gray-300 dark:border-gray-600" onclick={exportToJson}>
                    <FileDown size={16} /> Export to JSON
                </button>
            </div>
            {/if}
            {/if}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-200 mt-1 italic">
            {#if storageHandler.supportsFileSystemAccess}
                Load a character file and automatically enable auto-save to that file.
            {:else if storageHandler.supportsOPFS}
                Select from saved characters in browser storage, or use JSON import/export for file management.
            {:else}
                Use the file picker to import a character JSON file.
            {/if}
        </div>
    </div>
    {/if}




    </div>

    </div>
    </div>
    </div>

    {/snippet}
</Modal>



<style>
    /* Keep only essential custom styles that don't have Tailwind equivalents */
    
    .storage-content {
        container-type: inline-size;
    }
    
    span {
        z-index: 1;
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
