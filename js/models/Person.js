/**
 * 人物を表すデータモデル
 * 家系図の基本単位となる人物情報を管理するクラス
 */
class Person {
    /**
     * Personクラスのコンストラクタ
     * @param {Object} data - 人物データオブジェクト
     * @param {string} data.id - 人物のID（指定されない場合は自動生成）
     * @param {string} data.name - 人物の名前
     * @param {string} [data.gender] - 性別（'M', 'F', 'U'）
     * @param {string} [data.birth_date] - 生年月日（YYYY-MM-DD形式）
     * @param {string} [data.death_date] - 死亡日（YYYY-MM-DD形式）
     * @param {string} [data.father_id] - 父親のID
     * @param {string} [data.mother_id] - 母親のID
     * @param {Array<string>} [data.spouse_ids] - 配偶者IDの配列
     * @param {Array<string>} [data.children_ids] - 子IDの配列
     * @param {number} [data.birth_order] - 兄弟の中での出生順（0から始まる）
     * @param {string} [data.note] - メモ
     */
    constructor(data) {
        // 必須項目の検証
        if (!data.name) {
            throw new Error('名前は必須です');
        }
        
        // 一意のIDを設定（指定されていない場合は生成）
        this.id = data.id || this._generateUUID();
        this.name = data.name;
        
        // 性別を正規化（Gender.MALE, Gender.FEMALE, Gender.UNKNOWN のいずれか）
        this.gender = data.gender ? Gender.fromString(data.gender) : Gender.UNKNOWN;
        
        // 日付関連
        this.birth_date = this._formatDate(data.birth_date);
        this.death_date = this._formatDate(data.death_date);
        
        // 家族関係のID参照
        this.father_id = data.father_id || null;
        this.mother_id = data.mother_id || null;
        this.spouse_ids = Array.isArray(data.spouse_ids) ? [...data.spouse_ids] : [];
        this.children_ids = Array.isArray(data.children_ids) ? [...data.children_ids] : [];
        
        // その他の属性
        this.birth_order = typeof data.birth_order === 'number' ? data.birth_order : null;
        this.note = data.note || null;
        
        // タイムスタンプ
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }
    
    /**
     * 日付文字列をYYYY-MM-DD形式に整形する
     * @param {string} dateStr - 日付文字列
     * @returns {string|null} - 整形された日付文字列またはnull
     * @private
     */
    _formatDate(dateStr) {
        if (!dateStr) return null;
        
        try {
            // 年のみの形式（YYYY）をYYYY-01-01に変換
            if (dateStr.length === 4 && /^\d{4}$/.test(dateStr)) {
                return `${dateStr}-01-01`;
            }
            
            // YYYY-MM-DD形式をパース
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                
                // 簡易バリデーション
                if (year >= 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    // ゼロパディング
                    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                }
            }
            
            console.warn(`無効な日付形式: "${dateStr}". YYYY または YYYY-MM-DD 形式が必要です。`);
            return null;
        } catch (error) {
            console.error(`日付のフォーマットエラー: "${dateStr}"`, error);
            return null;
        }
    }
    
    /**
     * UUID v4を生成する
     * @returns {string} - 生成されたUUID
     * @private
     */
    _generateUUID() {
        // UUID v4の単純な実装
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * 兄弟姉妹の中での出生順を設定
     * @param {number|null} order - 出生順（0から始まる）、nullは順序不明
     * @returns {boolean} - 設定に成功した場合はtrue
     */
    setBirthOrder(order) {
        if (order !== null && order < 0) {
            return false;
        }
        this.birth_order = order;
        this.updated_at = new Date().toISOString();
        return true;
    }
    
    /**
     * 兄弟姉妹の中での出生順を取得
     * @returns {number|null} - 出生順（0から始まる）、nullは順序不明
     */
    getBirthOrder() {
        return this.birth_order;
    }
    
    /**
     * 配偶者を追加
     * @param {string} spouseId - 配偶者のID
     * @returns {boolean} - 追加に成功した場合はtrue
     */
    addSpouse(spouseId) {
        if (spouseId && !this.spouse_ids.includes(spouseId)) {
            this.spouse_ids.push(spouseId);
            this.updated_at = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    /**
     * 配偶者を削除
     * @param {string} spouseId - 削除する配偶者のID
     * @returns {boolean} - 削除に成功した場合はtrue
     */
    removeSpouse(spouseId) {
        const index = this.spouse_ids.indexOf(spouseId);
        if (index !== -1) {
            this.spouse_ids.splice(index, 1);
            this.updated_at = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    /**
     * 子を追加
     * @param {string} childId - 子のID
     * @returns {boolean} - 追加に成功した場合はtrue
     */
    addChild(childId) {
        if (childId && !this.children_ids.includes(childId)) {
            this.children_ids.push(childId);
            this.updated_at = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    /**
     * 子を削除
     * @param {string} childId - 削除する子のID
     * @returns {boolean} - 削除に成功した場合はtrue
     */
    removeChild(childId) {
        const index = this.children_ids.indexOf(childId);
        if (index !== -1) {
            this.children_ids.splice(index, 1);
            this.updated_at = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    /**
     * 父親を設定
     * @param {string|null} fatherId - 父親のID
     * @returns {boolean} - 常にtrue
     */
    setFather(fatherId) {
        this.father_id = fatherId;
        this.updated_at = new Date().toISOString();
        return true;
    }
    
    /**
     * 母親を設定
     * @param {string|null} motherId - 母親のID
     * @returns {boolean} - 常にtrue
     */
    setMother(motherId) {
        this.mother_id = motherId;
        this.updated_at = new Date().toISOString();
        return true;
    }
    
    /**
     * 父親の設定をクリア
     * @returns {boolean} - 常にtrue
     */
    clearFather() {
        this.father_id = null;
        this.updated_at = new Date().toISOString();
        return true;
    }
    
    /**
     * 母親の設定をクリア
     * @returns {boolean} - 常にtrue
     */
    clearMother() {
        this.mother_id = null;
        this.updated_at = new Date().toISOString();
        return true;
    }
    
    /**
     * 人物データを検証し、エラーメッセージを返す
     * @returns {Object} - フィールド名をキーとするエラーメッセージのオブジェクト
     */
    validate() {
        const errors = {};
        
        // 名前の検証
        if (!this.name) {
            errors.name = ['名前は必須です'];
        }
        
        // 性別の検証
        if (this.gender && ![Gender.MALE, Gender.FEMALE, Gender.UNKNOWN].includes(this.gender)) {
            errors.gender = [`性別は ${Gender.MALE}, ${Gender.FEMALE}, ${Gender.UNKNOWN} のいずれかである必要があります`];
        }
        
        // birth_orderの検証
        if (this.birth_order !== null && this.birth_order < 0) {
            errors.birth_order = ['出生順は 0 以上の整数である必要があります'];
        }
        
        // 日付形式の検証 (YYYY-MM-DD or null)
        const dateFields = [
            { name: 'birth_date', value: this.birth_date },
            { name: 'death_date', value: this.death_date }
        ];
        
        for (const field of dateFields) {
            if (field.value !== null) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(field.value)) {
                    if (!errors[field.name]) errors[field.name] = [];
                    errors[field.name].push(`${field.name} は YYYY-MM-DD 形式である必要があります`);
                }
            }
        }
        
        // 生年月日と死亡日の矛盾チェック
        if (this.birth_date && this.death_date && 
            !errors.birth_date && !errors.death_date) {
            if (this.birth_date > this.death_date) {
                if (!errors.death_date) errors.death_date = [];
                errors.death_date.push('死亡日は生年月日より後である必要があります');
            }
        }
        
        return errors;
    }
    
    /**
     * 人物オブジェクトを複製する
     * @returns {Person} - 複製された人物オブジェクト
     */
    clone() {
        return new Person(this.toJSON());
    }
    
    /**
     * 人物データをJSON形式に変換する
     * @returns {Object} - JSON形式の人物データ
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            gender: this.gender,
            birth_date: this.birth_date,
            death_date: this.death_date,
            birth_order: this.birth_order,
            father_id: this.father_id,
            mother_id: this.mother_id,
            spouse_ids: [...this.spouse_ids],
            children_ids: [...this.children_ids],
            note: this.note,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
    
    /**
     * JSON形式の人物データからPersonオブジェクトを生成する
     * @param {Object} data - JSON形式の人物データ
     * @returns {Person} - 生成されたPersonオブジェクト
     * @static
     */
    static fromJSON(data) {
        // IDと名前は必須
        if (!data.id || !data.name) {
            throw new Error(`必須フィールドがありません: ${!data.id ? 'id ' : ''}${!data.name ? 'name' : ''}`);
        }
        
        return new Person(data);
    }
}
