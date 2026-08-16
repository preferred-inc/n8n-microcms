# QA - 質問リスト

## 1. ✅ microCMS アイコン (SVG)
**対応済み**: 簡易的なアイコンを `nodes/MicroCms/microCms.svg` に作成しました。
- 必要に応じて公式ロゴに差し替え可能です

## 2. ✅ package.json の設定
**対応済み**:
- パッケージ名: `n8n-nodes-microcms`
- Author name: `Yoshihisa Kaino` / email 設定済み
- Repository URL: `https://github.com/preferred-inc/n8n-microcms.git`（実在するリモートに修正済み）

## 3. ✅ microCMS API の仕様確認
**実装完了**: DOCS.md の仕様に基づき実装しました
- PATCH メソッドで部分更新を実装
- PUT メソッドは未実装（DOCS.md にも記載がなかったため）
- draft key は GET 操作でのみ使用可能としています

## 4. ✅ テスト環境
検証用の microCMS サービスドメイン・API キー・エンドポイント名は
Git 管理外の `.env` で受け渡す（`.env.example` 参照）。

> ⚠️ 2026-08-05 のコミットで検証用の API キーを本ファイルに直書きしてしまい、
> public リポジトリに公開された。該当キーは失効・再発行のうえ、
> 以後は資格情報をリポジトリに含めないこと。

## 5. ✅ ビルド状況
**完了**: ビルドが正常に完了しました
- TypeScript コンパイル: 成功
- ESLint 検証: 合格
- dist/ ディレクトリに以下のファイルが生成されています:
  - `dist/credentials/MicroCmsApi.credentials.js`
  - `dist/nodes/MicroCms/MicroCms.node.js`
  - `dist/nodes/MicroCms/actions/Content.resource.js`
  - `dist/nodes/MicroCms/transport/index.js`