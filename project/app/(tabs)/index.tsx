import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthProvider';
import { scoresApi } from '../../lib/api';

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 20;
const GAME_SPEED = 150;

// Direction constants
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export default function GameScreen() {
  const router = useRouter();
  const { isAuthenticated, username, signIn } = useAuth();
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication and load high score
  useEffect(() => {
    if (!isAuthenticated) {
      // Auto sign in for demo purposes
      signIn();
    } else {
      loadHighScore();
    }
  }, [isAuthenticated]);

  const loadHighScore = async () => {
    if (isAuthenticated) {
      const bestScore = await scoresApi.getPlayerBestScore();
      setHighScore(bestScore);
    }
  };

  // Initialize game
  useEffect(() => {
    startGame();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameOver && !isPaused) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [snake, gameOver, isPaused]);

  const startGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    
    // Make sure food doesn't spawn on snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (isOnSnake) return generateFood();
    
    return newFood;
  };

  const moveSnake = () => {
    if (gameOver || isPaused) return;

    const head = { ...snake[0] };
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y,
    };

    // Check for collisions
    if (
      newHead.x < 0 || 
      newHead.x >= GRID_SIZE || 
      newHead.y < 0 || 
      newHead.y >= GRID_SIZE ||
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      handleGameOver();
      return;
    }

    // Check if snake eats food
    const newSnake = [newHead, ...snake];
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood());
      setScore(prevScore => prevScore + 10);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const handleGameOver = async () => {
    setGameOver(true);
    
    // Save score to database if authenticated
    if (isAuthenticated && score > 0) {
      try {
        await scoresApi.saveScore(score);
        
        // Update high score if current score is higher
        if (score > highScore) {
          setHighScore(score);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  const changeDirection = (newDirection: typeof direction) => {
    // Prevent 180-degree turns
    const isOppositeDirection = 
      (direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
      (direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
      (direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
      (direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT);

    if (!isOppositeDirection) {
      setDirection(newDirection);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const renderGrid = () => {
    const grid = [];
    
    // Create grid cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;
        
        let cellStyle = [styles.cell];
        if (isSnake) cellStyle.push(styles.snakeCell);
        if (isHead) cellStyle.push(styles.snakeHead);
        if (isFood) cellStyle.push(styles.foodCell);
        
        grid.push(
          <View 
            key={`${x}-${y}`} 
            style={[
              ...cellStyle,
              {
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }
            ]} 
          />
        );
      }
    }
    
    return grid;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snake Game</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.highScore}>High Score: {highScore}</Text>
      </View>
      
      {username && (
        <Text style={styles.playerName}>Player: {username}</Text>
      )}
      
      <View style={[styles.gameBoard, { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }]}>
        {renderGrid()}
      </View>
      
      {gameOver ? (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => changeDirection(DIRECTIONS.UP)}
            >
              <ArrowUp size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.horizontalControls}>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => changeDirection(DIRECTIONS.LEFT)}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => changeDirection(DIRECTIONS.DOWN)}
              >
                <ArrowDown size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => changeDirection(DIRECTIONS.RIGHT)}
              >
                <ArrowRight size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
            {isPaused ? (
              <Play size={24} color="#fff" />
            ) : (
              <Pause size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    color: '#475569',
  },
  highScore: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  gameBoard: {
    backgroundColor: '#e2e8f0',
    borderWidth: 2,
    borderColor: '#94a3b8',
    position: 'relative',
    marginBottom: 30,
  },
  cell: {
    position: 'absolute',
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  snakeCell: {
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  snakeHead: {
    backgroundColor: '#1d4ed8',
    borderRadius: 5,
  },
  foodCell: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
  },
  controls: {
    alignItems: 'center',
    marginTop: 10,
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#3b82f6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  pauseButton: {
    backgroundColor: '#4b5563',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});