import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

// This is a placeholder component for a more advanced game engine
// In a production app, you might use a more sophisticated game engine
// or implement more advanced game mechanics

interface GameEngineProps {
  children: React.ReactNode;
  running: boolean;
  onUpdate?: (deltaTime: number) => void;
}

export default function GameEngine({ children, running, onUpdate }: GameEngineProps) {
  const lastUpdateTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  const gameLoop = (time: number) => {
    if (lastUpdateTimeRef.current === 0) {
      lastUpdateTimeRef.current = time;
    }
    
    const deltaTime = time - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = time;
    
    if (running && onUpdate) {
      onUpdate(deltaTime);
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [running]);

  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});