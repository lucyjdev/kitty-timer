export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export const generateTimerId = (): string => {
  return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const parseTimeInput = (input: string): number => {
  const parts = input.split(':').map(part => parseInt(part, 10));

  if (parts.length === 1) {
    // Just seconds
    return parts[0] || 0;
  } else if (parts.length === 2) {
    // Minutes:Seconds
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    // Hours:Minutes:Seconds
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }

  return 0;
};