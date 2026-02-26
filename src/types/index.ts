/**
 * types/index.ts — アプリ全体で共有する型定義
 *
 * AppMode:        4 つの解析モード (解く / 採点 / OCR / Anki)
 * GeminiResponse: バックエンド → フロントエンドの統一レスポンス型
 * CapturePayload: フロントエンド → バックエンドへ送る撮影データ
 */
export type AppMode = 'SOLVE' | 'GRADE' | 'OCR' | 'ANKI';

export interface GeminiResponse {
  success: boolean;
  data: {
    content: string;
    score?: number;
    ankiCards?: {
      front: string;
      back: string;
    }[];
  };
  error?: string;
}

export interface CapturePayload {
  base64Image: string;
  mode: AppMode;
  context?: string;
  apiKey?: string;
}
