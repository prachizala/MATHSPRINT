import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList, StudentTabParamList } from './types';
import { theme } from '../theme';

import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { JoinSprintScreen } from '../screens/student/JoinSprintScreen';
import { WaitingRoomScreen } from '../screens/student/WaitingRoomScreen';
import { LiveQuizScreen } from '../screens/student/LiveQuizScreen';
import { LeaderboardScreen } from '../screens/student/LeaderboardScreen';
import { FinalResultScreen } from '../screens/student/FinalResultScreen';
import { SolutionsScreen } from '../screens/student/SolutionsScreen';
import { PerformanceScreen } from '../screens/student/PerformanceScreen';
import { RecommendationsScreen } from '../screens/student/RecommendationsScreen';
import { HistoryScreen } from '../screens/student/HistoryScreen';
import { ProfileScreen } from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Join"
        component={JoinSprintScreen}
        options={{
          tabBarLabel: 'Join',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'keypad' : 'keypad-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Rankings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const StudentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="StudentTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tab Bar Shell */}
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />

      {/* Direct routes for compatibility */}
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <Stack.Screen name="JoinSprint" component={JoinSprintScreen} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
      <Stack.Screen name="LiveQuiz" component={LiveQuizScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="FinalResult" component={FinalResultScreen} />
      <Stack.Screen name="Solutions" component={SolutionsScreen} />
      <Stack.Screen name="Performance" component={PerformanceScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: Platform.OS === 'ios' ? 84 : 62,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...theme.shadows.sm,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
