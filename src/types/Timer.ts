export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  isActive: boolean;
  remainingTime: number;
  createdAt: Date;
}

export interface TimerSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark';
}