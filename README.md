# 🧊 立川田中家冷蔵庫管理

DaveとMinakoの2名で共有する冷蔵庫・冷凍庫在庫管理システム

## 📋 プロジェクト概要

- **名称**: 立川田中家冷蔵庫管理
- **目的**: 冷蔵庫・冷凍庫の食材在庫を管理し、消費期限切れを防いで食品ロスを削減
- **ユーザー**: Dave & Minako（2名で共有）
- **開発時間**: 約1時間（AI活用による高速開発）
- **技術スタック**: Hono + Cloudflare Pages + D1 Database + TypeScript

## 🌟 特徴

- ✨ **ノーコード感覚の開発**: AI支援により、コーディング知識なしでモダンなWebアプリを構築
- 🚀 **超高速デプロイ**: GitHubとCloudflare Pagesの連携でワンコマンドデプロイ
- 🌍 **グローバルエッジ配信**: Cloudflareのエッジネットワークで世界中から高速アクセス
- 💾 **リアルタイム同期**: Cloudflare D1データベースで夫婦間のデータ共有
- 📱 **完全レスポンシブ**: スマホ・タブレット・PCすべてに対応

## ✨ 実装済み機能（Phase 1-A 完成版）

### 基本機能
- ✅ アイテム登録・編集・削除
- ✅ 消費期限による自動色分け表示
  - ⚫ **期限切れ：黒色＋薄グレー背景**
  - 🔴 **3日以内：赤色背景**
  - 🟢 **4日以上：緑色背景**
  - ⚪ **期限なし：グレー背景**
- ✅ 保管場所フィルター（メイン冷蔵庫・メイン冷凍庫・サブ冷凍庫）
- ✅ ソート機能（消費期限順・登録日順・名前順）
- ✅ 数量管理
  - 個数指定消費（例：10個中2個消費）
  - 全消費（残数0で自動ステータス変更）
  - プルダウンで1〜9個選択

### UI/UX
- ✅ 2行レイアウト（商品名+期限を大きく、詳細は横並び）
- ✅ シニア世代向けの読みやすいフォントサイズ
- ✅ 太い左端カラーバー（8px）で期限状態を視認性高く表示
- ✅ カスタムロゴ対応（ヘッダー・ファビコン）
- ✅ モバイル対応レスポンシブデザイン
- ✅ ユーザー切替ボタン（Dave ⇄ Minako）

### データ管理
- ✅ Cloudflare D1（SQLite）で永続化
- ✅ 夫婦間でリアルタイムデータ共有
- ✅ 詳細なエラーログ機能
- ✅ 消費期限の絶対日付＋相対表示（例：1月5日（あと3日））

## 🛠️ 技術スタック

### フロントエンド
- **Hono**: 軽量高速なWebフレームワーク
- **TailwindCSS**: ユーティリティファーストCSSフレームワーク
- **Font Awesome**: アイコンライブラリ
- **Axios**: HTTP通信ライブラリ

### バックエンド
- **Hono**: エッジランタイム対応のAPIサーバー
- **TypeScript**: 型安全な開発環境

### インフラ
- **Cloudflare Pages**: グローバルエッジデプロイ
- **Cloudflare D1**: グローバル分散SQLiteデータベース
- **GitHub**: ソース管理・CI/CD

### 開発ツール
- **Vite**: 高速ビルドツール
- **Wrangler**: Cloudflare開発CLI
- **PM2**: プロセス管理（開発環境）

## 🗄️ データモデル

### Users テーブル
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_color TEXT DEFAULT '#3B82F6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Items テーブル
```sql
CREATE TABLE items (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  expiry_date DATE,
  storage_location TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  initial_quantity INTEGER DEFAULT 1,
  memo TEXT,
  registered_by INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registered_by) REFERENCES users(id)
);
```

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

### 本番環境
- **URL**: https://fridge-manager-tachikawa.pages.dev
- **最新デプロイ**: https://0cfcf767.fridge-manager-tachikawa.pages.dev
- **Platform**: Cloudflare Pages
- **Database**: Cloudflare D1 (Production)
- **GitHub**: https://github.com/davetanaka/fridge-manager-tachikawa

### 開発環境
- **URL**: https://3000-it1547xkb562zvfkvo794-c81df28e.sandbox.novita.ai
- **データベース**: Cloudflare D1 (ローカルSQLite)

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
# リポジトリクローン
git clone https://github.com/davetanaka/fridge-manager-tachikawa.git
cd fridge-manager-tachikawa

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

# 本番環境にデプロイ
npm run deploy:prod

# Gitコミット
npm run git:commit "メッセージ"

# ポートクリーンアップ
npm run clean-port
```

## 🌐 Cloudflareデプロイ手順

### 初回デプロイ

```bash
# 1. D1データベース作成
npx wrangler d1 create webapp-production

# 2. wrangler.jsonc にデータベースIDを設定
# （自動生成されたIDをコピー）

# 3. マイグレーション適用
npx wrangler d1 migrations apply webapp-production --remote

# 4. Cloudflare Pagesプロジェクト作成
npx wrangler pages project create fridge-manager-tachikawa --production-branch main

# 5. デプロイ
npm run deploy:prod

# 6. D1データベースをバインド（Cloudflare Dashboard）
# Settings > Functions > D1 database bindings
# 変数名: DB
# D1データベース: webapp-production
```

### 更新デプロイ

```bash
# コードをビルドしてデプロイ
npm run deploy:prod
```

## 🔜 今後の実装予定（Phase 1-B以降）

### Phase 1-B
- ⏳ Google OAuth認証（ログイン・ログアウト）
- ⏳ メール通知機能（毎朝チェック・3日以内期限切れ食材通知）

### Phase 2
- ⏳ バーコードスキャン機能
- ⏳ よく使うアイテムのサジェスト
- ⏳ 統計レポート（月間食品ロス数など）

### Phase 3
- ⏳ レシピ提案機能（期限が近い食材を使ったレシピ）
- ⏳ 買い物リスト連携
- ⏳ 家族メンバー追加機能
- ⏳ 保管場所カスタマイズ

## 📊 成功指標（KPI）

- 食品ロス削減率
- アプリ利用頻度（週あたりの登録数）
- 期限切れ前の消費率
- ユーザー満足度

## 👥 開発者

- **Dave** - プロジェクトオーナー
- **Minako** - 共同利用者

## 📝 変更履歴

### 2026-01-02
- ✅ Phase 1-A完成
  - 基本的な在庫管理機能実装
  - シニア世代向けUI改善
  - カスタムロゴ対応
  - 2行レイアウト採用
  - ユーザー選択機能追加（Dave ⇄ Minako）
  - フォントサイズ調整
  - 色分けルール変更（期限切れ=黒、3日以内=赤、4日以上=緑）
  - 数量選択をプルダウン式に変更（1〜9個）
  - 消費期限入力フィールドのレイアウト修正
  - 詳細なエラーログ実装
  - Cloudflare Pagesへの本番デプロイ完了

## 📄 ライセンス

このプロジェクトはオープンソースとして公開されています。

---

## 🎯 使い方

1. **本番環境にアクセス**: https://fridge-manager-tachikawa.pages.dev
2. **使用者を選択**: ヘッダーで「Dave」または「Minako」をタップ
3. **アイテム追加**: 「＋追加」ボタンをタップして食材を登録
4. **消費期限管理**: 色分け表示で期限をチェック
5. **消費記録**: アイテムをタップして「消費する」ボタンから記録

---

**開発環境URL**: https://3000-it1547xkb562zvfkvo794-c81df28e.sandbox.novita.ai

今すぐアクセスして、立川田中家の冷蔵庫在庫を管理しましょう！
