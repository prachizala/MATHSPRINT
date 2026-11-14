import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, Input, Card, Header, FairCompetitionCard } from '../../components/common';
import { isValidPin } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import { SprintApi } from '../../services/api/sprintApi';

export const JoinSprintScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(user?.name || 'Aarav');
  const [pin, setPin] = useState('482910'); // Default demo PIN
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!studentName.trim()) {
      setError('Please enter your name to display on the leaderboard');
      return;
    }

    if (!isValidPin(pin)) {
      setError('Invalid PIN. Please enter a valid 6-digit numeric code from your teacher.');
      return;
    }

    if (pin.length !== 6) {
      setError('Lobby code must be exactly 6 digits.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const lobbyData = await SprintApi.getLobbyByCode(pin);
      if (lobbyData && (lobbyData.status === 'ENDED' || lobbyData.status === 'CANCELLED')) {
        setError(`Sprint has already ${lobbyData.status.toLowerCase()}.`);
        return;
      }
      navigation.navigate('WaitingRoom', { lobbyCode: pin });
    } catch {
      // Fallback navigation
      navigation.navigate('WaitingRoom', { lobbyCode: pin });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Join Live Sprint" showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card variant="elevated" style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="keypad" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Enter Sprint PIN</Text>
            <Text style={styles.subtitle}>
              Type the 6-digit lobby code shown on your teacher's projector or screen.
            </Text>

            <Input
              label="Your Display Name"
              placeholder="e.g. Aarav"
              value={studentName}
              onChangeText={(t) => {
                setStudentName(t);
                if (error) setError('');
              }}
              leftIcon={<Ionicons name="person-outline" size={18} color={theme.colors.textMuted} />}
              containerStyle={styles.inputContainer}
            />

            <Input
              label="6-Digit Lobby PIN"
              placeholder="482910"
              value={pin}
              onChangeText={(text) => {
                setPin(text.replace(/\D/g, '').slice(0, 6));
                if (error) setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              error={error}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
              containerStyle={styles.inputContainer}
              helperText="Demo lobby PIN is 482910 (Math Logic Battle)"
            />

            <Button
              title="Enter Waiting Room"
              variant="primary"
              size="lg"
              loading={loading}
              leftIcon={<Ionicons name="enter-outline" size={20} color="#FFF" />}
              onPress={handleJoin}
              fullWidth
              style={styles.btn}
            />
          </Card>

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
  content: {
    padding: theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  inputContainer: {
    width: '100%',
  },
  btn: {
    marginTop: theme.spacing.sm,
  },
  fairPlay: {
    marginTop: theme.spacing.xl,
  },
});
