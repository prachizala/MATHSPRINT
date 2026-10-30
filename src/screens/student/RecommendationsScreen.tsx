import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackParamList } from '../../navigation/types';
import { theme } from '../../theme';
import { Header, Card, Badge, Button, FairCompetitionCard } from '../../components/common';
import { SprintApi } from '../../services/api/sprintApi';

type Props = NativeStackScreenProps<StudentStackParamList, 'Recommendations'>;

export const RecommendationsScreen: React.FC<Props> = ({ navigation }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRecs = async () => {
      try {
        const data = await SprintApi.getStudentRecommendations();
        if (isMounted && data && data.length > 0) {
          setRecommendations(data);
        }
      } catch (e) {
        console.warn('[RecommendationsScreen] Fetch error:', e);
      }
    };
    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="AI Recommendations"
        subtitle="Adaptive practice based on sprint results"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {recommendations.length > 0 ? (
          recommendations.map((rec) => {
            const isDanger = rec.badgeVariant === 'danger';
            const isPurple = rec.badgeVariant === 'purple';
            const cardVariant = isDanger ? 'accentOrange' : isPurple ? 'accentPurple' : 'accentGreen';
            const btnVariant = isDanger ? 'orange' : isPurple ? 'secondary' : 'primary';
            const iconName = isDanger ? 'alert-circle' : isPurple ? 'flash' : 'checkmark-done';
            const iconColor = isDanger ? theme.colors.danger : isPurple ? theme.colors.purple : theme.colors.green;

            return (
              <Card key={rec.id} variant={cardVariant} style={styles.recCard}>
                <View style={styles.headerRow}>
                  <Badge label={rec.badge} variant={rec.badgeVariant || 'primary'} size="sm" />
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <Text style={styles.title}>{rec.title}</Text>
                <Text style={styles.description}>{rec.reason}</Text>
                <Button
                  title={`START ${rec.topic.toUpperCase()} DRILL`}
                  size="md"
                  variant={btnVariant as any}
                  leftIcon={<Ionicons name="play" size={18} color="#FFF" />}
                  onPress={() =>
                    navigation.navigate('LiveQuiz', {
                      lobbyId: rec.drillId || `drill-${rec.topic.toLowerCase()}`,
                    })
                  }
                  style={styles.actionBtn}
                />
              </Card>
            );
          })
        ) : (
          <>
            {/* Primary Weak Area Callout */}
            <Card variant="accentOrange" style={styles.recCard}>
              <View style={styles.headerRow}>
                <Badge label="PRIORITY 1: WEAK TOPIC DETECTED" variant="danger" size="sm" />
                <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
              </View>
              <Text style={styles.title}>Algebra: Two-Step Linear Equations</Text>
              <Text style={styles.description}>
                Diagnostics show you spent 9.4 seconds on 4x - 9 = 2x + 11. Practice isolating variables with negative coefficients to cut your response time in half.
              </Text>
              <Button
                title="START PRACTICE DRILL"
                size="md"
                variant="orange"
                leftIcon={<Ionicons name="play" size={18} color="#FFF" />}
                onPress={() => navigation.navigate('LiveQuiz', { lobbyId: 'drill-algebra' })}
                style={styles.actionBtn}
              />
            </Card>

            {/* Medium Topic Improvement */}
            <Card variant="accentPurple" style={styles.recCard}>
              <View style={styles.headerRow}>
                <Badge label="PRIORITY 2: SPEED BOOSTER" variant="purple" size="sm" />
                <Ionicons name="flash" size={20} color={theme.colors.purple} />
              </View>
              <Text style={styles.title}>Logic: Sequence Deduction Speed</Text>
              <Text style={styles.description}>
                Pattern identification on number sequences (3, 7, 15, 31...) is at 78% accuracy. Practicing (n × 2) + 1 recursions will unlock the 5x streak bonus.
              </Text>
              <Button
                title="START LOGIC PRACTICE"
                size="md"
                variant="secondary"
                leftIcon={<Ionicons name="bulb-outline" size={18} color="#FFF" />}
                onPress={() => navigation.navigate('LiveQuiz', { lobbyId: 'drill-logic' })}
                style={styles.actionBtn}
              />
            </Card>

            {/* Mastery Maintenance */}
            <Card variant="accentGreen" style={styles.recCard}>
              <View style={styles.headerRow}>
                <Badge label="STRENGTH: 94% ACCURACY" variant="green" size="sm" />
                <Ionicons name="checkmark-done" size={20} color={theme.colors.green} />
              </View>
              <Text style={styles.title}>Arithmetic: Mental Multiplication</Text>
              <Text style={styles.description}>
                Outstanding 2.8s average speed on arithmetic problems. Keep this sharp with daily 2-minute warmup sprints.
              </Text>
              <Button
                title="START SPEED WARMUP"
                size="md"
                variant="primary"
                leftIcon={<Ionicons name="flame-outline" size={18} color="#FFF" />}
                onPress={() => navigation.navigate('LiveQuiz', { lobbyId: 'drill-arithmetic' })}
                style={styles.actionBtn}
              />
            </Card>
          </>
        )}

        <FairCompetitionCard compact style={styles.fairPlay} />
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
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  recCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  actionBtn: {
    alignSelf: 'flex-start',
  },
  fairPlay: {
    marginTop: theme.spacing.xs,
  },
});
