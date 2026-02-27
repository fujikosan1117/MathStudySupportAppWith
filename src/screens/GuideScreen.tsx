'use client';

import {
  Hexagon,
  HexGridBackground,
  ScanLine,
  FloatingHex,
  HexRowDecoration,
  C,
  useWindowSize,
} from '../components/HexUI';

interface GuideScreenProps {
  onBack: () => void;
}

const GUIDE_MODES = [
  {
    icon: '🧮',
    label: '解いて (SOLVE)',
    steps: [
      '問題を撮影またはアップロード',
      'AI が問題を認識',
      '解き方をステップバイステップで解説',
    ],
    description: '数学や理科の問題を写真に撮ると、AIが解法を詳しく説明します。',
  },
  {
    icon: '📝',
    label: '採点 (GRADE)',
    steps: [
      '答案を撮影またはアップロード',
      'AI が採点基準を分析',
      '点数と改善点をフィードバック',
    ],
    description: '自分の解答を撮影すると、AIが採点して改善アドバイスをくれます。',
  },
  {
    icon: '🔍',
    label: 'テキスト化 (OCR)',
    steps: [
      '教科書・板書・プリントを撮影',
      'AI がテキストを認識・抽出',
      'テキストをコピーして活用',
    ],
    description: '教科書や黒板の文字を撮影すると、編集可能なテキストに変換します。',
  },
  {
    icon: '🃏',
    label: 'Anki カード (ANKI)',
    steps: [
      'ノートや要点を撮影',
      'AI が問題と答えのペアを生成',
      'CSVでエクスポートしてAnkiに取り込み',
    ],
    description: 'ノートを撮影すると、暗記用フラッシュカードを自動生成します。',
  },
];

export default function GuideScreen({ onBack }: GuideScreenProps) {
  const { width, height } = useWindowSize();

  return (
    <div className="settings-container">
      <HexGridBackground />
      <ScanLine />
      <FloatingHex size={60} top={50} left={width - 80} delay={0} />
      <FloatingHex size={40} top={height - 180} left={-10} delay={600} />
      <FloatingHex size={30} top={250} left={width - 50} delay={1200} />

      <div className="guide-scroll">
        {/* Back */}
        <button className="back-button" onClick={onBack}>
          <span className="back-hex">
            <Hexagon size={18} stroke={C.dimLight} />
          </span>
          <span className="back-text">BACK</span>
        </button>

        {/* Title */}
        <div className="title-section">
          <div className="title-hex-wrap">
            <Hexagon size={36} fill={C.accent} opacity={0.08} stroke={C.accent} strokeWidth={1.5} />
            <span className="title-hex-inner">📖</span>
          </div>
          <span className="settings-title">使い方</span>
          <span className="settings-subtitle">HOW TO USE</span>
        </div>

        {/* Divider */}
        <div className="divider-row">
          <div className="divider-line" />
          <Hexagon size={10} fill={C.border} opacity={0.5} />
          <div className="divider-line" />
        </div>

        {/* Overview */}
        <div className="guide-overview">
          <span className="guide-overview-text">
            カメラで撮影するだけで、AIが学習をサポートします。
            4つのモードから目的に合ったものを選んでください。
          </span>
        </div>

        {/* Mode guide cards */}
        {GUIDE_MODES.map((mode, modeIndex) => (
          <div key={modeIndex} className="guide-mode-card">
            <div className="guide-mode-header">
              <div className="hex-icon-wrap">
                <Hexagon size={36} fill={C.surface} stroke={C.dimLight} strokeWidth={1} />
                <span className="hex-icon-inner" style={{ fontSize: 18 }}>{mode.icon}</span>
              </div>
              <span className="guide-mode-label">{mode.label}</span>
            </div>

            <p className="guide-mode-desc">{mode.description}</p>

            <div className="guide-steps">
              {mode.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="guide-step">
                  <div className="info-step-hex">
                    <Hexagon size={20} fill={C.surface} stroke={C.dim} />
                    <span className="info-step-num">{stepIndex + 1}</span>
                  </div>
                  <span className="guide-step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Tips */}
        <div className="info-card">
          <div className="info-header">
            <Hexagon size={14} stroke={C.dimLight} />
            <span className="info-title">TIPS</span>
          </div>
          <div className="info-steps">
            {[
              'はっきりした写真ほど精度が上がります',
              'APIキーは設定画面 (⚙️) から登録してください',
              '結果はマークダウンでリッチに表示されます',
            ].map((tip, i) => (
              <div key={i} className="info-step">
                <div className="info-step-hex">
                  <Hexagon size={16} fill={C.surface} stroke={C.dim} />
                  <span className="info-step-num">💡</span>
                </div>
                <span className="info-step-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <HexRowDecoration />
      </div>
    </div>
  );
}
