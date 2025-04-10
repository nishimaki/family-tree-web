# 家系図アプリケーション（React版）

家系図を作成・管理するためのWebアプリケーションです。JSONファイルから家系図データを読み込み、人物一覧を表示します。

## 概要

このアプリケーションは、家系図データを管理するためのシンプルなReactアプリケーションです。旧システム（Python版）から移植されたコア機能を持ち、ブラウザ上で動作します。

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

## 主な機能

- JSONファイルからの家系図データの読み込み
- 人物一覧の表示
- 家系図の基本情報表示

## データ形式

家系図データは次のようなJSON形式で保存されます：

```json
{
  "title": "家系図のタイトル",
  "description": "家系図の説明",
  "persons": {
    "person-id-1": {
      "id": "person-id-1",
      "name": "山田 太郎",
      "gender": "M",
      "birth_date": "1940-05-15",
      "death_date": null,
      "father_id": null,
      "mother_id": null,
      "spouse_ids": ["person-id-2"],
      "children_ids": ["person-id-3", "person-id-4"],
      "birth_order": null
    },
    // 他の人物データ...
  }
}
```

## 技術スタック

- React
- JavaScript (ES6+)
- CSS
- HTML5
- Webpack (開発環境)

## 今後の予定

- 人物詳細表示機能
- 家系図のグラフィカル表示
- 人物情報の編集機能
- 新規人物の追加機能
- 関係性の編集機能
