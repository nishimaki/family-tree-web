/**
 * ファイル操作のコントローラー
 * ファイルのインポート・エクスポートを管理
 */
class FileController {
    /**
     * コントローラーを初期化
     * @param {FamilyTreeController} familyTreeController - 家系図コントローラー
     */
    constructor(familyTreeController) {
        this.familyTreeController = familyTreeController;
        
        // ファイル選択用のinput要素
        this._createFileInput();
        
        // イベントハンドラを設定
        this._setupEventHandlers();
    }
    
    /**
     * ファイル選択用のinput要素を作成
     * @private
     */
    _createFileInput() {
        // 既存の要素があれば削除
        const existingInput = document.getElementById('file-input-hidden');
        if (existingInput) {
            document.body.removeChild(existingInput);
        }
        
        // 新しい要素を作成
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.id = 'file-input-hidden';
        this.fileInput.accept = '.json';
        this.fileInput.style.display = 'none';
        
        // DOMに追加
        document.body.appendChild(this.fileInput);
    }
    
    /**
     * イベントハンドラを設定
     * @private
     */
    _setupEventHandlers() {
        // サンプルデータ読み込みボタン
        const loadSampleButton = document.getElementById('load-sample');
        if (loadSampleButton) {
            loadSampleButton.addEventListener('click', () => this.loadSampleData());
        }
        
        // データ保存ボタン
        const saveDataButton = document.getElementById('save-data');
        if (saveDataButton) {
            saveDataButton.addEventListener('click', () => this.saveData());
        }
        
        // ファイル選択イベント
        this.fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.loadFile(file);
            }
        });
    }
    
    /**
     * サンプルデータを読み込む
     */
    async loadSampleData() {
        console.log('サンプルデータを読み込みます...');
        try {
            await this.familyTreeController.loadSampleData();
            console.log('サンプルデータを読み込みました。');
        } catch (error) {
            console.error('サンプルデータの読み込み中にエラーが発生しました。', error);
            alert('サンプルデータの読み込みに失敗しました。');
        }
    }
    
    /**
     * ファイル選択ダイアログを表示
     */
    showFileOpenDialog() {
        this.fileInput.value = ''; // リセット（同じファイルを再選択できるように）
        this.fileInput.click();
    }
    
    /**
     * ファイルを読み込む
     * @param {File} file - 読み込むファイル
     */
    async loadFile(file) {
        console.log(`ファイル "${file.name}" を読み込みます...`);
        try {
            const success = await this.familyTreeController.loadFamilyTreeFromFile(file);
            if (success) {
                console.log(`ファイル "${file.name}" を読み込みました。`);
            } else {
                console.error(`ファイル "${file.name}" の読み込みに失敗しました。`);
                alert('ファイルの読み込みに失敗しました。');
            }
        } catch (error) {
            console.error('ファイルの読み込み中にエラーが発生しました。', error);
            alert('ファイルの読み込みに失敗しました。');
        }
    }
    
    /**
     * 家系図データを保存
     */
    saveData() {
        console.log('家系図データを保存します...');
        try {
            const filename = 'family_tree.json';
            const success = this.familyTreeController.saveFamilyTreeToFile(filename);
            if (success) {
                console.log(`家系図データを "${filename}" に保存しました。`);
            } else {
                console.error('家系図データの保存に失敗しました。');
                alert('家系図データの保存に失敗しました。');
            }
        } catch (error) {
            console.error('家系図データの保存中にエラーが発生しました。', error);
            alert('家系図データの保存に失敗しました。');
        }
    }
}
