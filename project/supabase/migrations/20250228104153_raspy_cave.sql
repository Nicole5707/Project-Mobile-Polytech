/*
  # Initial database schema for Snake Game

  1. New Tables
    - `players`
      - `id` (uuid, primary key) - matches auth.users.id
      - `username` (text, not null)
      - `created_at` (timestamptz)
    - `game_scores`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players.id)
      - `score` (integer, not null)
      - `created_at` (timestamptz)
    - `game_settings`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players.id)
      - `sound_enabled` (boolean, default true)
      - `music_enabled` (boolean, default true)
      - `dark_mode` (boolean, default false)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Allow public read access to leaderboard data
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create game_scores table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create game_settings table
CREATE TABLE IF NOT EXISTS game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) UNIQUE,
  sound_enabled BOOLEAN DEFAULT true,
  music_enabled BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- Players table policies
CREATE POLICY "Players can read their own data"
  ON players
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can update their own data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can insert their own data"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Game scores policies
CREATE POLICY "Players can read their own scores"
  ON game_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert their own scores"
  ON game_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Anyone can read all scores for leaderboard"
  ON game_scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Game settings policies
CREATE POLICY "Players can read their own settings"
  ON game_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can update their own settings"
  ON game_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert their own settings"
  ON game_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS game_scores_player_id_idx ON game_scores(player_id);
CREATE INDEX IF NOT EXISTS game_scores_score_idx ON game_scores(score DESC);