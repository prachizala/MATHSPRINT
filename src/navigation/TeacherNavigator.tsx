import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TeacherStackParamList, TeacherTabParamList } from './types';
import { theme } from '../theme';

import { TeacherDashboardScreen } from '../screens/teacher/TeacherDashboardScreen';
import { CreateSprintScreen } from '../screens/teacher/CreateSprintScreen';
import { SprintSettingsScreen } from '../screens/teacher/SprintSettingsScreen';
import { LobbyScreen } from '../screens/teacher/LobbyScreen';
import { LiveMonitoringScreen } from '../screens/teacher/LiveMonitoringScreen';
import { ResultsScreen } from '../screens/teacher/ResultsScreen';
import { AnalyticsScreen } from '../screens/teacher/AnalyticsScreen';
import { QuestionBankScreen } from '../screens/teacher/QuestionBankScreen';
import { AiGeneratorScreen } from '../screens/teacher/AiGeneratorScreen';
import { TeacherHistoryScreen } from '../screens/teacher/TeacherHistoryScreen';
import { TeacherProfileScreen } from '../screens/teacher/TeacherProfileScreen';

const Tab = createBottomTabNavigator<TeacherTabParamList>();
const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TeacherTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.purple,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TeacherDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sprints"
        component={TeacherHistoryScreen}
        options={{
          tabBarLabel: 'Sprints',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flash' : 'flash-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={TeacherProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const TeacherNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TeacherTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tab Shell */}
      <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} />

      {/* Direct routes for compatibility and nested actions */}
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
      <Stack.Screen name="CreateSprint" component={CreateSprintScreen} />
      <Stack.Screen name="SprintSettings" component={SprintSettingsScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
      <Stack.Screen name="LiveMonitoring" component={LiveMonitoringScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="QuestionBank" component={QuestionBankScreen} />
      <Stack.Screen name="AiGenerator" component={AiGeneratorScreen} />
      <Stack.Screen name="TeacherHistory" component={TeacherHistoryScreen} />
      <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
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
