import Person from '../models/Person';
import FamilyTree from '../models/FamilyTree';

/**
 * ファイル操作クラス
 * 家系図データのファイル操作（読み込み・保存）を管理
 */
class FileManager {
  /**
   * JSONファイルから家系図データを読み込む
   * @param {File} file - 読み込むJSONファイル
   * @returns {Promise<{familyTree: FamilyTree|null, warnings: Array<string>}>} - 
   *   読み込んだ家系図オブジェクトと警告メッセージのリスト
   */
  static loadFamilyTree(file) {
    return new Promise((resolve, reject) => {
      const warnings = [];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          const familyTree = new FamilyTree();
          
          // 基本情報を設定
          familyTree.title = data.title || "";
          familyTree.description = data.description || "";
          
          // 人物データを追加
          const personsData = data.persons || {};
          
          // forEachからfor...ofループに変更し、continueを使用して適切にスキップする
          for (const [personId, personData] of Object.entries(personsData)) {
            try {
              // 必須フィールドの検証
              if (!personData.id || !personData.name) {
                warnings.push(`人物ID '${personId}' には必須フィールドがありません。スキップします。`);
                console.warn(`人物データに必須フィールドがありません: ${personId}`);
                continue; // 次のループへスキップ
              }
              
              // IDを確実に設定
              personData.id = personId;
              
              // Personオブジェクトを作成
              const person = new Person(personData);
              
              // バリデーションエラーをチェック
              const validationErrors = person.validate();
              if (Object.keys(validationErrors).length > 0) {
                warnings.push(`人物ID '${personId}' のデータにエラーがあります: ${JSON.stringify(validationErrors)}`);
                continue; // バリデーションエラーがある場合はスキップ
              }
              
              // 人物をFamilyTreeに追加 (関係性更新はまだ行わない)
              if (!familyTree.addPerson(person)) {
                warnings.push(`人物ID '${personId}' は既に存在するため、追加できませんでした。データを確認してください。`);
                console.warn(`Skipped adding duplicate person ID: ${personId}`);
              }
            } catch (e) {
              warnings.push(`人物ID '${personId}' の読み込み中にエラーが発生しました: ${e.message}`);
              console.warn(`人物データの読み込み中にエラーが発生しました: ${e.message}`);
            }
          }
          
          // 全Personを追加後、FamilyTreeに関係性を構築させる
          console.log(`Triggering relationship building for ${Object.keys(familyTree.getAllPersons()).length} persons...`);
          familyTree.buildRelationships();
          console.log("Relationship building complete.");
          
          console.log(`家系図データを読み込みました: ${file.name}`);
          
          if (warnings.length > 0) {
            console.warn(`読み込み中に ${warnings.length} 件の警告が発生しました`);
          }
          
          resolve({ familyTree, warnings });
        } catch (e) {
          const errorMsg = `JSONデータの解析に失敗しました: ${e.message}`;
          console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      };
      
      reader.onerror = (error) => {
        const errorMsg = `ファイルの読み込み中にエラーが発生しました: ${error}`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };
      
      // ファイルをテキストとして読み込む
      reader.readAsText(file);
    });
  }

  /**
   * 家系図データをJSONファイルとして保存する
   * @param {FamilyTree} familyTree - 保存する家系図オブジェクト
   * @param {string} fileName - 保存するファイル名（拡張子なし）
   * @returns {Promise<boolean>} - 保存に成功した場合はtrueを解決するPromise
   */
  static saveFamilyTree(familyTree, fileName) {
    return new Promise((resolve, reject) => {
      try {
        // 保存用データを作成
        const data = {
          title: familyTree.title,
          description: familyTree.description,
          persons: {}
        };
        
        // 人物データを追加
        Object.entries(familyTree.getAllPersons()).forEach(([personId, person]) => {
          data.persons[personId] = {
            id: person.id,
            name: person.name,
            gender: person.gender,
            birth_date: person.birth_date,
            death_date: person.death_date,
            birth_order: person.birth_order,
            father_id: person.father_id,
            mother_id: person.mother_id,
            spouse_ids: [...person.spouse_ids],
            children_ids: [...person.children_ids],
            note: person.note
          };
        });
        
        // JSON形式に変換
        const jsonData = JSON.stringify(data, null, 2);
        
        // Blobを作成
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // ダウンロードリンクを作成
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName || 'family_tree'}.json`;
        
        // リンクをクリックしてダウンロードを開始
        link.click();
        
        // 少し遅延してからURLをクリーンアップし、Promiseを解決
        setTimeout(() => {
          URL.revokeObjectURL(url);
          console.log(`家系図データを保存しました: ${link.download}`);
          resolve(true);
        }, 100);
      } catch (e) {
        console.error(`家系図データの保存中にエラーが発生しました: ${e.message}`);
        reject(e);
      }
    });
  }
}

export default FileManager;
