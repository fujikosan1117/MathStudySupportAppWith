import { CapturePayload, GeminiResponse } from '../types';

const API_URL = '/api/analyze';

export class GeminiStudyService {
  public static async analyzeImage(payload: CapturePayload): Promise<GeminiResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return (await response.json()) as GeminiResponse;
    } catch (error) {
      console.error('Gemini Analysis Failed:', error);
      return {
        success: false,
        data: { content: '' },
        error: 'AI解析中にエラーが発生しました。通信環境を確認してください。',
      };
    }
  }
}
