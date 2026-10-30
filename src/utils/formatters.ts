export const formatTimer = (seconds: number): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTime = formatTimer;

export const formatPoints = (points: number): string => {
  return `${points.toLocaleString()} pts`;
};

export const formatAccuracy = (accuracy: number): string => {
  return `${Math.round(accuracy)}%`;
};

export const formatPinCode = (code: string): string => {
  const clean = code.replace(/\D/g, '');
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)}`;
};

export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};
