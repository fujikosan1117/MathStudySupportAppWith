/**
 * AnkiExport.tsx — Anki カード一覧表示 + CSV エクスポート
 *
 * Gemini が生成した表裏カードをリスト表示し、
 * タップでカードの裏面を確認できる。
 * CSV ボタンで Anki インポート用ファイルを expo-sharing で共有する。
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Hexagon, HexDivider, C } from './HexUI';

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

  const handleExportCSV = async () => {
    if (cards.length === 0) return;
    setIsExporting(true);

    try {
      // Anki 標準の CSV 形式 (front,back)
      const csvRows = cards.map((card) => {
        const front = card.front.replace(/"/g, '""');
        const back = card.back.replace(/"/g, '""');
        return `"${front}","${back}"`;
      });
      const csvContent = csvRows.join('\n');

      const filePath = `${FileSystem.documentDirectory}anki_cards.csv`;
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: 'utf8',
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          UTI: 'public.comma-separated-values-text',
          dialogTitle: 'Anki カードをエクスポート',
        });
      } else {
        Alert.alert('エクスポート完了', `保存先: ${filePath}`);
      }
    } catch (error) {
      Alert.alert('エラー', 'エクスポートに失敗しました。');
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyHexWrap}>
          <Hexagon size={56} stroke={C.dimLight} strokeWidth={1.5} />
          <View style={styles.emptyHexInner}>
            <Text style={styles.emptyIcon}>🃏</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>カードが生成されませんでした。</Text>
        <Text style={styles.emptySubText}>別の画像で試してみてください。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerHexWrap}>
            <Hexagon size={28} fill={C.surface} stroke={C.dimLight} strokeWidth={1} />
            <View style={styles.headerHexInner}>
              <Text style={styles.headerHexIcon}>🃏</Text>
            </View>
          </View>
          <View>
            <Text style={styles.headerTitle}>ANKI CARDS</Text>
            <Text style={styles.headerCount}>{cards.length} 枚生成</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          onPress={handleExportCSV}
          disabled={isExporting}
        >
          <Text style={styles.exportButtonText}>
            {isExporting ? '処理中...' : '⬡ CSV'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* カードリスト */}
      <ScrollView
        style={styles.cardList}
        contentContainerStyle={styles.cardListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hintText}>カードをタップすると裏面を確認できます</Text>
        {cards.map((card, index) => {
          const isFlipped = flippedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.card, isFlipped && styles.cardFlipped]}
              onPress={() => setFlippedIndex(isFlipped ? null : index)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIndexHex}>
                  <Hexagon
                    size={22}
                    fill={isFlipped ? C.accent : C.surface}
                    stroke={isFlipped ? C.accent : C.dim}
                    strokeWidth={1}
                  />
                  <View style={styles.cardIndexInner}>
                    <Text style={[styles.cardIndexText, isFlipped && styles.cardIndexTextFlipped]}>
                      {index + 1}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardSide}>{isFlipped ? '裏面 (答え)' : '表面 (問い)'}</Text>
              </View>
              <Text style={[styles.cardText, isFlipped && styles.cardTextBack]}>
                {isFlipped ? card.back : card.front}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerHexIcon: {
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  headerCount: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
    letterSpacing: 1,
  },
  exportButton: {
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hintText: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardList: {
    flex: 1,
  },
  cardListContent: {
    gap: 10,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minHeight: 80,
  },
  cardFlipped: {
    backgroundColor: '#1A1A1A',
    borderColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cardIndexHex: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIndexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888888',
  },
  cardIndexTextFlipped: {
    color: '#000000',
  },
  cardSide: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  cardText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    paddingLeft: 32,
  },
  cardTextBack: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  emptySubText: {
    fontSize: 13,
    color: '#555555',
  },
});
