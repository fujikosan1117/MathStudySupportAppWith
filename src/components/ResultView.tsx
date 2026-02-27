'use client';

import { GeminiResponse, AppMode } from '../types';
import MathRenderer from './MathRenderer';
import AnkiExport from './AnkiExport';
import { Hexagon, HexGridBackground, C } from './HexUI';

interface ResultViewProps {
  result: GeminiResponse;
  mode: AppMode;
  onBack: () => void;
}

const MODE_LABELS: Record<AppMode, string> = {
  SOLVE: '解答',
  GRADE: '採点結果',
  OCR: '抽出テキスト',
  ANKI: 'Anki カード',
};

function getScoreStyle(score: number) {
  if (score >= 80) return { color: '#FFFFFF' };
  if (score >= 50) return { color: '#AAAAAA' };
  return { color: '#666666' };
}

export default function ResultView({ result, mode, onBack }: ResultViewProps) {
  if (!result.success) {
    return (
      <div className="error-container">
        <HexGridBackground />
        <div className="hex-icon-wrap">
          <Hexagon size={56} stroke={C.dimLight} strokeWidth={1.5} />
          <span className="hex-icon-inner" style={{ fontSize: 24 }}>⚠️</span>
        </div>
        <span className="error-title">解析に失敗しました</span>
        <span className="error-message">{result.error}</span>
        <button className="error-back-button" onClick={onBack}>
          ← 撮り直す
        </button>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <button className="result-back-link" onClick={onBack}>
          <span className="back-hex">
            <Hexagon size={16} stroke={C.dimLight} />
          </span>
          <span className="result-back-text">BACK</span>
        </button>
        <div className="result-header-center">
          <Hexagon size={14} stroke={C.dim} />
          <span className="result-header-title">{MODE_LABELS[mode]}</span>
        </div>
        <div className="result-header-spacer" />
      </div>

      {mode === 'GRADE' && result.data.score !== undefined && (
        <div className="score-card">
          <div className="score-hex-wrap">
            <Hexagon size={80} stroke={C.accent} strokeWidth={1} opacity={0.15} />
            <div className="score-hex-inner">
              <span className="score-value" style={getScoreStyle(result.data.score)}>
                {result.data.score}
              </span>
            </div>
          </div>
          <span className="score-max">/ 100 点</span>
        </div>
      )}

      <div className="result-scroll">
        {mode === 'ANKI' ? (
          <AnkiExport cards={result.data.ankiCards ?? []} />
        ) : (
          <MathRenderer content={result.data.content} />
        )}
      </div>
    </div>
  );
}
