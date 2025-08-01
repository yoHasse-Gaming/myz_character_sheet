/**
 * Supabase Integration for Owlbear Character Sheets
 * Handles authentication, session management, and character sheet storage for Owlbear rooms
 */

import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import OBR from '@owlbear-rodeo/sdk';
import type { CharacterSheetData } from '../states/character_sheet.svelte';
import { getSupabaseConfig } from './supabaseConfig';

// Get Supabase configuration
const config = getSupabaseConfig();

interface SupabaseSession {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    user_id?: string;
    auth_method?: 'anonymous' | 'discord';
}

interface CharacterSheetRecord {
    id: string;
    room_id: string;
    player_id: string;
    owner_id?: string; // Supabase user ID for authenticated users
    data: CharacterSheetData;
    created_at: string;
    updated_at: string;
}

export type StoragePreference = 'opfs' | 'discord';

export class SupabaseIntegration {
    private supabase: SupabaseClient | null = null;
    private isInitialized = false;
    private currentAuthMethod: 'discord' | null = null;

    constructor() {
        if (!config.url || !config.anonKey) {
            console.warn('Supabase integration disabled: credentials not configured');
            return;
        }
        this.supabase = createClient(config.url, config.anonKey);
    }

    /**
     * Check if Supabase client is available
     */
    private get hasValidClient(): boolean {
        return this.supabase !== null;
    }

    /**
     * Initialize Supabase integration for Owlbear rooms
     * Only initializes the client, does not authenticate
     */
    public async initialize(): Promise<boolean> {
        if (!OBR.isAvailable) {
            console.warn('Supabase integration only available in Owlbear environment');
            return false;
        }

        if (!this.supabase) {
            console.warn('Supabase client not initialized - check credentials');
            return false;
        }

        try {
            await new Promise<void>((resolve) => {
                if (OBR.isReady) {
                    resolve();
                } else {
                    OBR.onReady(() => resolve());
                }
            });

            // Check if we have a stored Discord session
            const storedSession = await this.getStoredSession();
            if (storedSession && storedSession.auth_method === 'discord') {
                try {
                    const { error } = await this.supabase.auth.setSession({
                        access_token: storedSession.access_token,
                        refresh_token: storedSession.refresh_token
                    });
                    
                    if (!error) {
                        this.currentAuthMethod = 'discord';
                        this.isInitialized = true;
                        console.log('Restored Discord session from storage');
                        return true;
                    }
                } catch (error) {
                    console.warn('Failed to restore stored session:', error);
                    // Clear invalid session
                    localStorage.removeItem('supabase-session');
                }
            }

            // Client is initialized but not authenticated
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    }

    /**
     * Sign in with Discord OAuth using popup with postMessage
     */
    public async signInWithDiscord(): Promise<boolean> {
        if (!this.supabase) {
            console.warn('Supabase client not initialized');
            return false;
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: { 
                    redirectTo: window.location.origin + '/oauth-callback.html',
                    skipBrowserRedirect: true 
                }
            });

            if (error) {
                console.error('Discord sign in failed:', error);
                return false;
            }

            const popup = window.open(data.url, 'discord-login', 'width=600,height=800,scrollbars=yes,resizable=yes');

            return new Promise((resolve) => {
                // Listen for messages from the popup
                const messageHandler = async (event: MessageEvent) => {
                    if (event.data?.type === 'SUPABASE_SESSION') {
                        console.log('Received session from popup:', event.data.session);
                        
                        try {
                            // Set the session in the iframe's Supabase client
                            const { error: sessionError } = await this.supabase!.auth.setSession(event.data.session);
                            
                            if (!sessionError) {
                                this.currentAuthMethod = 'discord';
                                this.isInitialized = true;
                                
                                await this.storeSession({
                                    access_token: event.data.session.access_token,
                                    refresh_token: event.data.session.refresh_token,
                                    expires_at: event.data.session.expires_at,
                                    user_id: event.data.session.user.id,
                                    auth_method: 'discord'
                                });
                                
                                console.log('Successfully set Discord session in iframe');
                                resolve(true);
                            } else {
                                console.error('Failed to set session:', sessionError);
                                resolve(false);
                            }
                        } catch (error) {
                            console.error('Error setting session:', error);
                            resolve(false);
                        }
                        
                        popup?.close();
                        window.removeEventListener('message', messageHandler);
                    } else if (event.data?.type === 'SUPABASE_AUTH_ERROR') {
                        console.error('OAuth error from popup:', event.data.error);
                        popup?.close();
                        window.removeEventListener('message', messageHandler);
                        resolve(false);
                    } else if (event.data?.type === 'SUPABASE_AUTH_TIMEOUT') {
                        console.warn('OAuth timeout from popup');
                        popup?.close();
                        window.removeEventListener('message', messageHandler);
                        resolve(false);
                    }
                };

                window.addEventListener('message', messageHandler);

                // Fallback: if popup is closed manually, clean up
                const checkClosed = setInterval(() => {
                    if (popup?.closed) {
                        clearInterval(checkClosed);
                        window.removeEventListener('message', messageHandler);
                        resolve(false);
                    }
                }, 1000);
            });
        } catch (error) {
            console.error('Error during Discord sign in:', error);
            return false;
        }
    }

    /**
     * Handle OAuth callback (legacy method - now mainly used for direct URL callbacks)
     * The main OAuth flow now uses postMessage from the popup
     */
    public async handleOAuthCallback(): Promise<boolean> {
        if (!this.supabase) {
            return false;
        }

        try {
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Failed to get session after OAuth:', error);
                return false;
            }

            if (data.session) {
                this.currentAuthMethod = 'discord';
                this.isInitialized = true;
                
                await this.storeSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                    user_id: data.session.user.id,
                    auth_method: 'discord'
                });
                
                return true;
            }
        } catch (error) {
            console.error('Error handling OAuth callback:', error);
        }
        
        return false;
    }

    /**
     * Store session in localStorage only
     */
    private async storeSession(session: SupabaseSession): Promise<void> {
        try {
            localStorage.setItem('supabase-session', JSON.stringify(session));
        } catch (error) {
            console.warn('Failed to store session in localStorage:', error);
        }
    }

    /**
     * Get stored session from localStorage only
     */
    private async getStoredSession(): Promise<SupabaseSession | null> {
        try {
            const sessionStr = localStorage.getItem('supabase-session');
            if (!sessionStr) return null;
            
            const session = JSON.parse(sessionStr) as SupabaseSession;
            
            // Check if session is expired
            if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
                localStorage.removeItem('supabase-session');
                return null;
            }
            
            return session || null;
        } catch (error) {
            console.warn('Failed to get session from localStorage:', error);
            return null;
        }
    }

    /**
     * Get current Supabase session
     */
    private async getCurrentSession() {
        if (!this.supabase) return null;
        
        try {
            const { data } = await this.supabase.auth.getSession();
            return data.session;
        } catch (error) {
            console.warn('Failed to get current session:', error);
            return null;
        }
    }

    /**
     * Save character sheet to Supabase
     */
    public async saveCharacterSheet(characterData: CharacterSheetData): Promise<boolean> {
        if (!this.isDiscordAuthenticated || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not authenticated with Discord');
            return false;
        }

        try {
            const roomId = OBR.room.id;
            const playerId = await OBR.player.getId();
            const session = await this.getCurrentSession();

            const record: Partial<CharacterSheetRecord> = {
                room_id: roomId,
                player_id: playerId,
                owner_id: session?.user?.id,
                data: characterData,
                updated_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('myz_character_sheets')
                .upsert(record, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('Failed to save character sheet:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error saving character sheet:', error);
            return false;
        }
    }

    /**
     * Load character sheets from Supabase based on player role
     */
    public async loadCharacterSheets(): Promise<CharacterSheetData[]> {
        if (!this.isDiscordAuthenticated || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not authenticated with Discord');
            return [];
        }

        try {
            const roomId = OBR.room.id;
            const playerId = await OBR.player.getId();
            const playerRole = await OBR.player.getRole();

            let query = this.supabase
                .from('myz_character_sheets')
                .select('*')
                .eq('room_id', roomId)
                .eq('player_id', playerId);

            // If player is not GM, only load their own character sheet
            // if (playerRole !== 'GM') {
            //     query = query.eq('player_id', playerId);
            // }

            const { data, error } = await query;

            if (error) {
                console.error('Failed to load character sheets:', error);
                return [];
            }

            return data?.map(record => record.data) || [];
        } catch (error) {
            console.error('Error loading character sheets:', error);
            return [];
        }
    }

    /**
     * Load a specific character sheet by ID
     */
    public async loadCharacterSheet(characterId: string): Promise<CharacterSheetData | null> {
        if (!this.isDiscordAuthenticated || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not authenticated with Discord');
            return null;
        }

        try {
            const roomId = OBR.room.id;
            const playerId = await OBR.player.getId();
            const playerRole = await OBR.player.getRole();

            let query = this.supabase
                .from('myz_character_sheets')
                .select('*')
                .eq('room_id', roomId)
                .eq('player_id', playerId)
                .single();

            const { data, error } = await query;

            if (error) {
                console.error('Failed to load character sheet:', error);
                return null;
            }

            // Check if player has permission to access this character sheet
            if (playerRole !== 'GM' && data.player_id !== playerId) {
                console.warn('Player does not have permission to access this character sheet');
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Error loading character sheet:', error);
            return null;
        }
    }

    /**
     * Delete a character sheet from Supabase
     */
    public async deleteCharacterSheet(characterId: string): Promise<boolean> {
        if (!this.isDiscordAuthenticated || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not authenticated with Discord');
            return false;
        }

        try {
            const roomId = OBR.room.id;
            const playerId = await OBR.player.getId();
            const playerRole = await OBR.player.getRole();

            // First check if the character exists and if player has permission
            const { data: existingData, error: fetchError } = await this.supabase
                .from('myz_character_sheets')
                .select('player_id')
                .eq('room_id', roomId)
                .eq('id', characterId)
                .single();

            if (fetchError) {
                console.error('Failed to fetch character sheet for deletion check:', fetchError);
                return false;
            }

            // Check permissions
            if (playerRole !== 'GM' && existingData.player_id !== playerId) {
                console.warn('Player does not have permission to delete this character sheet');
                return false;
            }

            const { error } = await this.supabase
                .from('myz_character_sheets')
                .delete()
                .eq('room_id', roomId)
                .eq('id', characterId);

            if (error) {
                console.error('Failed to delete character sheet:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting character sheet:', error);
            return false;
        }
    }

    /**
     * Get list of character sheets in the current room
     */
    public async getCharacterSheetList(): Promise<Array<{id: string, name: string, playerId: string, lastModified: string}>> {
        if (!this.isDiscordAuthenticated || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not authenticated with Discord');
            return [];
        }

        try {
            const roomId = OBR.room.id;
            const playerId = await OBR.player.getId();
            const playerRole = await OBR.player.getRole();

            let query = this.supabase
                .from('myz_character_sheets')
                .select('id, player_id, data, updated_at')
                .eq('room_id', roomId);

            // If player is not GM, only show their own character sheets
            if (playerRole !== 'GM') {
                query = query.eq('player_id', playerId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Failed to get character sheet list:', error);
                return [];
            }

            return data?.map(record => ({
                id: record.id,
                name: record.data.name || 'Unnamed Character',
                playerId: record.player_id,
                lastModified: record.updated_at
            })) || [];
        } catch (error) {
            console.error('Error getting character sheet list:', error);
            return [];
        }
    }

    /**
     * Check if Supabase is available and initialized
     */
    public get isAvailable(): boolean {
        return this.isDiscordAuthenticated && OBR.isAvailable && this.supabase !== null;
    }

    /**
     * Get current authentication method
     */
    public get authMethod(): 'discord' | null {
        return this.currentAuthMethod;
    }

    /**
     * Get current user information
     */
    public async getCurrentUser() {
        const session = await this.getCurrentSession();
        return session?.user || null;
    }

    /**
     * Check if user is authenticated with Discord
     */
    public get isDiscordAuthenticated(): boolean {
        return this.currentAuthMethod === 'discord';
    }


    /**
     * Sign out and clear session
     */
    public async signOut(): Promise<void> {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            }
            
            // Clear session from localStorage
            localStorage.removeItem('supabase-session');
            
            this.isInitialized = false;
            this.currentAuthMethod = null;
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    /**
     * Storage preference management
     */
    public static getStoragePreference(): StoragePreference | null {
        try {
            const pref = localStorage.getItem('storage-preference');
            return pref as StoragePreference | null;
        } catch (error) {
            console.warn('Failed to get storage preference:', error);
            return null;
        }
    }

    public static setStoragePreference(preference: StoragePreference): void {
        try {
            localStorage.setItem('storage-preference', preference);
        } catch (error) {
            console.warn('Failed to set storage preference:', error);
        }
    }

    public static clearStoragePreference(): void {
        try {
            localStorage.removeItem('storage-preference');
        } catch (error) {
            console.warn('Failed to clear storage preference:', error);
        }
    }

    /**
     * Check if storage preference has been set
     */
    public static hasStoragePreference(): boolean {
        return this.getStoragePreference() !== null;
    }
}

// Export singleton instance
export const supabaseIntegration = new SupabaseIntegration();
export default supabaseIntegration;