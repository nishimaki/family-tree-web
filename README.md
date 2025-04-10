# React Counter App

シンプルなReactカウンターアプリケーション

## 機能

- カウンターの増減
- モダンなUI/UXデザイン
- レスポンシブ対応

## 技術スタック

- React 18
- Webpack 5
- Babel
- CSS Modules

## 必要条件

- Node.js >= 14.0.0
- pnpm >= 6.0.0

## インストール

```bash
# pnpmのインストール（初回のみ）
npm install -g pnpm

# 依存関係のインストール
pnpm install
```

## 開発

```bash
# 開発サーバーの起動
pnpm run dev
```

ブラウザで http://localhost:8080 を開いてアプリケーションにアクセスできます。

## ビルド

```bash
# プロダクションビルド
pnpm run build
```

ビルドされたファイルは`dist`ディレクトリに出力されます。

## テスト

```bash
# テストの実行
pnpm test
```

## クリーンアップ

```bash
# 一時ファイルの削除
pnpm run clean

# すべてのキャッシュと依存関係の削除
pnpm run clean:all
```

## ライセンス

MIT

## 作者

Your Name
