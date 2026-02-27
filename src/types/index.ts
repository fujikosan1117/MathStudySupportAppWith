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
