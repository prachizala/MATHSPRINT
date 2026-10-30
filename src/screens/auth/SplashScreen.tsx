import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Button, FairCompetitionCard } from '../../components/common';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Decorative Math Symbols in Background */}
        <View style={styles.mathSymbolsRow}>
          <Text style={styles.mathSymbol}>∑</Text>
          <Text style={styles.mathSymbol}>π</Text>
          <Text style={styles.mathSymbol}>√</Text>
          <Text style={styles.mathSymbol}>÷</Text>
          <Text style={styles.mathSymbol}>∞</Text>
          <Text style={styles.mathSymbol}>×</Text>
        </View>

        {/* Brand Icon Triad: Lightning, Timer, Trophy */}
        <View style={styles.visualRow}>
          <View style={[styles.visualBadge, { backgroundColor: theme.colors.orangeLight }]}>
            <Ionicons name="timer" size={24} color={theme.colors.orange} />
          </View>
          <View style={[styles.mainLogoCircle]}>
            <Ionicons name="flash" size={48} color={theme.colors.textInverse} />
          </View>
          <View style={[styles.visualBadge, { backgroundColor: theme.colors.purpleLight }]}>
            <Ionicons name="trophy" size={24} color={theme.colors.purple} />
          </View>
        </View>

        {/* Brand Typography */}
        <Text style={styles.title}>MATHSPRINT</Text>
        <Text style={styles.tagline}>Learn • Compete • Improve</Text>
        <Text style={styles.conceptText}>
          NOT JUST A QUIZ — A REAL-TIME LEARNING + COMPETITION EXPERIENCE.
        </Text>

        {/* Feature Badges Pills */}
        <View style={styles.pillarRow}>
          <View style={styles.pillarPill}>
            <Ionicons name="timer-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.pillarText}>2-MIN SPRINT</Text>
          </View>
          <View style={styles.pillarPill}>
            <Ionicons name="flash-outline" size={14} color={theme.colors.orange} />
            <Text style={styles.pillarText}>DYNAMIC SCORE</Text>
          </View>
          <View style={styles.pillarPill}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.green} />
            <Text style={styles.pillarText}>FAIR PLAY</Text>
          </View>
        </View>

        {/* Fair Play Shield */}
        <FairCompetitionCard compact style={styles.fairPlay} />

        {/* Call to Action */}
        <View style={styles.footer}>
          <Button
            title="GET STARTED"
            variant="primary"
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={20} color="#FFF" />}
            onPress={() => navigation.navigate('Login')}
            fullWidth
            style={styles.getStartedBtn}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RoleSelection')}
            style={styles.roleSelectLink}
          >
            <Text style={styles.roleSelectText}>Choose Role Directly →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  mathSymbolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    opacity: 0.25,
  },
  mathSymbol: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: theme.spacing.md,
  },
  visualBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLogoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.primaryGlow,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  conceptText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  pillarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: theme.spacing.md,
  },
  pillarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillarText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  fairPlay: {
    marginTop: 4,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  getStartedBtn: {
    ...theme.shadows.md,
  },
  roleSelectLink: {
    paddingVertical: 6,
  },
  roleSelectText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
