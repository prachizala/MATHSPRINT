import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, RoleCard, FairCompetitionCard } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { switchRole } = useAuth();

  const handleSelect = (role: 'student' | 'teacher') => {
    switchRole(role);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Select Your Role"
        subtitle="Experience MATHSPRINT your way"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>
          Tap a role below to launch directly into that workspace:
        </Text>

        {/* Student Card */}
        <RoleCard
          role="student"
          title="Student Arena"
          description="Join live math battles and improve your skills. Compete with 6-digit PINs, climb the leaderboard, and earn streak bonuses."
          onPress={() => handleSelect('student')}
        />

        {/* Teacher Card */}
        <RoleCard
          role="teacher"
          title="Teacher / Host Hub"
          description="Create sprints and monitor student performance. Launch live classroom lobbies, view accuracy in real time, and analyze weak areas."
          onPress={() => handleSelect('teacher')}
        />

        {/* Fair Competition Notice */}
        <FairCompetitionCard style={styles.fairPlay} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  instruction: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  fairPlay: {
    marginTop: theme.spacing.md,
  },
});
