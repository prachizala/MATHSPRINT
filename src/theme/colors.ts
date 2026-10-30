export const colors = {
  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',

  // Primary Text & Content
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E2E8F0',
  borderFocus: '#2563EB',
  borderLight: '#F1F5F9',

  // Brand & Accent Palette
  primary: '#2563EB',        // Electric Blue - Core actions, Sprints
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',

  cyan: '#06B6D4',           // Vibrant Cyan - Speed, real-time indicators
  cyanLight: '#ECFEFF',
  cyanDark: '#0E7490',

  purple: '#7C3AED',         // Royal Purple - Logic, streaks, rank
  purpleLight: '#F5F3FF',
  purpleDark: '#6D28D9',

  green: '#10B981',          // Emerald Green - Correct answers, fair-play shield
  greenLight: '#ECFDF5',
  greenDark: '#047857',

  orange: '#F97316',         // Energetic Orange - Battle excitement, warnings
  orangeLight: '#FFF7ED',
  orangeDark: '#C2410C',

  // Semantic
  success: '#10B981',
  successBackground: '#ECFDF5',
  warning: '#F59E0B',
  warningBackground: '#FFFBEB',
  danger: '#EF4444',
  dangerBackground: '#FEF2F2',
  info: '#3B82F6',
  infoBackground: '#EFF6FF',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.8)',
} as const;

export type ColorName = keyof typeof colors;
