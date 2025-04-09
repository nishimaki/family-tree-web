/**
 * ファイル操作を担当するユーティリティクラス
 * 家系図データの読み込みと保存を行う
 */
class FileManager {
    /**
     * サンプルデータを読み込む
     * @returns {Promise<Object>} 読み込まれた家系図データのPromise
     */
    static async loadSampleData() {
        try {
            const response = await fetch('data/sample.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('サンプルデータを読み込みました。', data);
            return data;
        } catch (error) {
            console.error('サンプルデータの読み込みに失敗しました。', error);
            throw error;
        }
    }
    
    /**
     * ファイルから家系図データを読み込む
     * @param {File} file 読み込むJSONファイル
     * @returns {Promise<Object>} 読み込まれた家系図データのPromise
     */
    static readFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('ファイルが指定されていません。'));
                return;
            }
            
            if (!file.name.endsWith('.json')) {
                reject(new Error('JSONファイルを選択してください。'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    console.log(`ファイル "${file.name}" からデータを読み込みました。`, data);
                    resolve(data);
                } catch (error) {
                    console.error('JSONデータのパースに失敗しました。', error);
                    reject(new Error('ファイルの形式が無効です。有効なJSONファイルを選択してください。'));
                }
            };
            
            reader.onerror = () => {
                console.error('ファイルの読み込みに失敗しました。');
                reject(new Error('ファイルの読み込み中にエラーが発生しました。'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * 家系図データをJSONファイルとして保存する
     * @param {Object} data 保存する家系図データ
     * @param {string} [filename='family_tree.json'] 保存するファイル名
     */
    static saveToFile(data, filename = 'family_tree.json') {
        try {
            // データをJSON文字列に変換
            const jsonString = JSON.stringify(data, null, 2);
            
            // Blobを作成
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // ダウンロードリンクを作成
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // リンクをクリックしてダウンロードを開始
            document.body.appendChild(link);
            link.click();
            
            // クリーンアップ
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`データをファイル "${filename}" に保存しました。`);
        } catch (error) {
            console.error('データの保存に失敗しました。', error);
            throw error;
        }
    }
    
    /**
     * 文字列をクリップボードにコピーする
     * @param {string} text コピーするテキスト
     * @returns {Promise<void>} コピー操作の結果Promise
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('テキストをクリップボードにコピーしました。');
            return true;
        } catch (error) {
            console.error('クリップボードへのコピーに失敗しました。', error);
            throw error;
        }
    }
}
