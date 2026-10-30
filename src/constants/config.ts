import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const config = {
  appName: 'MATHSPRINT',
  tagline: 'Learn • Compete • Improve',
  sprintDurationSeconds: 120, // 2 minutes sprint battle
  pointsPerCorrectAnswer: 100,
  streakBonusMultiplier: 10,
  speedBonusMaxSeconds: 5,
  defaultQuestionCount: 15,
  
  // Firebase configuration
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.firebaseApiKey || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.firebaseAuthDomain || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.firebaseProjectId || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extra.firebaseStorageBucket || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extra.firebaseMessagingSenderId || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.firebaseAppId || '',
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || extra.firebaseDatabaseURL || '',
  },

  // Backend API URL
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  enableMockFallback: process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK !== 'false',
} as const;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    config.firebase.apiKey &&
    config.firebase.projectId &&
    config.firebase.apiKey !== 'your_firebase_api_key_here'
  );
};
