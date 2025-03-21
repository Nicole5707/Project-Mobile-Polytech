import { Tabs } from 'expo-router';
import { Play, Trophy, Settings } from 'lucide-react-native';
import ProfileSetup from '../../components/ProfileSetup';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#f8fafc',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
          },
          headerStyle: {
            backgroundColor: '#f8fafc',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#1e293b',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Play',
            tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Leaderboard',
            tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
      <ProfileSetup />
    </>
  );
}