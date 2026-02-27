'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import CameraView from '../components/CameraView';
import ResultView from '../components/ResultView';
import ProcessingView from '../components/ProcessingView';
import SettingsScreen from './SettingsScreen';
import GuideScreen from './GuideScreen';
import { AppMode } from '../types';
import {
  HexGridBackground,
  ScanLine,
  FloatingHex,
  Hexagon,
  HexRowDecoration,
  C,
  useWindowSize,
} from '../components/HexUI';

type ScreenState = 'home' | 'camera' | 'processing' | 'result' | 'settings' | 'guide';

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
  const { width, height } = useWindowSize();
  const { currentMode, isProcessing, result, setMode, processImage, clearResult, loadApiKey } = useAppStore();

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

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

  // ガイド画面
  if (screen === 'guide') {
    return (
      <div className="app-container">
        <GuideScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  // 設定画面
  if (screen === 'settings') {
    return (
      <div className="app-container">
        <SettingsScreen
          onBack={() => {
            loadApiKey();
            setScreen('home');
          }}
          onNavigateGuide={() => setScreen('guide')}
        />
      </div>
    );
  }

  // 解析中
  if (screen === 'processing' || isProcessing) {
    return (
      <div className="app-container">
        <ProcessingView />
      </div>
    );
  }

  // 結果表示
  if (screen === 'result' && result) {
    return (
      <div className="app-container">
        <ResultView result={result} mode={currentMode} onBack={handleBack} />
      </div>
    );
  }

  // ホーム
  return (
    <div className="app-container">
      <HexGridBackground />
      <ScanLine />
      <FloatingHex size={50} top={100} left={width - 70} delay={0} />
      <FloatingHex size={35} top={height - 200} left={-8} delay={800} />

      {/* ヘッダー */}
      <div className="header">
        <div className="header-left">
          <Hexagon size={20} stroke={C.dimLight} strokeWidth={1.5} />
          <span className="header-title">STUDY PARTNER</span>
        </div>
        <div className="header-right">
          <button className="guide-button" onClick={() => setScreen('guide')}>
            ?
          </button>
          <button className="settings-button" onClick={() => setScreen('settings')}>
            ⚙️
          </button>
        </div>
      </div>

      {/* モードカード一覧 */}
      <div className="scroll-view">
        <div className="scroll-content">
          <span className="section-hint">撮影したい機能をタップ</span>

          {MODE_LIST.map((mode) => (
            <button
              key={mode.key}
              className="mode-card"
              onClick={() => handleModeCapture(mode.key)}
            >
              {/* 左: アイコン */}
              <div className="mode-icon-wrap">
                <Hexagon size={44} fill={C.surface} stroke={C.dimLight} strokeWidth={1} />
                <span className="mode-icon-inner">{mode.icon}</span>
              </div>

              {/* 中央: テキスト */}
              <div className="mode-body">
                <span className="mode-label">{mode.label}</span>
                <span className="mode-desc">{mode.description}</span>
              </div>

              {/* 右: 撮影ボタン */}
              <div className="shoot-btn-wrap">
                <div className="shoot-btn">📷</div>
                <span className="shoot-btn-text">{mode.action}</span>
              </div>
            </button>
          ))}

          <HexRowDecoration />
        </div>
      </div>

      {/* カメラ */}
      <CameraView
        visible={screen === 'camera'}
        onCapture={handleCapture}
        onClose={() => setScreen('home')}
      />
    </div>
  );
}
