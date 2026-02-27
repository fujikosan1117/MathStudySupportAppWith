import type { GeminiResponse } from '@/types';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.5-flash';

function parseBase64Image(base64Image: string): { data: string; mimeType: string } {
  const dataUrlPattern = /^data:(image\/\w+);base64,(.+)$/;
  const match = base64Image.match(dataUrlPattern);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: base64Image };
}

function extractAnkiCards(text: string): { front: string; back: string }[] {
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = codeBlockMatch ? codeBlockMatch[1] : text;

  const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
  if (!arrayMatch) return [];

  try {
    const parsed = JSON.parse(arrayMatch[0]);
    if (
      Array.isArray(parsed) &&
      parsed.every((item: { front: unknown; back: unknown }) => typeof item.front === 'string' && typeof item.back === 'string')
    ) {
      return parsed;
    }
  } catch {
    // パース失敗は空配列を返す
  }
  return [];
}

function extractScore(text: string): number | undefined {
  const match = text.match(/score[：:\s]+(\d+)/i);
  if (match) {
    const score = parseInt(match[1], 10);
    if (!isNaN(score) && score >= 0 && score <= 100) {
      return score;
    }
  }
  return undefined;
}

export async function analyzeImage(
  base64Image: string,
  prompt: string,
  mode: string,
  apiKey?: string
): Promise<GeminiResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No API key provided');
  }

  const { data, mimeType } = parseBase64Image(base64Image);

  const url = `${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${key}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    }),
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
  }

  const json = (await response.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const responseData: GeminiResponse['data'] = { content: text };

  if (mode === 'ANKI') {
    responseData.ankiCards = extractAnkiCards(text);
    responseData.content = '';
  } else if (mode === 'GRADE') {
    responseData.score = extractScore(text);
  }

  return { success: true, data: responseData };
}
