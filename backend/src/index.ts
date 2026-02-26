/**
 * index.ts — Express バックエンドサーバーのエントリーポイント
 *
 * ポート 3000 で起動し、以下のエンドポイントを提供:
 *  - POST /v1/analyze: 画像を受け取り Gemini API で解析
 *  - GET  /health:     ヘルスチェック
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY が .env に未設定。アプリ側から API Key を送信してください。');
}

const app = express();
const PORT = process.env.PORT ?? 3000;

// base64 エンコード画像を受け取るため上限を 10MB に設定
app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.use('/v1/analyze', analyzeRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', model: 'gemini-2.5-flash (Gemini API)' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀  Gemini Study Partner Backend`);
  console.log(`    http://0.0.0.0:${PORT}`);
  console.log(`    POST /v1/analyze — 画像解析エンドポイント`);
  console.log(`    GET  /health    — ヘルスチェック`);
});
