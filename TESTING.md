# ローカルテスト手順

## 1. 前提条件
- Node.js v20.15以上がインストールされていること
- このプロジェクトのビルドが完了していること (`npm run build`)

## 2. パッケージのリンク

現在のディレクトリ（n8n-nodes-microcms）で以下を実行：

```bash
npm link
```

✅ 完了済み

## 3. n8nのインストールとリンク

### オプションA: グローバルインストール（推奨）

```bash
# n8nをグローバルにインストール
npm install -g n8n

# n8nのカスタムノードディレクトリでリンク
cd ~/.n8n
npm link n8n-nodes-microcms
```

### オプションB: ローカルインストール

```bash
# 任意のディレクトリにn8nをインストール
mkdir ~/n8n-test
cd ~/n8n-test
npm install n8n
npm link n8n-nodes-microcms
```

## 4. n8nの起動

```bash
# グローバルインストールの場合
n8n

# ローカルインストールの場合
cd ~/n8n-test
npx n8n
```

ブラウザで http://localhost:5678 が開きます。

## 5. 認証情報の設定

1. n8nの画面で「Credentials」→「New」をクリック
2. 「microCMS API」を検索して選択
3. 以下の情報を入力：
   - **Service Domain**: microCMS のサービスドメイン（`https://xxxx.microcms.io` の `xxxx` 部分）
   - **API Key**: microCMS 管理画面 → サービス設定 → API キー で発行した値
4. 「Save」をクリック

> ⚠️ API キーやサービスドメインをこのリポジトリにコミットしないこと。
> ローカルでの検証用に控える場合は、Git 管理外の `.env`（`.gitignore` 済み）を使う。
> `.env.example` を参照。

## 6. テストワークフローの作成

### テスト1: Get Many（コンテンツ一覧取得）

1. 新しいワークフローを作成
2. 「microCMS」ノードを追加
3. 設定：
   - **Credential**: 作成した認証情報を選択
   - **Resource**: Content
   - **Operation**: Get Many
   - **Endpoint**: `test`
   - **Options** → **Limit**: 10
4. 「Execute Node」をクリックして実行

期待される結果: `test` エンドポイントのコンテンツ一覧が返される

### テスト2: Get（単一コンテンツ取得）

1. 設定：
   - **Resource**: Content
   - **Operation**: Get
   - **Endpoint**: `test`
   - **Content ID**: （実際のコンテンツIDを入力）
2. 「Execute Node」をクリック

期待される結果: 指定したIDのコンテンツが返される

### テスト3: Create（コンテンツ作成）

1. 設定：
   - **Resource**: Content
   - **Operation**: Create
   - **Endpoint**: `test`
   - **Body**:
     ```json
     {
       "title": "Test Content",
       "content": "This is a test"
     }
     ```
2. 「Execute Node」をクリック

期待される結果: 新しいコンテンツが作成され、IDが返される

### テスト4: Update（コンテンツ更新）

1. 設定：
   - **Resource**: Content
   - **Operation**: Update
   - **Endpoint**: `test`
   - **Content ID**: （作成したコンテンツのID）
   - **Body**:
     ```json
     {
       "title": "Updated Test Content"
     }
     ```
2. 「Execute Node」をクリック

期待される結果: コンテンツが更新される

### テスト5: Delete（コンテンツ削除）

1. 設定：
   - **Resource**: Content
   - **Operation**: Delete
   - **Endpoint**: `test`
   - **Content ID**: （削除するコンテンツのID）
2. 「Execute Node」をクリック

期待される結果: コンテンツが削除される

## 7. エラーテスト

### 認証エラーのテスト
- 誤ったAPIキーで実行 → 401 Unauthorized エラーが表示されるはず

### 存在しないコンテンツのテスト
- 存在しないContent IDで Get を実行 → 404 Not Found エラーが表示されるはず

### 不正なJSONのテスト
- Bodyに不正なJSONを入力して Create を実行 → エラーメッセージが表示されるはず

## トラブルシューティング

### ノードが表示されない場合
1. `npm link` が正しく実行されたか確認
2. n8nを再起動
3. ブラウザのキャッシュをクリア

### ビルドエラーが出る場合
```bash
# リポジトリのルートで
npm run build
```

### 認証エラーが出る場合
- Service Domainに `https://` や `/api/v1/` を含めないこと
- `https://xxxx.microcms.io` の `xxxx` の部分のみを入力する