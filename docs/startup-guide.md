# Gemini Study Partner — 起動仕様書

## 1. プロジェクト概要

**Gemini Study Partner** は、Expo + React Native (フロントエンド) と Node.js/Express (バックエンド) で構成される勉強サポートアプリ。カメラで撮影した問題画像を Google Gemini 2.5 Flash API で解析し、4 つのモードで学習を支援する。

| モード | 説明 |
|--------|------|
| SOLVE (🧮 解いて) | 問題を解き、LaTeX 数式付きでステップごとに解説 |
| GRADE (📝 採点) | 生徒の解答を 100 点満点で採点しフィードバック |
| OCR (🔍 テキスト化) | 画像内テキストを Markdown + LaTeX で抽出 |
| ANKI (🃏 Anki) | 重要用語から暗記カード (3〜15 枚) を生成し CSV エクスポート |

---

## 2. 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Expo | ~54.0.0 | React Native 開発フレームワーク |
| React | 19.1.0 | UI ライブラリ |
| React Native | 0.81.5 | モバイルアプリ基盤 |
| TypeScript | ^5.3.0 | 型安全な開発 |
| Zustand | ^5.0.0 | 状態管理 |
| expo-camera | ~17.0.10 | カメラアクセス |
| expo-sharing | ~14.0.8 | ファイル共有 (CSV エクスポート) |
| expo-file-system | ~19.0.21 | ファイル操作 |
| react-native-webview | 13.15.0 | KaTeX 数式レンダリング |
| react-native-svg | 15.12.1 | SVG 描画 (設定画面デザイン) |
| @react-native-async-storage/async-storage | 2.2.0 | API キー永続化 |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Node.js | — | ランタイム |
| Express | ^4.18.3 | Web フレームワーク |
| TypeScript | ^5.3.3 | 型安全な開発 |
| cors | ^2.8.5 | CORS ミドルウェア |
| dotenv | ^16.4.0 | 環境変数管理 |
| ts-node | ^10.9.2 | TypeScript 直接実行 |
| nodemon | ^3.1.0 | ファイル変更時の自動再起動 |

### 外部 API

| サービス | モデル | 用途 |
|----------|--------|------|
| Google Gemini API | gemini-2.5-flash | 画像解析 (fetch で直接呼び出し) |
| KaTeX CDN | v0.16.9 (jsdelivr) | LaTeX 数式描画 |

---

## 3. ディレクトリ構成

```
BenkyoSupportApp/
├── App.tsx                              # エントリーポイント (SafeAreaProvider + MainScreen)
├── app.json                             # Expo 設定 (アプリ名・パーミッション・ネットワーク)
├── babel.config.js                      # Babel プリセット設定
├── tsconfig.json                        # フロントエンド TypeScript 設定
├── package.json                         # フロントエンド依存関係
│
├── src/
│   ├── types/index.ts                   # 型定義 (AppMode, GeminiResponse, CapturePayload)
│   ├── constants/prompts.ts             # AI システムプロンプト (4 モード分)
│   ├── store/appStore.ts                # Zustand ストア (モード・処理状態・結果)
│   ├── services/geminiService.ts        # バックエンド通信 (HTTP POST)
│   ├── screens/
│   │   ├── MainScreen.tsx               # メイン画面 (home/camera/processing/result 状態機械)
│   │   └── SettingsScreen.tsx           # API キー設定画面 (ヘキサゴンデザイン)
│   └── components/
│       ├── ModeSelector.tsx             # モード選択タブ (横スクロール)
│       ├── CameraView.tsx               # カメラ撮影モーダル (expo-camera v16)
│       ├── ResultView.tsx               # 結果表示 (モード別)
│       ├── MathRenderer.tsx             # WebView + KaTeX (LaTeX レンダリング)
│       └── AnkiExport.tsx               # Anki カード一覧 + CSV エクスポート
│
└── backend/
    ├── package.json                     # バックエンド依存関係
    ├── tsconfig.json                    # バックエンド TypeScript 設定
    ├── .env.example                     # 環境変数テンプレート
    ├── .env                             # 環境変数 (GEMINI_API_KEY, PORT)
    └── src/
        ├── index.ts                     # Express サーバー (port 3000, 0.0.0.0)
        ├── routes/analyze.ts            # POST /v1/analyze エンドポイント
        ├── services/gemini.ts           # Gemini API 呼び出し + レスポンスパース
        └── constants/prompts.ts         # AI システムプロンプト (バックエンド用)
```

---

## 4. 前提条件

### 必須ソフトウェア

| ソフトウェア | 確認コマンド | 備考 |
|-------------|-------------|------|
| Node.js (v18+) | `node -v` | LTS 推奨 |
| npm | `npm -v` | Node.js に同梱 |
| Expo CLI | `npx expo --version` | npx 経由で利用可能 |
| Expo Go アプリ | — | 実機テスト時に App Store / Google Play からインストール |

### 必須アカウント・キー

| 項目 | 取得先 |
|------|--------|
| Google Gemini API キー | https://aistudio.google.com/app/apikey |

---

## 5. 環境変数

### バックエンド (`backend/.env`)

| 変数名 | 必須 | デフォルト | 説明 |
|--------|------|-----------|------|
| `GEMINI_API_KEY` | はい (*) | — | Gemini API キー (`AIzaSy...` 形式) |
| `PORT` | いいえ | `3000` | Express サーバーのポート番号 |

> (*) フロントエンドの設定画面から API キーを送信することも可能だが、`.env` に設定しておくことを推奨。

### フロントエンド

環境変数ファイルは不要。以下の設定はソースコード内で管理：

| 設定項目 | ファイル | 現在値 |
|----------|---------|--------|
| API エンドポイント | `src/services/geminiService.ts` | `http://192.168.1.23:3000/v1/analyze` |
| API キー | AsyncStorage (設定画面から入力) | — |

---

## 6. バックエンド起動手順

### 6.1 初回セットアップ

```bash
# 1. バックエンドディレクトリに移動
cd backend

# 2. 環境変数ファイルを作成
cp .env.example .env

# 3. .env を編集して Gemini API キーを設定
#    GEMINI_API_KEY=AIzaSy... の形式で記入

# 4. 依存パッケージをインストール
npm install
```

### 6.2 開発モードで起動

```bash
cd backend
npm run dev
```

- **実行内容**: `nodemon --exec ts-node src/index.ts`
- nodemon がファイル変更を監視し、自動で再起動する
- TypeScript を ts-node で直接実行 (コンパイル不要)

### 6.3 プロダクションモードで起動

```bash
cd backend
npm run build   # TypeScript → JavaScript にコンパイル (dist/ に出力)
npm start       # コンパイル済み JavaScript を実行
```

### 6.4 起動確認

サーバー起動後、以下のログが表示される：

```
🚀 Server running on port 3000
📡 Gemini model: gemini-2.5-flash (Gemini API)
```

ヘルスチェック API で動作を確認：

```bash
curl http://localhost:3000/health
# 期待レスポンス: {"status":"ok","model":"gemini-2.5-flash (Gemini API)"}
```

### 6.5 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発モード起動 (nodemon + ts-node、ホットリロード対応) |
| `npm run build` | TypeScript コンパイル (`dist/` に出力) |
| `npm start` | プロダクション起動 (`dist/index.js` を実行) |

---

## 7. フロントエンド起動手順

### 7.1 初回セットアップ

```bash
# 1. プロジェクトルートに移動
cd /path/to/BenkyoSupportApp

# 2. 依存パッケージをインストール
npm install
```

### 7.2 API エンドポイントの設定

`src/services/geminiService.ts` 内の `API_URL` を実行環境に合わせて変更する：

| 実行環境 | API_URL |
|---------|---------|
| iOS シミュレータ | `http://localhost:3000/v1/analyze` |
| Android エミュレータ | `http://10.0.2.2:3000/v1/analyze` |
| 実機 (Expo Go) | `http://<開発 PC の IP>:3000/v1/analyze` |

開発 PC の IP アドレス確認 (macOS)：

```bash
ipconfig getifaddr en0
# 例: 192.168.1.23
```

### 7.3 Expo 開発サーバーを起動

```bash
npx expo start
```

起動後の操作：

| キー | 動作 |
|------|------|
| `i` | iOS シミュレータで開く |
| `a` | Android エミュレータで開く |
| QR コードスキャン | Expo Go アプリで実機起動 |

### 7.4 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `npm start` | Expo 開発サーバー起動 (`expo start`) |
| `npm run android` | Android エミュレータで起動 |
| `npm run ios` | iOS シミュレータで起動 |

---

## 8. 通信フロー

```
┌──────────────────────────────────────────────────────────────┐
│                     フロントエンド (Expo)                      │
│                                                              │
│  MainScreen → CameraView → 撮影 (base64)                     │
│       ↓                                                      │
│  appStore.processImage(base64)                               │
│       ↓                                                      │
│  GeminiStudyService.analyzeImage({base64Image, mode, apiKey})│
│       ↓                                                      │
│  HTTP POST /v1/analyze                                       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  バックエンド (Express :3000)                  │
│                                                              │
│  POST /v1/analyze → バリデーション → analyzeImage()            │
│       ↓                                                      │
│  base64 パース → Gemini API 呼び出し (fetch)                  │
│       ↓                                                      │
│  モード別レスポンスパース:                                     │
│    SOLVE/OCR → content (テキスト)                             │
│    GRADE    → content + score (0-100)                        │
│    ANKI     → ankiCards [{front, back}, ...]                 │
│       ↓                                                      │
│  GeminiResponse を返却                                       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Google Gemini API (外部)                         │
│  URL: generativelanguage.googleapis.com/v1beta/models        │
│  モデル: gemini-2.5-flash                                    │
│  パラメータ: temperature=0.2, topP=0.8, maxOutputTokens=2048 │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. API エンドポイント仕様

### GET /health

ヘルスチェック。

**レスポンス (200)**:
```json
{
  "status": "ok",
  "model": "gemini-2.5-flash (Gemini API)"
}
```

### POST /v1/analyze

画像解析エンドポイント。

**リクエストヘッダ**:
```
Content-Type: application/json
```

**リクエストボディ**:
```json
{
  "base64Image": "iVBORw0KG...",   // 必須: base64 エンコード画像 (最大 10MB)
  "mode": "SOLVE",                  // 必須: "SOLVE" | "GRADE" | "OCR" | "ANKI"
  "context": "高校数学",             // 任意: 追加コンテキスト
  "apiKey": "AIzaSy..."            // 任意: .env の API キーを上書き
}
```

**成功レスポンス (200)**:
```json
{
  "success": true,
  "data": {
    "content": "解説テキスト...",
    "steps": ["ステップ1", "ステップ2"],
    "score": 85,
    "ankiCards": [
      { "front": "問題文", "back": "解答" }
    ]
  }
}
```

| フィールド | SOLVE | GRADE | OCR | ANKI |
|-----------|-------|-------|-----|------|
| `content` | あり | あり | あり | 空文字 |
| `score` | — | あり (0-100) | — | — |
| `ankiCards` | — | — | — | あり |

**エラーレスポンス (400 / 500)**:
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

---

## 10. 同時起動の手順まとめ

### ターミナル 1: バックエンド

```bash
cd /path/to/BenkyoSupportApp/backend
npm run dev
```

### ターミナル 2: フロントエンド

```bash
cd /path/to/BenkyoSupportApp
npx expo start
```

### 起動順序

1. **バックエンドを先に起動** — フロントエンドが API にアクセスするため
2. **フロントエンドを起動** — Expo 開発サーバーが立ち上がったら端末で接続

---

## 11. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `Network request failed` | API_URL が正しくない | `geminiService.ts` の API_URL を実行環境に合わせて変更 |
| `GEMINI_API_KEY is not set` | API キー未設定 | `backend/.env` にキーを設定、またはアプリの設定画面から入力 |
| `Render Error` (Metro) | metro.config.js の blockList | metro.config.js を削除 (`.bak` にリネーム済み) |
| カメラが起動しない | パーミッション未許可 | デバイス設定からカメラ権限を許可 |
| 実機から接続できない | ファイアウォール / 同一 LAN 外 | 開発 PC と実機が同じ Wi-Fi に接続されていることを確認 |
| `413 Payload Too Large` | 画像サイズ超過 | Express の JSON 上限は 10MB。画像の quality を下げる |
| ポート 3000 使用中 | 他プロセスが占有 | `lsof -i :3000` で確認し、プロセスを停止するか `.env` で PORT を変更 |

---

## 12. 注意事項

- `metro.config.js` は使用しないこと。blockList を設定すると Render Error が発生するため、`.bak` としてバックアップ済み。
- フロントエンドとバックエンドの `src/constants/prompts.ts` は同一内容。変更時は両方を同期すること。
- `app.json` の `NSAppTransportSecurity` で HTTP 通信を許可しているが、本番環境では HTTPS に移行すること。
- `@google/generative-ai` パッケージはバックエンドの `package.json` に含まれているが、実際には使われていない (fetch で直接呼び出し)。
