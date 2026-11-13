import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { SoundEffects } from '../../utils/soundEffects';

export interface PowerUpInventory {
  shield: boolean; // available or used
  fiftyFifty: boolean;
  timeFreeze: boolean;
}

interface TacticalPowerUpDockProps {
  inventory: PowerUpInventory;
  activeShield: boolean;
  isTimeFrozen: boolean;
  onActivateShield: () => void;
  onActivateFiftyFifty: () => void;
  onActivateTimeFreeze: () => void;
  disabled?: boolean;
}

export const TacticalPowerUpDock: React.FC<TacticalPowerUpDockProps> = ({
  inventory,
  activeShield,
  isTimeFrozen,
  onActivateShield,
  onActivateFiftyFifty,
  onActivateTimeFreeze,
  disabled = false,
}) => {
  const handleShieldPress = () => {
    if (!inventory.shield || activeShield || disabled) return;
    SoundEffects.playPowerUpActivate();
    onActivateShield();
  };

  const handleFiftyFiftyPress = () => {
    if (!inventory.fiftyFifty || disabled) return;
    SoundEffects.playPowerUpActivate();
    onActivateFiftyFifty();
  };

  const handleTimeFreezePress = () => {
    if (!inventory.timeFreeze || isTimeFrozen || disabled) return;
    SoundEffects.playTimeFreeze();
    onActivateTimeFreeze();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="flash-outline" size={13} color={theme.colors.textSecondary} />
          <Text style={styles.title}>Tactical Power-Ups (1-Use Per Sprint)</Text>
        </View>
        <Text style={styles.inventoryStatus}>
          {[inventory.shield, inventory.fiftyFifty, inventory.timeFreeze].filter(Boolean).length}/3 Ready
        </Text>
      </View>

      <View style={styles.cardsRow}>
        {/* 1. STREAK SHIELD */}
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!inventory.shield || activeShield || disabled}
          onPress={handleShieldPress}
          style={[
            styles.card,
            activeShield && styles.cardActiveShield,
            !inventory.shield && styles.cardUsed,
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              activeShield
                ? { backgroundColor: '#10B981' }
                : inventory.shield
                ? { backgroundColor: '#ECFDF5' }
                : { backgroundColor: '#F1F5F9' },
            ]}
          >
            <Ionicons
              name={activeShield ? 'shield-checkmark' : 'shield-outline'}
              size={18}
              color={activeShield ? '#FFF' : inventory.shield ? '#059669' : '#94A3B8'}
            />
          </View>
          <Text style={[styles.cardTitle, !inventory.shield && { color: '#94A3B8' }]}>
            {activeShield ? 'SHIELDED' : 'Shield'}
          </Text>
          <Text style={[styles.cardStatus, activeShield && { color: '#059669' }]}>
            {activeShield ? 'ACTIVE' : inventory.shield ? 'READY' : 'USED'}
          </Text>
        </TouchableOpacity>

        {/* 2. 50:50 ELIMINATOR */}
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!inventory.fiftyFifty || disabled}
          onPress={handleFiftyFiftyPress}
          style={[styles.card, !inventory.fiftyFifty && styles.cardUsed]}
        >
          <View
            style={[
              styles.iconCircle,
              inventory.fiftyFifty ? { backgroundColor: '#EFF6FF' } : { backgroundColor: '#F1F5F9' },
            ]}
          >
            <Ionicons
              name="cut-outline"
              size={18}
              color={inventory.fiftyFifty ? theme.colors.primary : '#94A3B8'}
            />
          </View>
          <Text style={[styles.cardTitle, !inventory.fiftyFifty && { color: '#94A3B8' }]}>
            50:50
          </Text>
          <Text style={styles.cardStatus}>
            {inventory.fiftyFifty ? 'READY' : 'USED'}
          </Text>
        </TouchableOpacity>

        {/* 3. TIME FREEZE (5s) */}
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!inventory.timeFreeze || isTimeFrozen || disabled}
          onPress={handleTimeFreezePress}
          style={[
            styles.card,
            isTimeFrozen && styles.cardActiveFreeze,
            !inventory.timeFreeze && styles.cardUsed,
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              isTimeFrozen
                ? { backgroundColor: '#3B82F6' }
                : inventory.timeFreeze
                ? { backgroundColor: '#F3E8FF' }
                : { backgroundColor: '#F1F5F9' },
            ]}
          >
            <Ionicons
              name={isTimeFrozen ? 'hourglass' : 'hourglass-outline'}
              size={18}
              color={isTimeFrozen ? '#FFF' : inventory.timeFreeze ? '#8B5CF6' : '#94A3B8'}
            />
          </View>
          <Text style={[styles.cardTitle, !inventory.timeFreeze && { color: '#94A3B8' }]}>
            Freeze 5s
          </Text>
          <Text style={[styles.cardStatus, isTimeFrozen && { color: '#3B82F6' }]}>
            {isTimeFrozen ? 'FROZEN' : inventory.timeFreeze ? 'READY' : 'USED'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inventoryStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardActiveShield: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  cardActiveFreeze: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  cardUsed: {
    opacity: 0.45,
    backgroundColor: '#F1F5F9',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  cardStatus: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
});
