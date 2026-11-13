import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
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
      setCustomInput(active);
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

  const handleApplyPreset = (url: string) => {
    ApiClient.setBaseUrl(url);
    const updated = ApiClient.getBaseUrl();
    setCurrentUrl(updated);
    setCustomInput(updated);
    runHealthCheck(updated);
  };

  const handleApplyCustom = () => {
    if (!customInput.trim()) return;
    ApiClient.setBaseUrl(customInput.trim());
    const updated = ApiClient.getBaseUrl();
    setCurrentUrl(updated);
    setCustomInput(updated);
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

          <ScrollView showsVerticalScrollIndicator={false}>
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
                    <Text style={[styles.statusText, { color: theme.colors.danger }]} numberOfLines={2}>
                      Offline: {status.error}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => runHealthCheck()}
                  disabled={testing}
                >
                  <Ionicons name="refresh" size={14} color={theme.colors.primary} />
                  <Text style={styles.retryBtnText}>Test Ping</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Presets */}
            <Text style={styles.presetsLabel}>QUICK CONNECT PRESETS</Text>
            <View style={styles.presetGrid}>
              <TouchableOpacity
                style={[styles.presetChip, styles.presetChipRender]}
                onPress={() => handleApplyPreset('https://mathsprint-backend.onrender.com/api')}
              >
                <Ionicons name="cloud" size={15} color="#0284C7" />
                <Text style={[styles.presetChipText, { color: '#0284C7', fontWeight: '700' }]}>
                  Render Cloud (Live)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleApplyPreset('http://192.168.1.100:5000/api')}
              >
                <Ionicons name="wifi" size={14} color={theme.colors.cyan} />
                <Text style={styles.presetChipText}>Laptop WiFi LAN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleApplyPreset('http://10.0.2.2:5000/api')}
              >
                <Ionicons name="phone-portrait-outline" size={14} color={theme.colors.purple} />
                <Text style={styles.presetChipText}>Android AVD (10.0.2.2)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleApplyPreset('http://127.0.0.1:5000/api')}
              >
                <Ionicons name="laptop-outline" size={14} color={theme.colors.orange} />
                <Text style={styles.presetChipText}>Localhost</Text>
              </TouchableOpacity>
            </View>

            {/* Custom IP Entry */}
            <Text style={styles.presetsLabel}>ENTER CUSTOM BACKEND URL / RENDER HOST</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="https://your-service.onrender.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustom}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.hintText}>
              Tip: When deployed on Render, paste your live URL above (e.g. https://mathsprint-xyz.onrender.com). Changes take effect instantly without restarting the app!
            </Text>

            {/* Close button */}
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  currentUrlBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  boxUrl: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    flex: 1,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipRender: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
    marginBottom: 16,
  },
  doneBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
