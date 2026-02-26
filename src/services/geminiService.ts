/**
 * geminiService.ts — バックエンド API との通信サービス
 *
 * Expo の環境変数から開発 PC の IP を自動検出し、
 * バックエンド (POST /v1/analyze) へ画像データを送信する。
 * 120 秒のタイムアウト付き fetch で通信する。
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { CapturePayload, GeminiResponse } from '../types';

/**
 * バックエンドAPIのURLを自動検出する。
 *
 * 優先順位:
 * 1. Expo の debuggerHost / hostUri から開発 PC の IP を取得
 * 2. Android エミュレータ → 10.0.2.2
 * 3. フォールバック → localhost
 */
function getApiUrl(): string {
  const port = 3000;

  // Expo SDK 49+ では expoConfig.hostUri、それ以前は manifest 系
  const expoConfig = Constants.expoConfig as unknown as Record<string, unknown> | null;
  const constants = Constants as unknown as Record<string, unknown>;
  const manifest = constants.manifest as Record<string, unknown> | undefined;

  const debuggerHost =
    (expoConfig?.hostUri as string | undefined) ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost ??
    (manifest?.debuggerHost as string | undefined);

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:${port}/v1/analyze`;
  }

  // Android エミュレータはホストマシンに 10.0.2.2 でアクセス
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}/v1/analyze`;
  }

  return `http://localhost:${port}/v1/analyze`;
}

const API_URL = getApiUrl();

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

      return await response.json() as GeminiResponse;
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
