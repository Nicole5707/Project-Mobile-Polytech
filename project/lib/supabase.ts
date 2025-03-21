import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use environment variables in a real app
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// SecureStore is not available on web, so we need to use localStorage
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our database tables
export type Player = {
  id: string;
  username: string;
  created_at: string;
};

export type GameScore = {
  id: string;
  player_id: string;
  score: number;
  created_at: string;
  player?: Player;
};

export type GameSettings = {
  id: string;
  player_id: string;
  sound_enabled: boolean;
  music_enabled: boolean;
  dark_mode: boolean;
  updated_at: string;
};