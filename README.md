# 家系図アプリケーション

ReactとJavaScriptを使った家系図作成・管理のためのWebアプリケーションです。

## 機能概要

- JSONファイルからの家系図データの読み込み
- 人物一覧表示
- 家系図のグラフィカル表示（シンプル表示とSVG表示）
- 人物情報の編集
- 家系図データのJSONファイルへの保存

## ディレクトリ構造

```
/src
  /models             # データモデル
    Person.js         # 人物データモデル
    FamilyTree.js     # 家系図データモデル
  /components         # UIコンポーネント
    PersonList.js     # 人物一覧コンポーネント
    PersonEditor.js   # 人物編集コンポーネント
    FamilyTreeGraph.js # シンプルな家系図表示コンポーネント
    FamilyTreeSVG.js  # SVGベースの家系図表示コンポーネント
  /services           # サービス
    FileManager.js    # ファイル操作サービス
  /constants          # 定数
    Gender.js         # 性別定数
  App.js              # メインアプリケーションコンポーネント
  index.js            # エントリーポイント
```

## データモデル

### Person

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

### FamilyTree

家系図全体を表すデータモデルで、以下の属性を持ちます：

- title: 家系図のタイトル
- description: 家系図の説明
- _persons: 人物IDをキー、Personオブジェクトを値とするオブジェクト

## テスト

アプリケーションのテストは Jest と React Testing Library を使用しています。
以下のテストファイルが実装されています：

```
/src/__tests__
  /Person.test.js          # Personモデルのテスト
  /FamilyTree.test.js      # FamilyTreeモデルのテスト
  /FileManager.test.js     # FileManagerサービスのテスト
  /PersonEditor.test.js    # PersonEditorコンポーネントのテスト
  /FamilyTreeGraph.test.js # FamilyTreeGraphコンポーネントのテスト
  /FamilyTreeSVG.test.js   # FamilyTreeSVGコンポーネントのテスト
  /App.test.js             # Appコンポーネント統合テスト
```

テストを実行するには以下のコマンドを使用します：

```bash
npm test
```

カバレッジレポートを生成するには：

```bash
npm test -- --coverage
```

## 使い方

1. アプリケーションを起動します
2. 「ファイル操作」ボタンをクリックします
3. 家系図データのJSONファイルを選択して読み込みます
4. 「人物一覧」タブで人物の一覧を確認できます
5. 「表示」ボタンをクリックして家系図を表示します
6. 「編集」ボタンをクリックして人物情報を編集できます
7. 編集後は「ファイル操作」→「変更を保存」でデータを保存できます

## JSONファイル形式

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