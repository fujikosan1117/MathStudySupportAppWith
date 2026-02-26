/**
 * MainScreen.tsx — ホーム画面 / 状態マシン
 *
 * 画面遷移: home → camera → processing → result (→ home)
 *                                         ↘ settings
 *
 * ホーム画面は 4 つのモードカードを縦スクロールで表示し、
 * 各カードのボタンで直接カメラを起動できる。
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import CameraView from '../components/CameraView';
import ResultView from '../components/ResultView';
import SettingsScreen from './SettingsScreen';
import { AppMode } from '../types';
import {
  HexGridBackground,
  ScanLine,
  FloatingHex,
  Hexagon,
  HexRowDecoration,
  C,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../components/HexUI';

type ScreenState = 'home' | 'camera' | 'processing' | 'result' | 'settings';

// --- Processing Hex Animation ---
function ProcessingHex() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    );
    rotateLoop.start();
    pulseLoop.start();
    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ opacity: pulseAnim, transform: [{ rotate }], marginBottom: 24 }}>
      <Hexagon size={60} stroke={C.accent} strokeWidth={1.5} />
    </Animated.View>
  );
}

// --- モード定義 ---
const MODE_LIST: {
  key: AppMode;
  icon: string;
  label: string;
  action: string;
  description: string;
}[] = [
  {
    key: 'SOLVE',
    icon: '🧮',
    label: '解いて',
    action: '撮影して解く',
    description: '問題を撮影 → AI が解き方を詳しく解説',
  },
  {
    key: 'GRADE',
    icon: '📝',
    label: '採点',
    action: '撮影して採点',
    description: '答案を撮影 → AI が点数と改善点を表示',
  },
  {
    key: 'OCR',
    icon: '🔍',
    label: 'テキスト化',
    action: '撮影して抽出',
    description: '教科書や板書 → テキストに変換しコピー可能',
  },
  {
    key: 'ANKI',
    icon: '🃏',
    label: 'Anki カード',
    action: '撮影して生成',
    description: 'ノートを撮影 → 暗記カードを自動生成・CSV出力',
  },
];

export default function MainScreen() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const { currentMode, isProcessing, result, setMode, processImage, clearResult, loadApiKey } = useAppStore();

  useEffect(() => {
    loadApiKey();
  }, []);

  const handleModeCapture = (mode: AppMode) => {
    setMode(mode);
    setScreen('camera');
  };

  const handleCapture = async (base64: string) => {
    setScreen('processing');
    await processImage(base64);
    setScreen('result');
  };

  const handleBack = () => {
    clearResult();
    setScreen('home');
  };

  // 設定画面
  if (screen === 'settings') {
    return (
      <SettingsScreen
        onBack={() => {
          loadApiKey();
          setScreen('home');
        }}
      />
    );
  }

  // 解析中
  if (screen === 'processing' || isProcessing) {
    return (
      <SafeAreaView style={styles.centered}>
        <HexGridBackground />
        <ScanLine />
        <ProcessingHex />
        <Text style={styles.processingText}>AI が解析中...</Text>
        <Text style={styles.processingSubText}>少々お待ちください</Text>
      </SafeAreaView>
    );
  }

  // 結果表示
  if (screen === 'result' && result) {
    return (
      <SafeAreaView style={styles.flex}>
        <ResultView result={result} mode={currentMode} onBack={handleBack} />
      </SafeAreaView>
    );
  }

  // ホーム
  return (
    <SafeAreaView style={styles.flex}>
      <HexGridBackground />
      <ScanLine />
      <FloatingHex size={50} top={100} left={SCREEN_WIDTH - 70} delay={0} />
      <FloatingHex size={35} top={SCREEN_HEIGHT - 200} left={-8} delay={800} />

      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Hexagon size={20} stroke={C.dimLight} strokeWidth={1.5} />
          <Text style={styles.headerTitle}>STUDY PARTNER</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setScreen('settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* モードカード一覧 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHint}>撮影したい機能をタップ</Text>

        {MODE_LIST.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={styles.modeCard}
            activeOpacity={0.8}
            onPress={() => handleModeCapture(mode.key)}
          >
            {/* 左: アイコン */}
            <View style={styles.modeIconWrap}>
              <Hexagon size={44} fill={C.surface} stroke={C.dimLight} strokeWidth={1} />
              <View style={styles.modeIconInner}>
                <Text style={styles.modeIcon}>{mode.icon}</Text>
              </View>
            </View>

            {/* 中央: テキスト */}
            <View style={styles.modeBody}>
              <Text style={styles.modeLabel}>{mode.label}</Text>
              <Text style={styles.modeDesc}>{mode.description}</Text>
            </View>

            {/* 右: 撮影ボタン */}
            <View style={styles.shootBtnWrap}>
              <View style={styles.shootBtn}>
                <Text style={styles.shootBtnIcon}>📷</Text>
              </View>
              <Text style={styles.shootBtnText}>{mode.action}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <HexRowDecoration />
      </ScrollView>

      {/* カメラ (モーダル) */}
      <CameraView
        visible={screen === 'camera'}
        onCapture={handleCapture}
        onClose={() => setScreen('home')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    gap: 12,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  processingSubText: {
    fontSize: 12,
    color: '#555555',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  settingsIcon: {
    fontSize: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  sectionHint: {
    fontSize: 12,
    color: C.dim,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 12,
  },
  modeIconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 20,
  },
  modeBody: {
    flex: 1,
    gap: 4,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modeDesc: {
    fontSize: 12,
    color: C.dimLight,
    lineHeight: 17,
  },
  shootBtnWrap: {
    alignItems: 'center',
    gap: 4,
  },
  shootBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shootBtnIcon: {
    fontSize: 20,
  },
  shootBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.dim,
    letterSpacing: 0.5,
  },
});
