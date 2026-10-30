import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Input, Card, FairCompetitionCard } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('aarav@mathsprint.edu');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async () => {
    if (!emailOrUsername.trim()) {
      setError('Please enter your email or username');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(emailOrUsername.trim(), password, selectedRole);
    } catch (e: any) {
      setError(e.message || 'Unable to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'teacher') {
      setEmailOrUsername('sarah.miller@mathsprint.edu');
    } else {
      setEmailOrUsername('aarav@mathsprint.edu');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      `A password reset link has been dispatched to ${emailOrUsername || 'your registered school email'}.`,
      [{ text: 'OK' }]
    );
  };

  const handleCreateAccount = () => {
    setSuccessMessage(`Demo account ready for ${selectedRole === 'student' ? 'Student (Aarav)' : 'Teacher (Prof. Miller)'}! Press Sign In.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header Branding */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="flash" size={32} color={theme.colors.textInverse} />
            </View>
            <Text style={styles.title}>MATHSPRINT</Text>
            <Text style={styles.subtitle}>Enter the real-time classroom arena</Text>
          </View>

          {/* Quick Entry Selector */}
          <View style={styles.roleToggleWrapper}>
            <Text style={styles.roleToggleLabel}>CHOOSE YOUR ROLE ENTRY:</Text>
            <View style={styles.roleContainer}>
              <Button
                title="Student Entry"
                variant={selectedRole === 'student' ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => handleRoleSelect('student')}
                leftIcon={
                  <Ionicons
                    name="school"
                    size={16}
                    color={selectedRole === 'student' ? '#FFF' : theme.colors.primary}
                  />
                }
                style={styles.roleBtn}
              />
              <Button
                title="Teacher Entry"
                variant={selectedRole === 'teacher' ? 'secondary' : 'ghost'}
                size="sm"
                onPress={() => handleRoleSelect('teacher')}
                leftIcon={
                  <Ionicons
                    name="briefcase"
                    size={16}
                    color={selectedRole === 'teacher' ? '#FFF' : theme.colors.purple}
                  />
                }
                style={styles.roleBtn}
              />
            </View>
          </View>

          {/* Login Card */}
          <Card variant="elevated" style={styles.formCard}>
            {successMessage ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.green} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Email or Username"
              placeholder="e.g. aarav or aarav@school.edu"
              value={emailOrUsername}
              onChangeText={(t) => {
                setEmailOrUsername(t);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="person-outline" size={18} color={theme.colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(p) => {
                setPassword(p);
                if (error) setError('');
              }}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
              error={error}
            />

            <View style={styles.actionLinksRow}>
              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
                <Text style={styles.linkTextBold}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={`Sign In as ${selectedRole === 'teacher' ? 'Teacher' : 'Student'}`}
              variant={selectedRole === 'teacher' ? 'secondary' : 'primary'}
              size="lg"
              loading={loading}
              onPress={handleLogin}
              fullWidth
              style={styles.submitBtn}
            />

            <Button
              title="Select Role with Full Preview"
              variant="outline"
              size="md"
              leftIcon={<Ionicons name="apps-outline" size={18} color={theme.colors.primary} />}
              onPress={() => navigation.navigate('RoleSelection')}
              fullWidth
              style={styles.roleNavBtn}
            />
          </Card>

          {/* Non-invasive Fair Competition Section */}
          <FairCompetitionCard compact style={styles.fairPlay} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.primaryGlow,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleToggleWrapper: {
    width: '100%',
    maxWidth: 380,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  roleToggleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.full,
    padding: 3,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
    padding: theme.spacing.lg,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.greenLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    gap: 6,
  },
  successText: {
    fontSize: 11,
    color: theme.colors.greenDark,
    fontWeight: '600',
    flex: 1,
  },
  actionLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  linkText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  linkTextBold: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    marginBottom: theme.spacing.xs,
  },
  roleNavBtn: {
    marginTop: theme.spacing.xs,
  },
  fairPlay: {
    marginTop: theme.spacing.lg,
  },
});
