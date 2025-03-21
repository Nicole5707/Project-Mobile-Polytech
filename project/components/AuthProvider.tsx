import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { playerApi } from '../lib/api';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  username: null,
  signIn: async () => {},
  signOut: async () => {},
  updateUsername: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    checkUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
        
        if (session) {
          const player = await playerApi.getCurrentPlayer();
          setUsername(player?.username || null);
        } else {
          setUsername(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        const player = await playerApi.getCurrentPlayer();
        setUsername(player?.username || null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      await playerApi.signInAnonymously();
      const player = await playerApi.getCurrentPlayer();
      setUsername(player?.username || null);
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await playerApi.signOut();
      setUsername(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (newUsername: string) => {
    try {
      const player = await playerApi.upsertPlayer(newUsername);
      setUsername(player?.username || null);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        signIn,
        signOut,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
});