import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface QuestionOptionProps {
  index: number;
  text: string;
  isSelected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuestionOption: React.FC<QuestionOptionProps> = ({
  index,
  text,
  isSelected = false,
  disabled = false,
  onPress,
  style,
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      <View
        style={[
          styles.letterBadge,
          isSelected && styles.letterBadgeSelected,
        ]}
      >
        <Text
          style={[
            styles.letterText,
            isSelected && styles.letterTextSelected,
          ]}
        >
          {letter}
        </Text>
      </View>
      <Text
        style={[
          styles.optionText,
          isSelected && styles.optionTextSelected,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  containerSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  letterBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  letterBadgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  letterText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  letterTextSelected: {
    color: theme.colors.textInverse,
  },
  optionText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
});
