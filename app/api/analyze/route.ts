import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/gemini';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import type { AppMode, GeminiResponse } from '@/types';

const VALID_MODES: AppMode[] = ['SOLVE', 'GRADE', 'OCR', 'ANKI'];

export async function POST(request: Request) {
  const { base64Image, mode, context, apiKey } = (await request.json()) as {
    base64Image?: string;
    mode?: string;
    context?: string;
    apiKey?: string;
  };

  if (!base64Image || typeof base64Image !== 'string') {
    return NextResponse.json(
      {
        success: false,
        data: { content: '' },
        error: 'base64Image は必須です。',
      } satisfies GeminiResponse,
      { status: 400 }
    );
  }

  if (!mode || !VALID_MODES.includes(mode as AppMode)) {
    return NextResponse.json(
      {
        success: false,
        data: { content: '' },
        error: `mode は ${VALID_MODES.join(' / ')} のいずれかを指定してください。`,
      } satisfies GeminiResponse,
      { status: 400 }
    );
  }

  let prompt = SYSTEM_PROMPTS[mode as AppMode];
  if (context) {
    prompt += `\n\n補足情報: ${context}`;
  }

  try {
    const result = await analyzeImage(base64Image, prompt, mode, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analyze] Gemini API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: { content: '' },
        error: 'AI解析中にエラーが発生しました。APIキーや通信環境を確認してください。',
      } satisfies GeminiResponse,
      { status: 500 }
    );
  }
}
