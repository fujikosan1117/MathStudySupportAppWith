#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "=== Gemini Study Partner — デプロイ ==="

echo "[1/4] 最新コードを取得..."
git pull

echo "[2/4] 依存パッケージを更新..."
npm ci --omit=dev

echo "[3/4] TypeScript ビルド..."
npm run build

echo "[4/4] PM2 再起動..."
if pm2 describe study-api > /dev/null 2>&1; then
  pm2 restart study-api
  echo "  -> study-api を再起動しました"
else
  pm2 start ecosystem.config.js
  pm2 save
  echo "  -> study-api を新規起動しました"
fi

echo ""
echo "=== デプロイ完了 ==="
pm2 status study-api
