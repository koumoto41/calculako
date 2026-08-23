# calculako

「謎の経費精算アプリ」

個人用の経費登録アプリです。日々の経費を費目・購入先ごとに記録し、月単位で集計・確定（ロック）できます。クレジットカードの請求金額とお小遣いを合わせて、その月の収支の目安を表示します。

## システム構成

- DB: MySQL 8.4（スキーマはLaravelのマイグレーションで管理）
- バックエンド: Laravel 13（PHP 8.5） / 認証: Laravel Sanctum（SPA認証）
- フロントエンド: React + TypeScript（Vite）
- Docker Compose 4コンテナ構成
  - `db`: MySQL 8.4
  - `api`: Laravel（PHP-FPM）
  - `front`: React（Vite開発サーバー）
  - `apache`: リバースプロキシ（`http://localhost:8080` が唯一の公開エンドポイント）
- テスト: バックエンド Pest / フロントエンド Jest + React Testing Library
- Lint: バックエンド Laravel Pint / フロントエンド ESLint

## Dockerセットアップ

### 1. 前提

- Docker Desktop がインストールされていること

### 2. 環境変数ファイルの準備

```bash
cp .env.example .env
cp api/.env.example api/.env
cp front/.env.example front/.env
```

### 3. イメージのビルドとコンテナ起動

```bash
docker compose build
docker compose up -d
```

### 4. アプリケーションキーの生成・マイグレーション・シードデータ投入

```bash
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
```

シードデータとして以下が投入されます。

- 費目マスタ: 通販・コンビニ・スーパー・その他
- お小遣いマスタ: デフォルト35,000円
- ログイン用ユーザー: `api/.env` の `ADMIN_EMAIL` / `ADMIN_PASSWORD`で指定したメールアドレス・パスワード（`.env.example`のデフォルト値は`admin@example.com` / `change-me-please`という仮の値なので、`api/.env`で必ず自分のメールアドレス・パスワードに変更してください）

### 5. アクセス

ブラウザで [http://localhost:8080](http://localhost:8080) を開き、上記の管理ユーザーでログインしてください。

> `curl` 等でAPIに直接アクセスする場合は、`Origin`/`Referer` ヘッダーに `http://localhost:8080` を付与してください。Sanctumはこれらのヘッダーを見てセッションCookie認証（stateful）にするかどうかを判定するため、ブラウザ（axios）からのリクエストでは自動的に付与されますが、`curl` では明示的に指定しないと未認証扱いになります。

### 6. テストの実行

```bash
# バックエンド（Pest）
docker compose exec api ./vendor/bin/pest

# フロントエンド（Jest + React Testing Library）
docker compose exec front npm test
```

### 7. Lintの実行

```bash
# バックエンド（Laravel Pint）
docker compose exec api ./vendor/bin/pint

# フロントエンド（ESLint）
docker compose exec front npm run lint
```

### 8. 停止

```bash
docker compose down
```

DBのデータも含めて完全に削除したい場合は `docker compose down -v` を実行してください（`db_data` ボリュームが削除されます）。

## 主な機能

- 経費登録（日付・費目・購入先・内容・金額（税込み）・メモ）
- 費目・購入先のマスタ管理（費目に購入先がぶら下がる構成）
- 各カードの請求金額のマスタ管理と月次入力
- お小遣いのマスタ管理（デフォルト35,000円）
- 月単位の表示切替、月合計・費目別集計の表示
- 月の確定（確定後はその月の経費・カード請求額を編集不可）。ダッシュボードから確定の解除も可能
- 経費登録画面下部に「お小遣い + その月の経費合計 − 各カードの請求金額合計」を表示
