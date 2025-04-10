# Reactカウンターアプリケーション

シンプルなReactカウンターアプリケーションです。npxを使って実行できます。

## 必要条件

- Node.js (バージョン14以上)
- npm (バージョン6以上)

## インストール方法

```bash
# 依存関係をインストール
npm install
```

## 使用方法

### 開発モード

開発サーバーを起動するには：

```bash
npm run dev
```

これにより、http://localhost:3000 でアプリケーションが実行されます。

### ビルド

本番用にアプリケーションをビルドするには：

```bash
npm run build
```

これにより、`dist`ディレクトリに最適化されたファイルが生成されます。

### 本番モード

ビルドしたアプリケーションをローカルで実行するには：

```bash
npm start
```

## Cloudflare Workersへのデプロイ

Cloudflare Workersにデプロイするには：

```bash
npm run build
npx wrangler deploy
```

## 機能

- カウンターの増加
- カウンターの減少
- カウンターのリセット

## 技術スタック

- React
- Webpack
- Babel
- CSS
- Cloudflare Workers (デプロイ)
