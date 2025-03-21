import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { scoresApi } from '../../lib/api';
import { GameScore } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

export default function LeaderboardScreen() {
  const { isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [isAuthenticated]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const scores = await scoresApi.getTopScores(20);
      setLeaderboard(scores);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: GameScore; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{index + 1}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.player?.username || 'Unknown Player'}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{item.score}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      
      <View style={styles.headerRow}>
        <View style={styles.rankContainer}>
          <Text style={styles.headerText}>Rank</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.headerText}>Player</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.headerText}>Score</Text>
        </View>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scores yet. Be the first to play!</Text>
            </View>
          }
        />
      )}
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
    textAlign: 'center',
    color: '#1e293b',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#cbd5e1',
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#475569',
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rankContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    color: '#1e293b',
  },
  scoreContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});