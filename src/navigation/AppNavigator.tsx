import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { theme } from '../theme';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {!isAuthenticated ? (
          <AuthNavigator />
        ) : role === 'teacher' ? (
          <TeacherNavigator />
        ) : (
          <StudentNavigator />
        )}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
