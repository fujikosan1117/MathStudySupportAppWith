/**
 * appStore.ts — Zustand によるグローバル状態管理
 *
 * 管理する状態:
 *  - currentMode:  現在選択中の解析モード
 *  - isProcessing: AI 解析中フラグ
 *  - result:       解析結果 (GeminiResponse)
 *  - apiKey:       ユーザー設定の API キー (AsyncStorage 永続化)
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode, GeminiResponse } from '../types';
import { GeminiStudyService } from '../services/geminiService';

const API_KEY_STORAGE = 'gemini_api_key';

interface AppState {
  currentMode: AppMode;
  isProcessing: boolean;
  result: GeminiResponse | null;
  apiKey: string | null;
  setMode: (mode: AppMode) => void;
  processImage: (base64: string, context?: string) => Promise<void>;
  clearResult: () => void;
  loadApiKey: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentMode: 'SOLVE',
  isProcessing: false,
  result: null,
  apiKey: null,

  setMode: (mode) => set({ currentMode: mode, result: null }),

  clearResult: () => set({ result: null }),

  loadApiKey: async () => {
    const key = await AsyncStorage.getItem(API_KEY_STORAGE);
    set({ apiKey: key });
  },

  processImage: async (base64: string, context?: string) => {
    const { currentMode, apiKey } = get();
    set({ isProcessing: true, result: null });

    const result = await GeminiStudyService.analyzeImage({
      base64Image: base64,
      mode: currentMode,
      ...(apiKey ? { apiKey } : {}),
      ...(context ? { context } : {}),
    });

    set({ isProcessing: false, result });
  },
}));
