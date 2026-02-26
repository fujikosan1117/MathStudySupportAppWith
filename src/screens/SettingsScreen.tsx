/**
 * SettingsScreen.tsx — 設定画面
 *
 * ユーザーが自前の Gemini API キーを入力・保存できる画面。
 * AsyncStorage に永続化し、バックエンドへのリクエストに付加する。
 * 入力したキーの簡易バリデーション (AIzaSy... 形式) も行う。
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Hexagon,
  HexGridBackground,
  ScanLine,
  FloatingHex,
  HexRowDecoration,
  C,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../components/HexUI';

const STORAGE_KEY = 'gemini_api_key';

// --- Validation ---
function validateApiKey(key: string): { valid: boolean; message: string } {
  if (!key.trim()) return { valid: false, message: '' };
  if (key.length < 10) return { valid: false, message: 'API Key is too short' };
  if (!key.startsWith('AIza')) return { valid: false, message: 'Invalid format (must start with AIza)' };
  return { valid: true, message: 'Valid API Key format' };
}

// --- Status Badge ---
function StatusBadge({ connected }: { connected: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [connected]);

  return (
    <View style={styles.statusBadge}>
      <Animated.View
        style={[
          styles.statusDot,
          {
            backgroundColor: connected ? C.success : C.dim,
            opacity: connected ? pulseAnim : 0.5,
          },
        ]}
      />
      <Text style={[styles.statusText, { color: connected ? C.success : C.dim }]}>
        {connected ? 'KEY CONFIGURED' : 'NO KEY SET'}
      </Text>
    </View>
  );
}

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [inputFocused, setInputFocused] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const saveScaleAnim = useRef(new Animated.Value(1)).current;

  // Load saved key
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setApiKey(val);
    });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const validation = validateApiKey(apiKey);

  const handleSave = async () => {
    if (!validation.valid) return;
    setSaveStatus('saving');

    // Button press animation
    Animated.sequence([
      Animated.timing(saveScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(saveScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      await AsyncStorage.setItem(STORAGE_KEY, apiKey.trim());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDelete = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setSaveStatus('idle');
  };

  const glowShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.35],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Hex-Grid Background */}
      <HexGridBackground />
      <ScanLine />

      {/* Floating decorative hexagons */}
      <FloatingHex size={70} top={40} left={SCREEN_WIDTH - 90} delay={0} />
      <FloatingHex size={50} top={200} left={-15} delay={800} />
      <FloatingHex size={35} top={350} left={SCREEN_WIDTH - 60} delay={1600} />
      <FloatingHex size={45} top={SCREEN_HEIGHT - 200} left={20} delay={400} />
      <FloatingHex size={25} top={120} left={SCREEN_WIDTH / 2 - 10} delay={1200} />

      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.6}>
            <View style={styles.backHex}>
              <Hexagon size={18} stroke={C.dimLight} />
            </View>
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>

          {/* Title section */}
          <View style={styles.titleSection}>
            <View style={styles.titleHexWrap}>
              <Hexagon size={36} fill={C.accent} opacity={0.08} stroke={C.accent} strokeWidth={1.5} />
              <View style={styles.titleHexInner}>
                <Text style={styles.titleHexIcon}>🔑</Text>
              </View>
            </View>
            <Text style={styles.title}>API Key Manager</Text>
            <Text style={styles.subtitle}>GEMINI API CONFIGURATION</Text>
            <StatusBadge connected={validation.valid && apiKey.length > 0} />
          </View>

          {/* Divider with hex */}
          <View style={{ marginBottom: 8 }}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Hexagon size={10} fill={C.border} opacity={0.5} />
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* Input card */}
          <View style={[styles.inputCard, inputFocused && styles.inputCardFocused]}>
            <Text style={styles.label}>API KEY</Text>
            <View style={[styles.inputRow, inputFocused && styles.inputRowFocused]}>
              <Text style={styles.inputIcon}>⬡</Text>
              <TextInput
                style={styles.input}
                value={showKey ? apiKey : apiKey.length > 8
                  ? apiKey.slice(0, 6) + '•'.repeat(Math.min(apiKey.length - 10, 30)) + apiKey.slice(-4)
                  : '•'.repeat(apiKey.length)}
                onChangeText={setApiKey}
                placeholder="AIza..."
                placeholderTextColor={C.dim}
                autoCapitalize="none"
                autoCorrect={false}
                editable={showKey}
                onFocus={() => { setInputFocused(true); setShowKey(true); }}
                onBlur={() => { setInputFocused(false); setShowKey(false); }}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowKey(!showKey)}>
                <Text style={styles.eyeText}>{showKey ? 'HIDE' : 'SHOW'}</Text>
              </TouchableOpacity>
            </View>

            {/* Validation */}
            {apiKey.length > 0 && validation.message !== '' && (
              <View style={styles.validationRow}>
                <View style={[styles.validationDot, { backgroundColor: validation.valid ? C.success : C.error }]} />
                <Text style={[styles.validationText, { color: validation.valid ? C.success : C.error }]}>
                  {validation.message}
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {/* Save button */}
            <Animated.View
              style={[
                styles.saveButtonOuter,
                {
                  shadowOpacity: validation.valid ? glowShadowOpacity : 0,
                  transform: [{ scale: saveScaleAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !validation.valid && styles.saveButtonDisabled,
                  saveStatus === 'saved' && styles.saveButtonSuccess,
                ]}
                onPress={handleSave}
                disabled={!validation.valid || saveStatus === 'saving'}
                activeOpacity={0.7}
              >
                <Text style={[styles.saveButtonText, !validation.valid && styles.saveButtonTextDisabled]}>
                  {saveStatus === 'saving'
                    ? '⟳ SAVING...'
                    : saveStatus === 'saved'
                      ? '✓ SAVED'
                      : saveStatus === 'error'
                        ? '✕ ERROR'
                        : '⬡ SAVE KEY'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Delete button */}
            {apiKey.length > 0 && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.6}>
                <Text style={styles.deleteText}>DELETE KEY</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Hexagon size={14} stroke={C.dimLight} />
              <Text style={styles.infoTitle}>SETUP GUIDE</Text>
            </View>
            <View style={styles.infoSteps}>
              {[
                'Google AI Studio (aistudio.google.com) にアクセス',
                'API キーを作成',
                'キーをコピー (AIza...)',
                '上の入力欄に貼り付けて SAVE',
                'キーはローカルに保存されます',
              ].map((step, i) => (
                <View key={i} style={styles.infoStep}>
                  <View style={styles.infoStepHex}>
                    <Hexagon size={16} fill={C.surface} stroke={C.dim} />
                    <Text style={styles.infoStepNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.infoStepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom hex decoration */}
          <HexRowDecoration />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  inner: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  // Back
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    paddingRight: 20,
    marginBottom: 24,
  },
  backHex: {
    opacity: 0.6,
  },
  backText: {
    color: C.dimLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  // Title
  titleSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  titleHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titleHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleHexIcon: {
    fontSize: 16,
  },
  title: {
    color: C.accent,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: C.dim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
  },
  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  // Input card
  inputCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 20,
  },
  inputCardFocused: {
    borderColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    color: C.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: C.accent,
  },
  inputIcon: {
    color: C.dim,
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: C.accent,
    fontSize: 14,
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  eyeText: {
    color: C.dimLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Validation
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  validationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  validationText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Actions
  actionRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  saveButtonOuter: {
    width: '100%',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    elevation: 10,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.accent,
    borderRadius: 12,
    paddingVertical: 18,
  },
  saveButtonDisabled: {
    borderColor: C.border,
    opacity: 0.35,
  },
  saveButtonSuccess: {
    borderColor: C.success,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  saveButtonText: {
    color: C.accent,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
  saveButtonTextDisabled: {
    color: C.dim,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  deleteText: {
    color: C.error,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.7,
  },
  // Info card
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    color: C.dimLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  infoSteps: {
    gap: 12,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoStepHex: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoStepNum: {
    position: 'absolute',
    color: C.dimLight,
    fontSize: 9,
    fontWeight: '800',
  },
  infoStepText: {
    color: '#777777',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
