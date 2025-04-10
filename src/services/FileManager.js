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
          Object.entries(personsData).forEach(([personId, personData]) => {
            try {
              // Personオブジェクトを作成
              const person = Person.fromDict(personData);
              
              // 人物をFamilyTreeに追加 (関係性更新はまだ行わない)
              if (!familyTree.addPerson(person)) {
                warnings.push(`人物ID '${personId}' は既に存在するため、追加できませんでした。データを確認してください。`);
                console.warn(`Skipped adding duplicate person ID: ${personId}`);
              }
            } catch (e) {
              warnings.push(`人物ID '${personId}' の読み込み中にエラーが発生しました: ${e.message}`);
              console.warn(`人物データの読み込み中にエラーが発生しました: ${e.message}`);
            }
          });
          
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
   * @returns {boolean} - 保存に成功した場合はtrue
   */
  static saveFamilyTree(familyTree, fileName) {
    try {
      // 保存用データを作成
      const data = {
        title: familyTree.title,
        description: familyTree.description,
        persons: {}
      };
      
      // 人物データを追加
      Object.entries(familyTree.getAllPersons()).forEach(([personId, person]) => {
        data.persons[personId] = person.toDict();
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
      
      // URLをクリーンアップ
      URL.revokeObjectURL(url);
      
      console.log(`家系図データを保存しました: ${link.download}`);
      return true;
    } catch (e) {
      console.error(`家系図データの保存中にエラーが発生しました: ${e.message}`);
      return false;
    }
  }
}

export default FileManager;
