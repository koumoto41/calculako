# CLAUDE.md

このファイルは、このリポジトリで作業する際のClaude Code（claude.ai/code）向けのガイダンスです。

## このアプリについて

`calculako`は個人向け（単一ユーザー）の経費登録アプリ（経費登録アプリ）です。費目・購入先の階層で経費を記録し、月単位で確定（それ以降は編集不可にロック）でき、月ごとのカード請求額を管理し、以下の残高を表示します。

`お小遣い + その月の経費合計 − 各カードの請求金額合計`

## アーキテクチャ

3つの独立したパートからなるモノレポで、Docker Composeで結合されています。

```
api/       Laravel 13（PHP 8.5）のJSON API + Sanctum SPA認証
front/     React 19 + TypeScript（Vite）。SSRなし
docker/    Dockerfile群 + apacheのリバースプロキシ設定（docker/apache/vhost.conf）
```

4コンテナ構成（`docker-compose.yml`）: `db`（MySQL 8.4）、`api`（PHP-FPM）、`front`（Vite開発サーバーを常時起動。`npm run dev`のみで、このスタックに本番ビルドの工程は存在しない）、`apache`（ホストに公開する唯一のポート`:8080`）。

### apacheリバースプロキシの振り分け（ルーティングを触る前に必読）

`docker/apache/vhost.conf`は、コンテンツの内容ではなく**URLのプレフィックスだけ**で振り分けています。

- `/api/*` と `/sanctum/*` → `fcgi://api:9000/.../public/index.php`（Laravelのフロントコントローラー）へそのままプロキシ。元のURIをそのまま転送しており、**Apache側でのリライトは一切行わない**。（以前のバージョンでは一度`index.php`にリライトしてからプロキシのプレフィックスマッチングを再度走らせていたが、リライト後のURIに対してマッチングし直されるためプレフィックス一致が壊れてしまっていた。ここにリライト処理を再度入れないこと。）
- `/storage/*`、`/build/*` → SPAへのcatch-allから除外し、`api/public`（apacheコンテナに読み取り専用でマウント）から静的ファイルとして配信。
- それ以外（HMR用の`/@vite`のWebSocketも含む）→ `front:5173`へプロキシ。

**結果として**、Laravel側のエンドポイントのURLは必ず`/api`か`/sanctum`配下に置く必要があります（メソッドによる振り分けは一切ない）。そのため、ログイン・ログアウトは（`routes/api.php`ではなく）`routes/web.php`側で`POST /api/login`・`POST /api/logout`として登録しています（`web`ミドルウェアグループ＝セッション・CSRFに乗せるため）。一般的な`/login`という素のパスにしなかったのはこのためです。`/login`自体はReact Routerのページパスであり、ブラウザから普通に`GET`でアクセスされます。もしLaravel側のルートがこの完全一致パスを奪ってしまうと、ブラウザで直接`/login`を開いたときにSPAではなくLaravelの生のJSONエラーが表示されてしまいます。

### 認証

Sanctum SPA（セッションCookie）認証で、シードされた単一ユーザーのみ。会員登録フローはありません。`bootstrap/app.php`で`$middleware->statefulApi()`を呼び、`Authenticate::redirectUsing(fn () => null)`で上書きしています（このアプリにはリダイレクト先となるBladeのログインページが存在しないため。エラーレスポンスは常にJSONで返すべきなので`shouldRenderJsonWhen(fn () => true)`も設定）。

Sanctumのstateful判定は、セッションCookieの有無だけでなく`Origin`/`Referer`ヘッダーも見ています。axiosは`Origin`を自動付与するため実際のアプリには影響しませんが、`curl`で`/api/*`を手動検証する際は`-H "Origin: http://localhost:8080" -H "Referer: http://localhost:8080/"`を付けないと未認証扱いになります。

### 月の確定（ロック）

`month_closures`は`expenses`にステータス列を持たせるのではなく、独立したテーブル（確定済みの`year`/`month`ごとに1行）にしています。これにより、`expenses`と`card_bills`両方の書き込みチェックを`App\Services\MonthLockService::assertOpen()`という1つの存在チェックで共有できます。確定は`POST /api/months/{year}/{month}/close`、解除は同一URIへの`DELETE`（`MonthClosureController::reopen`）です。残高の計算式を計算しているのは`GET /api/months/{year}/{month}/summary`のみで、フロント側の`BalanceSummary`コンポーネントは、このsummaryエンドポイントが返した数値から表示用に再計算しているだけで、個別に値を取得し直すことはしていません。

### データモデルに関する注意点

- `Expense.date`はデフォルトの`date`キャストではなく、あえて`date:Y-m-d`でキャストしています。デフォルトキャストだとJSON上でCarbonのフルISO日時に変換されてしまい、`<input type="date">`をはじめ「日付だけ」を期待するUI側が壊れます。
- `Allowance`は単一行の設定レコードで、`Allowance::current()`（内部は`firstOrCreate`）で取得します。取得直後に`wasRecentlyCreated`フラグを強制的に`false`へ戻していますが、これはLaravelのルーターが「`wasRecentlyCreated === true`のModelを返したコントローラーアクション」を自動的にHTTP 201として扱ってしまうためです（そうしないと単なる`GET`/`PUT`が`201`になってしまう）。
- `vendors`は必ず1つの`category`に属し、バリデーション（`StoreExpenseRequest`/`UpdateExpenseRequest`）で経費の`vendor_id`が`category_id`に実際に属しているかをチェックしています。

## よく使うコマンド

バックエンド関連のコマンドはすべて`api`コンテナ内で実行します。ホスト側にPHPツールチェーンは前提としていません。

```bash
# 初回セットアップ
cp .env.example .env && cp api/.env.example api/.env && cp front/.env.example front/.env
docker compose build && docker compose up -d
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed

# バックエンドのテスト（Pest）。分離についての注意は下記参照
docker compose exec api ./vendor/bin/pest
docker compose exec api ./vendor/bin/pest --filter=<name>          # 単体テストのみ実行
docker compose exec api ./vendor/bin/pest tests/Feature/ExpenseTest.php

# バックエンドのLint
docker compose exec api ./vendor/bin/pint          # 自動修正
docker compose exec api ./vendor/bin/pint --test   # チェックのみ

# フロントエンドのテスト/Lint/ビルド（front/にnode_modulesがあればホスト側でも実行可）
docker compose exec front npm test
docker compose exec front npm test -- <name-or-file-pattern>
docker compose exec front npm run lint
docker compose exec front npm run build   # tsc -b && vite build。型チェック用途であり、実際に稼働しているスタックの一部ではない
```

**テスト用DBの分離について:** `api/phpunit.xml`が`api/.env`の設定（MySQL）を上書きし、Pest実行時は常に`DB_CONNECTION=sqlite`・`DB_DATABASE=:memory:`を強制します。そのため`api`のDockerイメージには`pdo_mysql`に加えて`pdo_sqlite`もインストールしています。Pestのテストスイートは開発用のMySQL DBには一切触れません。もし動いているアプリのデータが「テストで汚れている」ように見えることがあれば、それはテストスイートではなく、開発中に`curl`等で`:8080`へ直接投げた手動検証によるものです。

**フロントエンドのテスト構成:** VitestではなくJest（`babel-jest`使用）です。理由は`src/api/client.ts`がViteの`import.meta.env`を使っており、CommonJS向けにコンパイルする`ts-jest`ではこの構文をパースできないためです。`babel.config.cjs`にはBabelのCommonJS変換が走る前に`import.meta`を`({ env: process.env })`へ書き換える小さなカスタムプラグインを入れています。`jest.env.cjs`では`process.env.VITE_API_BASE_URL`の設定と、jsdomに存在しない（`react-router-dom`が必要とする）`TextEncoder`/`TextDecoder`のポリフィルを行っています。この構成を`ts-jest`に戻す場合は、この問題を別途解決する必要があります。

`eslint.config.js`では`react-hooks/set-state-in-effect`ルールを意図的に無効化しています。このコードベースのデータ取得の作法は「`async function reload() {...}`というヘルパーを、マウント時（`useEffect`内）とミューテーション後（イベントハンドラー内）の両方から呼び出す」というものですが、このルールは本来ターゲットとしている「同期的な派生stateのアンチパターン」ではないにも関わらずこのパターンを検知して警告してしまうためです。
