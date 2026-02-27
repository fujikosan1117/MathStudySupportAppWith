'use client';

import { useState } from 'react';
import { Hexagon, C } from './HexUI';

interface AnkiCard {
  front: string;
  back: string;
}

interface AnkiExportProps {
  cards: AnkiCard[];
}

export default function AnkiExport({ cards }: AnkiExportProps) {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (cards.length === 0) return;
    setIsExporting(true);

    try {
      const csvRows = cards.map((card) => {
        const front = card.front.replace(/"/g, '""');
        const back = card.back.replace(/"/g, '""');
        return `"${front}","${back}"`;
      });
      const csvContent = csvRows.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anki_cards.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      window.alert('エクスポートに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="anki-empty">
        <div className="hex-icon-wrap">
          <Hexagon size={56} stroke={C.dimLight} strokeWidth={1.5} />
          <span className="hex-icon-inner" style={{ fontSize: 24 }}>🃏</span>
        </div>
        <span className="anki-empty-text">カードが生成されませんでした。</span>
        <span className="anki-empty-sub">別の画像で試してみてください。</span>
      </div>
    );
  }

  return (
    <div className="anki-container">
      <div className="anki-header">
        <div className="anki-header-left">
          <div className="anki-header-hex-wrap">
            <Hexagon size={28} fill={C.surface} stroke={C.dimLight} strokeWidth={1} />
            <span className="anki-header-hex-inner">🃏</span>
          </div>
          <div>
            <div className="anki-header-title">ANKI CARDS</div>
            <div className="anki-header-count">{cards.length} 枚生成</div>
          </div>
        </div>
        <button
          className="anki-export-button"
          onClick={handleExportCSV}
          disabled={isExporting}
        >
          {isExporting ? '処理中...' : '⬡ CSV'}
        </button>
      </div>

      <div className="anki-hint">カードをタップすると裏面を確認できます</div>
      <div className="anki-card-list">
        {cards.map((card, index) => {
          const isFlipped = flippedIndex === index;
          return (
            <button
              key={index}
              className={`anki-card ${isFlipped ? 'anki-card-flipped' : ''}`}
              onClick={() => setFlippedIndex(isFlipped ? null : index)}
            >
              <div className="anki-card-header">
                <div className="anki-card-index-hex">
                  <Hexagon
                    size={22}
                    fill={isFlipped ? C.accent : C.surface}
                    stroke={isFlipped ? C.accent : C.dim}
                    strokeWidth={1}
                  />
                  <span className={`anki-card-index-inner ${isFlipped ? 'anki-card-index-text-flipped' : ''}`}>
                    <span className={`anki-card-index-text ${isFlipped ? 'anki-card-index-text-flipped' : ''}`}>
                      {index + 1}
                    </span>
                  </span>
                </div>
                <span className="anki-card-side">
                  {isFlipped ? '裏面 (答え)' : '表面 (問い)'}
                </span>
              </div>
              <p className={`anki-card-text ${isFlipped ? 'anki-card-text-back' : ''}`}>
                {isFlipped ? card.back : card.front}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
