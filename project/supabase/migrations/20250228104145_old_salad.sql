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
      - `soun <boltArtifact id="snake-game-database-api" title="Add Database and API Integration to Snake Game">