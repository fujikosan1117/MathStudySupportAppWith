# Raspberry Pi サーバーセットアップ手順書

## 1. 概要

Gemini Study Partner のバックエンド (Node.js/Express) を Raspberry Pi 上で常時稼働させ、
同一 LAN 内のスマートフォン (Expo Go) からアクセスできるようにする。

```
スマートフォン (Expo Go)
       │
       │  HTTP POST /v1/analyze
       │  (Wi-Fi 同一 LAN)
       ▼
Raspberry Pi (Express :3000)
       │
       │  HTTPS (外部 API)
       ▼
Google Gemini API
```

---

## 2. 前提条件

### ハードウェア

| 項目 | 推奨 |
|------|------|
| Raspberry Pi | 4 Model B (2GB 以上) または 5 |
| microSD カード | 16GB 以上 (32GB 推奨) |
| 電源 | USB-C 5V/3A 以上 |
| ネットワーク | 有線 LAN または Wi-Fi (スマホと同一 LAN) |

> Raspberry Pi 3B+ でも動作可能だが、`npm install` やビルド時に時間がかかる。

### ソフトウェア

| 項目 | バージョン |
|------|-----------|
| Raspberry Pi OS | Bookworm (64-bit) 推奨 |
| Node.js | v18 以上 (fetch API が必要) |
| npm | v9 以上 |
| Git | 最新 |

---

## 3. Raspberry Pi OS の初期設定

### 3.1 OS インストール

1. [Raspberry Pi Imager](https://www.raspberrypi.com/software/) をダウンロード
2. microSD に Raspberry Pi OS (64-bit) を書き込み
3. Imager の詳細設定で以下を事前設定：
   - ホスト名: `studyserver` (任意)
   - SSH を有効化
   - Wi-Fi 接続情報 (SSID / パスワード)
   - ユーザー名 / パスワード

### 3.2 SSH 接続

```bash
# Mac / Linux から接続
ssh <ユーザー名>@studyserver.local
# または IP アドレスで接続
ssh <ユーザー名>@192.168.x.x
```

### 3.3 システム更新

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 4. Node.js インストール

Raspberry Pi OS 標準の Node.js は古い場合があるため、NodeSource から v20 LTS をインストール。

```bash
# NodeSource リポジトリ追加 (Node.js 20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js インストール
sudo apt install -y nodejs

# バージョン確認
node -v   # v20.x.x
npm -v    # v10.x.x
```

### ビルドツール (念のためインストール)

```bash
sudo apt install -y build-essential git
```

---

## 5. プロジェクトのデプロイ

### 5.1 ソースコードの転送

**方法 A: Git 経由 (推奨)**

```bash
# ラズパイ上で
cd ~
git clone <リポジトリURL> BenkyoSupportApp
```

**方法 B: SCP で直接転送**

```bash
# Mac から実行 (backend ディレクトリだけ転送)
scp -r /path/to/BenkyoSupportApp/backend <ユーザー名>@studyserver.local:~/backend
```

### 5.2 依存パッケージのインストール

```bash
cd ~/BenkyoSupportApp/backend
# または cd ~/backend (SCP の場合)

npm install
```

### 5.3 環境変数ファイルの作成

```bash
cp .env.example .env
nano .env
```

`.env` の内容：

```env
GEMINI_API_KEY=AIzaSy__________________________________
PORT=3000
```

> API キーは https://aistudio.google.com/app/apikey から取得。

### 5.4 ビルドと動作確認

```bash
# TypeScript コンパイル
npm run build

# 起動テスト
npm start
```

別ターミナルからヘルスチェック：

```bash
curl http://localhost:3000/health
# {"status":"ok","model":"gemini-2.5-flash (Gemini API)"}
```

---

## 6. PM2 でプロセス常時稼働

PM2 はNode.js プロセスマネージャ。クラッシュ時の自動再起動・ログ管理・OS 起動時の自動起動を提供。

### 6.1 PM2 インストール

```bash
sudo npm install -g pm2
```

### 6.2 ecosystem.config.js の配置

プロジェクトに同梱の `backend/ecosystem.config.js` を使用：

```bash
cd ~/BenkyoSupportApp/backend

# ビルド済みであることを確認
npm run build

# PM2 で起動
pm2 start ecosystem.config.js
```

### 6.3 PM2 基本操作

| コマンド | 説明 |
|---------|------|
| `pm2 start ecosystem.config.js` | 起動 |
| `pm2 stop study-api` | 停止 |
| `pm2 restart study-api` | 再起動 |
| `pm2 logs study-api` | ログ表示 |
| `pm2 logs study-api --lines 50` | 直近 50 行のログ |
| `pm2 monit` | リアルタイムモニター (CPU/メモリ) |
| `pm2 status` | 全プロセスの状態一覧 |
| `pm2 delete study-api` | プロセス削除 |

### 6.4 OS 起動時に自動起動

```bash
# systemd サービスとして登録
pm2 startup systemd
# 表示されたコマンド (sudo env PATH=...) をコピーして実行

# 現在のプロセスリストを保存
pm2 save
```

これにより、ラズパイの再起動後もバックエンドが自動で立ち上がる。

---

## 7. ネットワーク設定

### 7.1 ラズパイの IP アドレスを確認

```bash
hostname -I
# 例: 192.168.1.50
```

### 7.2 IP アドレスの固定 (推奨)

DHCP だと IP が変わる可能性があるため、固定 IP を設定する。

**方法 A: ルーター側で DHCP 予約 (推奨)**

ルーターの管理画面でラズパイの MAC アドレスに対して IP を予約する。

**方法 B: ラズパイ側で静的 IP 設定**

```bash
sudo nmcli con show
# アクティブな接続名を確認 (例: "preconfigured" や "Wired connection 1")

# Wi-Fi の場合
sudo nmcli con mod "preconfigured" \
  ipv4.addresses 192.168.1.50/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "8.8.8.8,8.8.4.4" \
  ipv4.method manual

# 有線 LAN の場合
sudo nmcli con mod "Wired connection 1" \
  ipv4.addresses 192.168.1.50/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "8.8.8.8,8.8.4.4" \
  ipv4.method manual

# 設定を反映
sudo nmcli con up "preconfigured"
```

> `192.168.1.50` と `192.168.1.1` は自分のネットワーク環境に合わせて変更。

### 7.3 ファイアウォール (必要に応じて)

```bash
# ufw がインストールされている場合
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

---

## 8. フロントエンド側の設定変更

### 8.1 API_URL をラズパイの IP に変更

`src/services/geminiService.ts` を編集：

```typescript
// 変更前
const API_URL = 'http://192.168.1.23:3000/v1/analyze';

// 変更後 (ラズパイの固定 IP に合わせる)
const API_URL = 'http://192.168.1.50:3000/v1/analyze';
```

### 8.2 接続確認

スマホのブラウザからヘルスチェック URL にアクセス：

```
http://192.168.1.50:3000/health
```

`{"status":"ok","model":"gemini-2.5-flash (Gemini API)"}` が表示されれば接続成功。

---

## 9. デプロイスクリプト (更新時)

ソースコード更新時にラズパイ上で実行するスクリプト。
プロジェクトに `backend/deploy.sh` として同梱：

```bash
cd ~/BenkyoSupportApp/backend
bash deploy.sh
```

処理内容：
1. `git pull` で最新コードを取得
2. `npm install` で依存関係を更新
3. `npm run build` で TypeScript コンパイル
4. `pm2 restart` でサーバー再起動

---

## 10. 運用・監視

### 10.1 ログの確認

```bash
# リアルタイムログ
pm2 logs study-api

# ログファイルの場所
ls ~/.pm2/logs/
# study-api-out.log  (標準出力)
# study-api-error.log (エラー出力)
```

### 10.2 リソース監視

```bash
# PM2 モニター (CPU / メモリ)
pm2 monit

# システム全体
htop
```

### 10.3 ディスク使用量

```bash
df -h
```

### 10.4 ログローテーション

ログが肥大化しないように PM2 のログローテーションモジュールを導入：

```bash
pm2 install pm2-logrotate

# 設定 (任意)
pm2 set pm2-logrotate:max_size 10M      # 1ファイル最大 10MB
pm2 set pm2-logrotate:retain 7          # 7世代保持
pm2 set pm2-logrotate:compress true     # 古いログを圧縮
```

---

## 11. トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `npm install` が非常に遅い | ラズパイの I/O 性能 | USB 3.0 接続の SSD ブートに変更、または `npm ci` を使用 |
| `GLIBC_X.XX not found` | OS が古い | `sudo apt update && sudo apt upgrade -y` で更新 |
| `fetch is not defined` | Node.js 18 未満 | `node -v` で確認し、v18 以上をインストール |
| スマホから接続できない | 同一 LAN にいない | スマホとラズパイが同じ Wi-Fi / ネットワークにあるか確認 |
| スマホから接続できない | ポート未開放 | `sudo ufw allow 3000/tcp` でポートを開放 |
| スマホから接続できない | IP アドレスが変わった | `hostname -I` で最新 IP を確認。固定 IP を設定 |
| PM2 がクラッシュを繰り返す | `.env` 未設定 / ビルド忘れ | `pm2 logs` でエラー確認。`npm run build` を再実行 |
| メモリ不足 | Node.js のヒープ超過 | `ecosystem.config.js` の `max_memory_restart` を調整 |
| `tsc` ビルドエラー | expo/tsconfig.base が見つからない | `backend/tsconfig.json` から `"extends"` 行を削除 (対応済み) |

---

## 12. セキュリティ注意事項

- `.env` の `GEMINI_API_KEY` は外部に公開しないこと
- ラズパイを外部ネットワーク (インターネット) に公開しないこと (LAN 内利用を想定)
- SSH のパスワードは十分に強固なものを設定する
- 定期的に `sudo apt update && sudo apt upgrade -y` でセキュリティパッチを適用
- 外部公開が必要な場合は、リバースプロキシ (nginx) + HTTPS (Let's Encrypt) を構成すること

---

## 13. 構成図まとめ

```
┌─────────────────────────────────────────────────┐
│              同一 Wi-Fi / LAN                    │
│                                                  │
│  ┌──────────────┐     ┌──────────────────────┐  │
│  │  スマートフォン  │     │   Raspberry Pi       │  │
│  │  (Expo Go)    │     │                      │  │
│  │               │     │  Node.js v20         │  │
│  │  API_URL:     │────▶│  Express :3000       │  │
│  │  192.168.1.50 │     │  PM2 (常時稼働)       │  │
│  │  :3000        │◀────│                      │  │
│  │               │     │  .env                │  │
│  └──────────────┘     │   GEMINI_API_KEY=... │  │
│                        └──────────┬───────────┘  │
│                                   │              │
└───────────────────────────────────┼──────────────┘
                                    │ HTTPS
                                    ▼
                        ┌───────────────────────┐
                        │  Google Gemini API     │
                        │  gemini-2.5-flash      │
                        └───────────────────────┘
```
