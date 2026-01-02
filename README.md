# 🧊 立川田中家冷蔵庫管理

DaveとMinakoの2名で共有する冷蔵庫・冷凍庫在庫管理システム

## 📋 プロジェクト概要

- **名称**: 立川田中家冷蔵庫管理
- **目的**: 冷蔵庫・冷凍庫の食材在庫を管理し、消費期限切れを防いで食品ロスを削減
- **ユーザー**: Dave & Minako（2名で共有）
- **技術スタック**: Hono + Cloudflare Pages + D1 Database

## ✨ 実装済み機能（Phase 1-A）

### 基本機能
- ✅ アイテム登録・編集・削除
- ✅ 消費期限による自動色分け表示
  - 🔴 期限切れ：赤色背景
  - 🟡 3日以内：黄色背景
  - 🟢 4日以上：緑色背景
  - ⚪ 期限なし：グレー背景
- ✅ 保管場所フィルター（メイン冷蔵庫・メイン冷凍庫・サブ冷凍庫）
- ✅ ソート機能（消費期限順・登録日順・名前順）
- ✅ 数量管理
  - 個数指定消費（例：10個中2個消費）
  - 全消費（残数0で自動ステータス変更）

### UI/UX
- ✅ 2行レイアウト（商品名+期限を大きく、詳細は横並び）
- ✅ シニア世代向けの大きめフォントサイズ
- ✅ 太い左端カラーバー（8px）で期限状態を視認性高く表示
- ✅ カスタムロゴ対応（ヘッダー・ファビコン）
- ✅ モバイル対応レスポンシブデザイン

## 🗄️ データモデル

### Users テーブル
- ユーザー情報（Dave, Minako）
- Google OAuth認証情報
- ユーザー識別色

### Items テーブル
- アイテム名、消費期限、保管場所
- 数量管理（初期数量、現在数量、消費数量）
- メモ、登録者、ステータス

### User Settings テーブル
- メール通知設定
- 通知時刻、通知日数しきい値

## 📁 プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx          # メインアプリケーション（Hono + フロントエンド）
│   ├── routes/
│   │   └── items.ts       # アイテムCRUD APIルート
│   ├── types/
│   │   └── index.ts       # TypeScript型定義
│   └── utils.ts           # ユーティリティ関数
├── migrations/
│   └── 0001_initial_schema.sql  # データベーススキーマ
├── public/
│   └── static/
│       ├── logo.png       # ヘッダーロゴ
│       └── favicon.png    # ファビコン
├── seed.sql               # テストデータ
├── wrangler.jsonc         # Cloudflare設定
├── package.json           # 依存パッケージ・スクリプト
└── ecosystem.config.cjs   # PM2設定（開発用）
```

## 🚀 デプロイ情報

### 開発環境
- **URL**: https://3000-it1547xkb562zvfkvo794-c81df28e.sandbox.novita.ai
- **データベース**: Cloudflare D1 (ローカルSQLite)

### 本番環境（予定）
- **Platform**: Cloudflare Pages
- **Database**: Cloudflare D1 (本番環境)
- **Domain**: TBD

## 📦 主要API

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/items` | アイテム一覧取得（フィルター・ソート対応） |
| GET | `/api/items/:id` | 特定アイテム取得 |
| POST | `/api/items` | 新規アイテム登録 |
| PUT | `/api/items/:id` | アイテム更新 |
| DELETE | `/api/items/:id` | アイテム削除 |
| POST | `/api/items/:id/consume` | アイテム消費（個数指定/全消費） |
| GET | `/api/health` | ヘルスチェック |

## 🛠️ ローカル開発

### 必要なもの
- Node.js 18+
- npm

### セットアップ

```bash
# 依存関係インストール
npm install

# データベースマイグレーション（ローカル）
npm run db:migrate:local

# テストデータ投入
npm run db:seed

# ビルド
npm run build

# 開発サーバー起動（PM2使用）
pm2 start ecosystem.config.cjs

# 動作確認
curl http://localhost:3000/api/health
```

### 便利なコマンド

```bash
# データベースリセット
npm run db:reset

# ローカルデータベースコンソール
npm run db:console:local

# Gitコミット
npm run git:commit "メッセージ"

# ポートクリーンアップ
npm run clean-port
```

## 🔜 今後の実装予定（Phase 1-B以降）

### Phase 1-B
- ⏳ Google OAuth認証（ログイン・ログアウト）
- ⏳ メール通知機能（毎朝チェック・3日以内期限切れ食材通知）

### Phase 2
- ⏳ バーコードスキャン機能
- ⏳ よく使うアイテムのサジェスト
- ⏳ 統計レポート（月間食品ロス数など）

## 👥 開発者

- **Dave** - プロジェクトオーナー
- **Minako** - 共同利用者

## 📝 変更履歴

- **2026-01-02**: Phase 1-A完成
  - 基本的な在庫管理機能実装
  - シニア世代向けUI改善
  - カスタムロゴ対応
  - 2行レイアウト採用

## 📄 ライセンス

このプロジェクトはオープンソースとして公開されています。

---

**開発環境URL**: https://3000-it1547xkb562zvfkvo794-c81df28e.sandbox.novita.ai

今すぐアクセスして、立川田中家の冷蔵庫在庫を管理しましょう！
