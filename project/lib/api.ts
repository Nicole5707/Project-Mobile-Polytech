import { supabase, Player, GameScore, GameSettings } from './supabase';

// Player API
export const playerApi = {
  // Get current player
  getCurrentPlayer: async (): Promise<Player | null> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', session.session.user.id)
      .single();
      
    if (error) {
      console.error('Error fetching player:', error);
      return null;
    }
    
    return data;
  },
  
  // Create or update player
  upsertPlayer: async (username: string): Promise<Player | null> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('players')
      .upsert({
        id: session.session.user.id,
        username,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error upserting player:', error);
      return null;
    }
    
    return data;
  },
  
  // Sign in anonymously (for demo purposes)
  signInAnonymously: async (): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Error signing in anonymously:', error);
      return false;
    }
    
    // Create a default player record
    const username = `Player_${Math.floor(Math.random() * 10000)}`;
    await playerApi.upsertPlayer(username);
    
    return true;
  },
  
  // Sign out
  signOut: async (): Promise<void> => {
    await supabase.auth.signOut();
  },
};

// Game Scores API
export const scoresApi = {
  // Save a new score
  saveScore: async (score: number): Promise<GameScore | null> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        player_id: session.session.user.id,
        score,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error saving score:', error);
      return null;
    }
    
    return data;
  },
  
  // Get top scores
  getTopScores: async (limit = 10): Promise<GameScore[]> => {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*, player:players(username)')
      .order('score', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching top scores:', error);
      return [];
    }
    
    return data;
  },
  
  // Get player's best score
  getPlayerBestScore: async (): Promise<number> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return 0;
    
    const { data, error } = await supabase
      .from('game_scores')
      .select('score')
      .eq('player_id', session.session.user.id)
      .order('score', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      // If no scores yet, return 0
      if (error.code === 'PGRST116') return 0;
      
      console.error('Error fetching player best score:', error);
      return 0;
    }
    
    return data.score;
  },
};

// Game Settings API
export const settingsApi = {
  // Get player settings
  getSettings: async (): Promise<GameSettings | null> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .eq('player_id', session.session.user.id)
      .single();
      
    if (error) {
      // If no settings yet, create default settings
      if (error.code === 'PGRST116') {
        return settingsApi.updateSettings({
          sound_enabled: true,
          music_enabled: true,
          dark_mode: false,
        });
      }
      
      console.error('Error fetching settings:', error);
      return null;
    }
    
    return data;
  },
  
  // Update player settings
  updateSettings: async (settings: {
    sound_enabled?: boolean;
    music_enabled?: boolean;
    dark_mode?: boolean;
  }): Promise<GameSettings | null> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;
    
    const { data, error } = await supabase
      .from('game_settings')
      .upsert({
        player_id: session.session.user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error updating settings:', error);
      return null;
    }
    
    return data;
  },
};