import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';

interface RoleCardProps {
  role: 'student' | 'teacher';
  title: string;
  description: string;
  isSelected?: boolean;
  onPress: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  description,
  isSelected = false,
  onPress,
}) => {
  const isStudent = role === 'student';
  const iconName = isStudent ? 'school' : 'people';
  const accentColor = isStudent ? theme.colors.primary : theme.colors.purple;
  const bgColor = isStudent ? theme.colors.primaryLight : theme.colors.purpleLight;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.touchable}>
      <Card
        variant={isSelected ? (isStudent ? 'accentBlue' : 'accentPurple') : 'elevated'}
        style={[styles.card, isSelected && { borderColor: accentColor, borderWidth: 2 }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={32} color={accentColor} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
          size={24}
          color={isSelected ? accentColor : theme.colors.textMuted}
        />
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
