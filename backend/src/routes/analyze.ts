/**
 * analyze.ts — POST /v1/analyze ルートハンドラ
 *
 * リクエストボディ: { base64Image, mode, context?, apiKey? }
 * バリデーション後、Gemini サービスに渡して解析結果を返す。
 */
import { Router, Request, Response } from 'express';
import { analyzeImage, GeminiResponse } from '../services/gemini';
import { SYSTEM_PROMPTS } from '../constants/prompts';

const router = Router();

type AppMode = 'SOLVE' | 'GRADE' | 'OCR' | 'ANKI';
const VALID_MODES: AppMode[] = ['SOLVE', 'GRADE', 'OCR', 'ANKI'];

router.post('/', async (req: Request, res: Response) => {
  const { base64Image, mode, context, apiKey } = req.body as {
    base64Image?: string;
    mode?: string;
    context?: string;
    apiKey?: string;
  };

  // バリデーション
  if (!base64Image || typeof base64Image !== 'string') {
    res.status(400).json({
      success: false,
      data: { content: '' },
      error: 'base64Image は必須です。',
    } satisfies GeminiResponse);
    return;
  }

  if (!mode || !VALID_MODES.includes(mode as AppMode)) {
    res.status(400).json({
      success: false,
      data: { content: '' },
      error: `mode は ${VALID_MODES.join(' / ')} のいずれかを指定してください。`,
    } satisfies GeminiResponse);
    return;
  }

  // プロンプト構築
  let prompt = SYSTEM_PROMPTS[mode as AppMode];
  if (context) {
    prompt += `\n\n補足情報: ${context}`;
  }

  try {
    const result = await analyzeImage(base64Image, prompt, mode, apiKey);
    res.json(result);
  } catch (error) {
    console.error('[analyze] Gemini API error:', error);
    res.status(500).json({
      success: false,
      data: { content: '' },
      error: 'AI解析中にエラーが発生しました。APIキーや通信環境を確認してください。',
    } satisfies GeminiResponse);
  }
});

export default router;
