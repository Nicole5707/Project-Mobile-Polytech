import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { Volume2, Volume1, VolumeX, Moon, Sun, CircleHelp as HelpCircle, User, LogOut } from 'lucide-react-native';
import { useAuth } from '../../components/AuthProvider';
import { settingsApi } from '../../lib/api';

export default function SettingsScreen() {
  const { username, updateUsername, signOut } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Load settings from database
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await settingsApi.getSettings();
      
      if (settings) {
        setSoundEnabled(settings.sound_enabled);
        setMusicEnabled(settings.music_enabled);
        setDarkMode(settings.dark_mode);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    await settingsApi.updateSettings({ sound_enabled: newValue });
  };
  
  const toggleMusic = async () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    await settingsApi.updateSettings({ music_enabled: newValue });
  };
  
  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await settingsApi.updateSettings({ dark_mode: newValue });
  };
  
  const showHelp = () => {
    Alert.alert(
      "How to Play",
      "Use the arrow buttons to control the snake. Eat the red food to grow longer. Avoid hitting the walls or yourself. The game gets faster as your score increases!",
      [{ text: "Got it!" }]
    );
  };
  
  const resetHighScores = () => {
    Alert.alert(
      "Reset High Scores",
      "Are you sure you want to reset all high scores? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            // In a real app, this would clear scores from storage
            Alert.alert("Success", "High scores have been reset.");
          }
        }
      ]
    );
  };

  const startEditUsername = () => {
    setNewUsername(username || '');
    setEditingUsername(true);
  };

  const saveUsername = async () => {
    if (newUsername.trim().length > 0) {
      try {
        await updateUsername(newUsername.trim());
        setEditingUsername(false);
        Alert.alert("Success", "Username updated successfully!");
      } catch (error) {
        console.error('Error updating username:', error);
        Alert.alert("Error", "Failed to update username. Please try again.");
      }
    } else {
      Alert.alert("Error", "Username cannot be empty.");
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.loadingContainer}>
          <Text>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        {editingUsername ? (
          <View style={styles.usernameEditContainer}>
            <TextInput
              style={styles.usernameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              autoFocus
            />
            <View style={styles.usernameButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditingUsername(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={saveUsername}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <User size={24} color="#475569" />
              <Text style={styles.settingText}>Username: {username}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={startEditUsername}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.signOutButton]} 
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            {soundEnabled ? (
              <Volume2 size={24} color="#475569" />
            ) : (
              <VolumeX size={24} color="#475569" />
            )}
            <Text style={styles.settingText}>Sound Effects</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
            thumbColor={soundEnabled ? "#2563eb" : "#f1f5f9"}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            {musicEnabled ? (
              <Volume1 size={24} color="#475569" />
            ) : (
              <VolumeX size={24} color="#475569" />
            )}
            <Text style={styles.settingText}>Background Music</Text>
          </View>
          <Switch
            value={musicEnabled}
            onValueChange={toggleMusic}
            trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
            thumbColor={musicEnabled ? "#2563eb" : "#f1f5f9"}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            {darkMode ? (
              <Moon size={24} color="#475569" />
            ) : (
              <Sun size={24} color="#475569" />
            )}
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
            thumbColor={darkMode ? "#2563eb" : "#f1f5f9"}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game</Text>
        
        <TouchableOpacity style={styles.button} onPress={showHelp}>
          <HelpCircle size={20} color="#fff" />
          <Text style={styles.buttonText}>How to Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={resetHighScores}>
          <Text style={styles.buttonText}>Reset High Scores</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Snake Game v1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Snake Game</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#475569',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  signOutButton: {
    backgroundColor: '#64748b',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  version: {
    fontSize: 14,
    color: '#64748b',
  },
  copyright: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameEditContainer: {
    marginBottom: 15,
  },
  usernameInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  usernameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#64748b',
    marginRight: 10,
  },
  editButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#475569',
    fontWeight: '500',
  },
});