# QA - 質問リスト

## 1. ✅ microCMS アイコン (SVG)
**対応済み**: 簡易的なアイコンを `nodes/MicroCms/microCms.svg` に作成しました。
- 必要に応じて公式ロゴに差し替え可能です

## 2. ⚠️ package.json の設定
**一部対応済み**: 以下を設定しました
- パッケージ名: `n8n-nodes-microcms`
- Author name: `Yoshihisa Kaino`
- Repository URL: `https://github.com/yoshihisakaino/n8n-nodes-microcms.git`

**要確認**:
- Author email: 現在 `your-email@example.com` となっています。正しいメールアドレスを教えてください

## 3. ✅ microCMS API の仕様確認
**実装完了**: DOCS.md の仕様に基づき実装しました
- PATCH メソッドで部分更新を実装
- PUT メソッドは未実装（DOCS.md にも記載がなかったため）
- draft key は GET 操作でのみ使用可能としています

## 4. ✅ テスト環境
**情報提供済み**:
- サービスドメイン: `partner-pref`
- APIキー: `vNpwTFeKNmTwPMfhdoE3PEF2mujMtJAu0pwO`
- テスト用エンドポイント: `test`

これらの情報でローカルテストが可能です。

## 5. ✅ ビルド状況
**完了**: ビルドが正常に完了しました
- TypeScript コンパイル: 成功
- ESLint 検証: 合格
- dist/ ディレクトリに以下のファイルが生成されています:
  - `dist/credentials/MicroCmsApi.credentials.js`
  - `dist/nodes/MicroCms/MicroCms.node.js`
  - `dist/nodes/MicroCms/actions/Content.resource.js`
  - `dist/nodes/MicroCms/transport/index.js`