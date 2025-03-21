import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react-native';

interface GameControlsProps {
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

export default function GameControls({ onDirectionChange }: GameControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.upButton]} 
        onPress={() => onDirectionChange('UP')}
      >
        <ArrowUp size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.middleRow}>
        <TouchableOpacity 
          style={[styles.button, styles.leftButton]} 
          onPress={() => onDirectionChange('LEFT')}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.spacer} />
        
        <TouchableOpacity 
          style={[styles.button, styles.rightButton]} 
          onPress={() => onDirectionChange('RIGHT')}
        >
          <ArrowRight size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.downButton]} 
        onPress={() => onDirectionChange('DOWN')}
      >
        <ArrowDown size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  upButton: {
    marginBottom: 10,
  },
  downButton: {
    marginTop: 10,
  },
  leftButton: {
    marginRight: 10,
  },
  rightButton: {
    marginLeft: 10,
  },
  spacer: {
    width: 60,
    height: 60,
  },
});