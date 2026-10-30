import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, role, switchRole, logout } = useAuth();

  return (
    <NavigationContainer>
      <View style={styles.container}>
        {/* Floating Quick Dev Switcher Bar */}
        {isAuthenticated && (
          <View style={styles.floatingRoleBar}>
            <TouchableOpacity
              onPress={() => switchRole(role === 'student' ? 'teacher' : 'student')}
              style={[
                styles.roleToggleBtn,
                { backgroundColor: role === 'student' ? theme.colors.primary : theme.colors.purple },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={role === 'student' ? 'school' : 'briefcase'}
                size={14}
                color="#FFF"
              />
              <Text style={styles.roleToggleText}>
                Mode: {role.toUpperCase()} (Tap to switch)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.logoutPill} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={14} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

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
  floatingRoleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 999,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  roleToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  logoutPill: {
    marginLeft: 12,
    padding: 4,
  },
});
