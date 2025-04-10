# 家系図アプリケーション仕様書

## 1. 概要

本仕様書は、React を用いた家系図作成・管理アプリケーションの設計と実装について記述します。このアプリケーションは、旧システム（Python版）のコア機能をWebアプリケーションとして移植したものです。

### 1.1 主要機能

- JSONファイルからの家系図データの読み込み
- JSONファイルへの家系図データの保存
- 家系図データの表示（人物一覧）
- 家系図のグラフィカル表示
- 人物情報の編集（基本情報、家族関係）
- データモデルの管理（Person, FamilyTree）

### 1.2 開発環境

- React 18
- JavaScript (ES6+)
- HTML5/CSS3
- Webpack

## 2. システム構成

### 2.1 アプリケーション構造

アプリケーションはMVCパターンに基づく構造を持ちます：

- **Models**: データモデルを定義
  - Person（人物）
  - FamilyTree（家系図）
- **Services**: ユーティリティおよび外部システムとの連携
  - FileManager（ファイル操作）
- **Components**: ユーザーインターフェース
  - App（メインコンポーネント）
  - PersonList（人物一覧）
  - PersonEditor（人物編集）
  - FamilyTreeGraph（家系図グラフィカル表示）
- **Constants**: 定数定義
  - Gender（性別）

### 2.2 ディレクトリ構造

```
/src
  /models
    Person.js       # 人物データモデル
    FamilyTree.js   # 家系図データモデル
  /services
    FileManager.js  # ファイル操作サービス
  /components
    PersonList.js   # 人物一覧コンポーネント
    PersonEditor.js # 人物編集コンポーネント
    FamilyTreeGraph.js # 家系図グラフィカル表示コンポーネント
  /constants
    Gender.js       # 性別定数
  App.js            # メインアプリケーションコンポーネント
  App.css           # スタイル定義
  index.js          # エントリーポイント
```

## 3. データモデル

### 3.1 Person

人物を表すデータモデルで、以下の属性を持ちます：

- id: 一意の識別子
- name: 名前
- gender: 性別（M=男性, F=女性, U=不明）
- birth_date: 生年月日（YYYY-MM-DD形式）
- death_date: 死亡日（YYYY-MM-DD形式、なければnull）
- birth_order: 兄弟姉妹の中での出生順（不明な場合はnull）
- father_id: 父親のID（いなければnull）
- mother_id: 母親のID（いなければnull）
- spouse_ids: 配偶者のIDリスト
- children_ids: 子のIDリスト
- note: 備考

### 3.2 FamilyTree

家系図全体を表すデータモデルで、以下の属性を持ちます：

- title: 家系図のタイトル
- description: 家系図の説明
- _persons: 人物IDをキー、Personオブジェクトを値とするオブジェクト

## 4. ファイル形式

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

## 5. 機能詳細

### 5.1 ファイル読み込み

1. ユーザーがJSONファイルを選択
2. FileManagerがファイルを読み込み、JSONデータをパース
3. パースしたデータからFamilyTreeオブジェクトを生成
4. Personオブジェクトを生成し、FamilyTreeに追加
5. 家族関係（親子、配偶者）を構築
6. 読み込んだデータをUI（PersonList）に表示

### 5.2 人物一覧表示

1. FamilyTree内の全Personを取得
2. PersonListコンポーネントで表形式で表示
   - ID
   - 名前
   - 性別
   - 生年月日
   - 死亡日

### 5.3 家系図グラフィカル表示

1. ユーザーが人物を選択すると、その人物を起点とした家系図を表示
2. FamilyTreeモデルから階層構造データを生成
3. 各人物ノードは基本情報（名前、性別、生年月日）を表示
4. 親子関係と配偶者関係を視覚的に表現
5. ノードをクリックすると、その人物を中心とした家系図を再表示

### 5.4 人物情報の編集

1. ユーザーが人物一覧から「編集」ボタンをクリック
2. PersonEditorコンポーネントで編集フォームを表示
3. 以下の情報を編集可能：
   - 基本情報：名前、性別、生年月日、死亡日、出生順
   - 家族関係：父親、母親、配偶者（複数選択可）、子供（複数選択可）
   - メモ：自由テキスト入力
4. 編集内容をFamilyTreeオブジェクトに反映
5. 関係性の整合性を維持するために家族関係を再構築

### 5.5 ファイル保存

1. ユーザーがファイル操作画面で「変更を保存」ボタンをクリック
2. FileManagerがFamilyTreeオブジェクトをJSON形式に変換
3. BlobオブジェクトとしてJSONデータを生成
4. ダウンロードリンクを作成し、自動的にクリックを実行
5. ユーザーのローカル環境にJSONファイルをダウンロード

## 6. 将来の拡張計画

このアプリケーションは今後以下の機能を追加予定です：

### 6.1 表示機能の拡張

- 人物詳細表示
- 関係性のより詳細な可視化

### 6.2 編集機能の追加

- 新規人物の追加
- 人物の削除機能

### 6.3 UI/UX改善

- レスポンシブデザインの強化
- ダークモード対応
- 多言語対応
- ユーザー設定の保存

## 7. 実装上の注意点

- ブラウザのローカルストレージを活用したデータの一時保存
- ファイルAPIを使用したJSONの読み込み・保存
- コンポーネントの再利用性を考慮した設計
- パフォーマンスを考慮したレンダリング（大規模な家系図の場合）