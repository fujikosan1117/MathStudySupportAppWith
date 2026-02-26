/**
 * ModeSelector.tsx — 横スクロール式モード選択タブ (レガシー)
 *
 * 現在の MainScreen では使用されていないが、
 * 将来的にコンパクトなモード切替が必要な場面で再利用可能。
 */
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { AppMode } from '../types';
import { Hexagon, C } from './HexUI';

interface ModeSelectorProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

const MODES: { key: AppMode; label: string; icon: string }[] = [
  { key: 'SOLVE', label: '解いて', icon: '🧮' },
  { key: 'GRADE', label: '採点', icon: '📝' },
  { key: 'OCR', label: 'テキスト化', icon: '🔍' },
  { key: 'ANKI', label: 'Anki', icon: '🃏' },
];

export default function ModeSelector({ currentMode, onSelectMode }: ModeSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {MODES.map((mode) => {
          const isActive = mode.key === currentMode;
          return (
            <TouchableOpacity
              key={mode.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onSelectMode(mode.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabHexWrap}>
                <Hexagon
                  size={20}
                  fill={isActive ? C.bg : C.surface}
                  stroke={isActive ? C.bg : C.dim}
                  strokeWidth={1}
                />
                <View style={styles.tabHexInner}>
                  <Text style={styles.tabHexIcon}>{mode.icon}</Text>
                </View>
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>{mode.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111111',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabHexIcon: {
    fontSize: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  activeLabel: {
    color: '#000000',
  },
});
