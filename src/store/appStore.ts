import { create } from 'zustand';
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
  loadApiKey: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentMode: 'SOLVE',
  isProcessing: false,
  result: null,
  apiKey: null,

  setMode: (mode) => set({ currentMode: mode, result: null }),

  clearResult: () => set({ result: null }),

  loadApiKey: () => {
    try {
      if (typeof window !== 'undefined') {
        const key = localStorage.getItem(API_KEY_STORAGE);
        set({ apiKey: key });
      }
    } catch {
      // localStorage unavailable
    }
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
