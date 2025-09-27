import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timer, TimerSettings } from '../types/Timer';

const TIMERS_KEY = 'kitty_timers';
const SETTINGS_KEY = 'kitty_timer_settings';

export class TimerStorage {
  static async getTimers(): Promise<Timer[]> {
    try {
      const timersJson = await AsyncStorage.getItem(TIMERS_KEY);
      if (timersJson) {
        const timers = JSON.parse(timersJson);
        return timers.map((timer: any) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading timers:', error);
      return [];
    }
  }

  static async saveTimers(timers: Timer[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  }

  static async addTimer(timer: Timer): Promise<void> {
    const timers = await this.getTimers();
    timers.push(timer);
    await this.saveTimers(timers);
  }

  static async updateTimer(updatedTimer: Timer): Promise<void> {
    const timers = await this.getTimers();
    const index = timers.findIndex(timer => timer.id === updatedTimer.id);
    if (index !== -1) {
      timers[index] = updatedTimer;
      await this.saveTimers(timers);
    }
  }

  static async deleteTimer(timerId: string): Promise<void> {
    const timers = await this.getTimers();
    const filteredTimers = timers.filter(timer => timer.id !== timerId);
    await this.saveTimers(filteredTimers);
  }

  static async getSettings(): Promise<TimerSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return {
        soundEnabled: true,
        vibrationEnabled: true,
        theme: 'light',
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        soundEnabled: true,
        vibrationEnabled: true,
        theme: 'light',
      };
    }
  }

  static async saveSettings(settings: TimerSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}