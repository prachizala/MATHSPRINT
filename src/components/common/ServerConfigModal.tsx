import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ApiClient } from '../../services/api/apiClient';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ visible, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState(ApiClient.getBaseUrl());
  const [customInput, setCustomInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ ok?: boolean; latencyMs?: number; error?: string } | null>(null);

  useEffect(() => {
    if (visible) {
      const active = ApiClient.getBaseUrl();
      setCurrentUrl(active);
      setCustomInput(active.replace('/api', '').replace('http://', ''));
      runHealthCheck(active);
    }
  }, [visible]);

  const runHealthCheck = async (target?: string) => {
    setTesting(true);
    setStatus(null);
    try {
      const result = await ApiClient.testConnection(target || currentUrl);
      setStatus(result);
    } finally {
      setTesting(false);
    }
  };

  const handleApplyPreset = (host: string) => {
    const fullUrl = `http://${host}:5000/api`;
    ApiClient.setBaseUrl(fullUrl);
    const updated = ApiClient.getBaseUrl();
    setCurrentUrl(updated);
    setCustomInput(`${host}:5000`);
    runHealthCheck(updated);
  };

  const handleApplyCustom = () => {
    if (!customInput.trim()) return;
    ApiClient.setBaseUrl(customInput.trim());
    const updated = ApiClient.getBaseUrl();
    setCurrentUrl(updated);
    runHealthCheck(updated);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="server-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.headerTitle}>Server Connection</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Active URL Status */}
          <View style={styles.currentUrlBox}>
            <Text style={styles.boxLabel}>CURRENT API BASE URL</Text>
            <Text style={styles.boxUrl} numberOfLines={2}>
              {currentUrl}
            </Text>

            <View style={styles.statusRow}>
              {testing ? (
                <View style={styles.statusPill}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.statusText, { color: theme.colors.primary }]}>Testing connection...</Text>
                </View>
              ) : status?.ok ? (
                <View style={[styles.statusPill, styles.statusSuccess]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.green} />
                  <Text style={[styles.statusText, { color: theme.colors.green }]}>
                    Online ({status.latencyMs}ms)
                  </Text>
                </View>
              ) : status ? (
                <View style={[styles.statusPill, styles.statusError]}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                  <Text style={[styles.statusText, { color: theme.colors.danger }]}>
                    Offline: {status.error || 'Unreachable'}
                  </Text>
                </View>
              ) : (
                <View style={styles.statusPill}>
                  <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>Status unknown</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => runHealthCheck()}
                disabled={testing}
                style={styles.pingBtn}
              >
                <Ionicons name="refresh" size={14} color={theme.colors.primary} />
                <Text style={styles.pingBtnText}>Test Ping</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Presets */}
          <Text style={styles.presetsLabel}>QUICK CONNECT PRESETS</Text>
          <View style={styles.presetGrid}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleApplyPreset('192.168.113.114')}
            >
              <Ionicons name="wifi" size={14} color={theme.colors.cyan} />
              <Text style={styles.presetChipText}>Laptop WiFi LAN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleApplyPreset('10.0.2.2')}
            >
              <Ionicons name="phone-portrait-outline" size={14} color={theme.colors.purple} />
              <Text style={styles.presetChipText}>Android AVD (10.0.2.2)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleApplyPreset('127.0.0.1')}
            >
              <Ionicons name="laptop-outline" size={14} color={theme.colors.orange} />
              <Text style={styles.presetChipText}>Localhost</Text>
            </TouchableOpacity>
          </View>

          {/* Custom IP Entry */}
          <Text style={styles.presetsLabel}>CUSTOM HOST / IP</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="e.g. 192.168.1.5:5000"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustom}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>
            Changes take effect immediately for all live quiz submissions and teacher controls without restarting the app.
          </Text>

          {/* Close button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.base,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  currentUrlBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  boxUrl: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  pingBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  presetsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  presetChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  applyBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  hintText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  doneBtn: {
    backgroundColor: theme.colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  doneBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: theme.typography.sizes.sm,
  },
});
