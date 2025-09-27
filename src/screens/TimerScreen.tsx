import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Timer } from '../types/Timer';
import { TimerStorage } from '../services/TimerStorage';
import { formatTime, generateTimerId, parseTimeInput } from '../utils/timerUtils';

export default function TimerScreen() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerDuration, setNewTimerDuration] = useState('');

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(currentTimers => {
        let hasChanges = false;
        const updatedTimers = currentTimers.map(timer => {
          if (timer.isActive && timer.remainingTime > 0) {
            hasChanges = true;
            const newTimer = { ...timer, remainingTime: timer.remainingTime - 1 };
            if (newTimer.remainingTime === 0) {
              newTimer.isActive = false;
              Alert.alert('🐱 Meow!', `Timer "${timer.name}" has finished!`);
            }
            return newTimer;
          }
          return timer;
        });

        if (hasChanges) {
          TimerStorage.saveTimers(updatedTimers);
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadTimers = async () => {
    const savedTimers = await TimerStorage.getTimers();
    setTimers(savedTimers);
  };

  const addTimer = async () => {
    if (!newTimerName.trim() || !newTimerDuration.trim()) {
      Alert.alert('Error', 'Please enter both name and duration');
      return;
    }

    const duration = parseTimeInput(newTimerDuration);
    if (duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    const newTimer: Timer = {
      id: generateTimerId(),
      name: newTimerName.trim(),
      duration,
      isActive: false,
      remainingTime: duration,
      createdAt: new Date(),
    };

    await TimerStorage.addTimer(newTimer);
    setTimers([...timers, newTimer]);
    setNewTimerName('');
    setNewTimerDuration('');
  };

  const toggleTimer = async (timerId: string) => {
    const updatedTimers = timers.map(timer => {
      if (timer.id === timerId) {
        const updatedTimer = { ...timer, isActive: !timer.isActive };
        TimerStorage.updateTimer(updatedTimer);
        return updatedTimer;
      }
      return timer;
    });
    setTimers(updatedTimers);
  };

  const resetTimer = async (timerId: string) => {
    const updatedTimers = timers.map(timer => {
      if (timer.id === timerId) {
        const updatedTimer = {
          ...timer,
          isActive: false,
          remainingTime: timer.duration
        };
        TimerStorage.updateTimer(updatedTimer);
        return updatedTimer;
      }
      return timer;
    });
    setTimers(updatedTimers);
  };

  const deleteTimer = async (timerId: string) => {
    await TimerStorage.deleteTimer(timerId);
    setTimers(timers.filter(timer => timer.id !== timerId));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐱 Kitty Timer</Text>
      </View>

      <View style={styles.addTimerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Timer name (e.g., Study Time)"
          value={newTimerName}
          onChangeText={setNewTimerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (e.g., 25:00 or 1:30:00)"
          value={newTimerDuration}
          onChangeText={setNewTimerDuration}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTimer}>
          <Text style={styles.addButtonText}>Add Timer</Text>
        </TouchableOpacity>
      </View>

      {timers.map(timer => (
        <View key={timer.id} style={styles.timerCard}>
          <Text style={styles.timerName}>{timer.name}</Text>
          <Text style={[
            styles.timerTime,
            timer.remainingTime === 0 && styles.timerFinished
          ]}>
            {formatTime(timer.remainingTime)}
          </Text>
          <View style={styles.timerControls}>
            <TouchableOpacity
              style={[styles.controlButton, timer.isActive && styles.pauseButton]}
              onPress={() => toggleTimer(timer.id)}
            >
              <Text style={styles.controlButtonText}>
                {timer.isActive ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => resetTimer(timer.id)}
            >
              <Text style={styles.controlButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.deleteButton]}
              onPress={() => deleteTimer(timer.id)}
            >
              <Text style={styles.controlButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {timers.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            🐾 No timers yet! Add your first timer above.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  addTimerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timerTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4ecdc4',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  timerFinished: {
    color: '#ff6b6b',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#4ecdc4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#ffa726',
  },
  deleteButton: {
    backgroundColor: '#ef5350',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});