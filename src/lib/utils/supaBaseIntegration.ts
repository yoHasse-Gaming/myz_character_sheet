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
}

interface CharacterSheetRecord {
    id: string;
    room_id: string;
    player_id: string;
    data: CharacterSheetData;
    created_at: string;
    updated_at: string;
}

class SupabaseIntegration {
    private supabase: SupabaseClient | null = null;
    private isInitialized = false;

    constructor() {
        if (!config.url || !config.anonKey) {
            console.warn('Supabase integration disabled: credentials not configured');
            return;
        }
        console.log('Initializing Supabase with URL:', config.url);
        console.log('Supabase anon key:', config.anonKey ? '***' : 'not provided');
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
            
            // Try to restore session from room metadata
            const session = await this.getStoredSession();
            if (session) {
                console.log('Restoring Supabase session from room metadata');
                const { error } = await this.supabase!.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token
                });
                
                if (error) {
                    console.warn('Failed to restore session:', error);
                    await this.signInAnonymously();
                }
            } else {
                await this.signInAnonymously();
            }

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    }

    /**
     * Sign in anonymously and store session in room metadata
     */
    private async signInAnonymously(): Promise<void> {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data, error } = await this.supabase.auth.signInAnonymously();
        
        if (error) {
            throw new Error(`Anonymous sign in failed: ${error.message}`);
        }

        if (data.session) {
            await this.storeSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            });
        }
    }

    /**
     * Store session in Owlbear room metadata
     */
    private async storeSession(session: SupabaseSession): Promise<void> {
        if (!OBR.isAvailable) return;

        try {
            const metadata = await OBR.room.getMetadata();
            await OBR.room.setMetadata({
                ...metadata,
                'character-sheet.supabase-session': session
            });
        } catch (error) {
            console.warn('Failed to store session in room metadata:', error);
        }
    }

    /**
     * Get stored session from Owlbear room metadata
     */
    private async getStoredSession(): Promise<SupabaseSession | null> {
        if (!OBR.isAvailable) return null;

        try {
            const metadata = await OBR.room.getMetadata();
            const session = metadata['character-sheet.supabase-session'] as SupabaseSession;
            
            // Check if session is expired
            if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
                return null;
            }
            
            return session || null;
        } catch (error) {
            console.warn('Failed to get session from room metadata:', error);
            return null;
        }
    }

    /**
     * Save character sheet to Supabase
     */
    public async saveCharacterSheet(characterData: CharacterSheetData): Promise<boolean> {
        if (!this.isInitialized || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not in Owlbear environment');
            return false;
        }

        try {
            const roomId = OBR.room.id;
            const playerId = await OBR.player.getId();

            const record: Partial<CharacterSheetRecord> = {
                room_id: roomId,
                player_id: playerId,
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
        if (!this.isInitialized || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not in Owlbear environment');
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
        if (!this.isInitialized || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not in Owlbear environment');
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
                .eq('player_id', characterId)
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
        if (!this.isInitialized || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not in Owlbear environment');
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
        if (!this.isInitialized || !OBR.isAvailable || !this.supabase) {
            console.warn('Supabase not initialized or not in Owlbear environment');
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
        return this.isInitialized && OBR.isAvailable && this.supabase !== null;
    }

    /**
     * Sign out and clear session
     */
    public async signOut(): Promise<void> {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            }
            
            if (OBR.isAvailable) {
                const metadata = await OBR.room.getMetadata();
                const newMetadata = { ...metadata };
                delete newMetadata['character-sheet.supabase-session'];
                await OBR.room.setMetadata(newMetadata);
            }
            
            this.isInitialized = false;
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
}

// Export singleton instance
export const supabaseIntegration = new SupabaseIntegration();
export default supabaseIntegration;