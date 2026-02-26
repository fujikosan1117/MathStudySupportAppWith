/**
 * ResultView.tsx — AI 解析結果の表示画面
 *
 * モードに応じた表示を切り替える:
 *  - SOLVE / OCR: MathRenderer で Markdown + LaTeX 描画
 *  - GRADE:       スコア表示 + MathRenderer
 *  - ANKI:        AnkiExport でカード一覧 + CSV エクスポート
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { GeminiResponse, AppMode } from '../types';
import MathRenderer from './MathRenderer';
import AnkiExport from './AnkiExport';
import { Hexagon, HexDivider, HexGridBackground, ScanLine, C } from './HexUI';

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

const MODE_ICONS: Record<AppMode, string> = {
  SOLVE: '🧮',
  GRADE: '📝',
  OCR: '🔍',
  ANKI: '🃏',
};

export default function ResultView({ result, mode, onBack }: ResultViewProps) {
  if (!result.success) {
    return (
      <View style={styles.errorContainer}>
        <HexGridBackground />
        <View style={styles.errorHexWrap}>
          <Hexagon size={56} stroke={C.dimLight} strokeWidth={1.5} />
          <View style={styles.errorHexInner}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>
        </View>
        <Text style={styles.errorTitle}>解析に失敗しました</Text>
        <Text style={styles.errorMessage}>{result.error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 撮り直す</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <View style={styles.backHexWrap}>
            <Hexagon size={16} stroke={C.dimLight} />
          </View>
          <Text style={styles.backLinkText}>BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Hexagon size={14} stroke={C.dim} />
          <Text style={styles.headerTitle}>{MODE_LABELS[mode]}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* GRADE モード: スコア表示 */}
      {mode === 'GRADE' && result.data.score !== undefined && (
        <View style={styles.scoreCard}>
          <View style={styles.scoreHexWrap}>
            <Hexagon size={80} stroke={C.accent} strokeWidth={1} opacity={0.15} />
            <View style={styles.scoreHexInner}>
              <Text style={[styles.scoreValue, getScoreStyle(result.data.score)]}>
                {result.data.score}
              </Text>
            </View>
          </View>
          <Text style={styles.scoreMax}>/ 100 点</Text>
        </View>
      )}

      {/* コンテンツ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'ANKI' ? (
          <AnkiExport cards={result.data.ankiCards ?? []} />
        ) : (
          <MathRenderer content={result.data.content} />
        )}
      </ScrollView>
    </View>
  );
}

function getScoreStyle(score: number) {
  if (score >= 80) return { color: '#FFFFFF' };
  if (score >= 50) return { color: '#AAAAAA' };
  return { color: '#666666' };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 12,
  },
  backHexWrap: {
    opacity: 0.6,
  },
  backLinkText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 64,
  },
  scoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  scoreHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '900',
  },
  scoreMax: {
    fontSize: 14,
    color: '#555555',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#000000',
    gap: 12,
  },
  errorHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorMessage: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
