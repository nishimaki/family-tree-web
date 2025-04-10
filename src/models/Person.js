import Gender from '../constants/Gender';

/**
 * 人物を表すデータモデルクラス
 * 家系図の基本単位となる人物を表すクラス
 */
class Person {
  /**
   * コンストラクタ
   * @param {Object} data - 人物情報
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.gender = data.gender ? Gender.fromString(data.gender) : null;
    this.birth_date = this._formatDate(data.birth_date);
    this.death_date = this._formatDate(data.death_date);
    this.birth_order = data.birth_order !== undefined ? data.birth_order : null;
    this.father_id = data.father_id || null;
    this.mother_id = data.mother_id || null;
    this.spouse_ids = data.spouse_ids || [];
    this.children_ids = data.children_ids || [];
    this.note = data.note || null;
  }

  /**
   * 日付文字列をフォーマットする
   * @param {string} dateStr - 日付文字列
   * @returns {string|null} - フォーマットされた日付文字列、または null
   * @private
   */
  _formatDate(dateStr) {
    if (!dateStr) {
      return null;
    }

    try {
      // 年のみ (YYYY) の場合 -> YYYY-01-01 として扱う
      if (dateStr.length === 4 && !isNaN(dateStr)) {
        const dt = new Date(parseInt(dateStr, 10), 0, 1);
        return dt.toISOString().split('T')[0];
      }
      
      // YYYY-MM-DD 形式を検証
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) {
        throw new Error(`Invalid date format: '${dateStr}'. Expected YYYY or YYYY-MM-DD.`);
      }
      return dt.toISOString().split('T')[0];
    } catch (e) {
      console.warn(`Invalid date format: '${dateStr}'. Expected YYYY or YYYY-MM-DD.`);
      return null;
    }
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
   * @param {string} spouseId - 配偶者ID
   * @returns {boolean} - 追加に成功した場合はtrue
   */
  addSpouse(spouseId) {
    if (spouseId && !this.spouse_ids.includes(spouseId)) {
      this.spouse_ids.push(spouseId);
      return true;
    }
    return false;
  }

  /**
   * 配偶者を削除
   * @param {string} spouseId - 配偶者ID
   * @returns {boolean} - 削除に成功した場合はtrue
   */
  removeSpouse(spouseId) {
    const index = this.spouse_ids.indexOf(spouseId);
    if (index !== -1) {
      this.spouse_ids.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 子を追加
   * @param {string} childId - 子ID
   * @returns {boolean} - 追加に成功した場合はtrue
   */
  addChild(childId) {
    if (childId && !this.children_ids.includes(childId)) {
      this.children_ids.push(childId);
      return true;
    }
    return false;
  }

  /**
   * 子を削除
   * @param {string} childId - 子ID
   * @returns {boolean} - 削除に成功した場合はtrue
   */
  removeChild(childId) {
    const index = this.children_ids.indexOf(childId);
    if (index !== -1) {
      this.children_ids.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 父親を設定
   * @param {string|null} fatherId - 父親ID
   * @returns {boolean} - 常にtrue
   */
  setFather(fatherId) {
    this.father_id = fatherId;
    return true;
  }

  /**
   * 母親を設定
   * @param {string|null} motherId - 母親ID
   * @returns {boolean} - 常にtrue
   */
  setMother(motherId) {
    this.mother_id = motherId;
    return true;
  }

  /**
   * 父親の設定をクリア
   * @returns {boolean} - 常にtrue
   */
  clearFather() {
    this.father_id = null;
    return true;
  }

  /**
   * 母親の設定をクリア
   * @returns {boolean} - 常にtrue
   */
  clearMother() {
    this.mother_id = null;
    return true;
  }

  /**
   * 辞書形式に変換
   * @returns {Object} - 人物データの辞書表現
   */
  toDict() {
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
      note: this.note
    };
  }

  /**
   * 人物オブジェクトのディープコピーを作成
   * @returns {Person} - コピーされたPersonオブジェクト
   */
  clone() {
    return new Person(this.toDict());
  }

  /**
   * 人物データのバリデーションを行い、エラーがあれば返す
   * @returns {Object} - フィールド名をキーとするエラーメッセージのリスト
   */
  validate() {
    const errors = {};

    // 名前の検証
    if (!this.name) {
      if (!errors.name) {
        errors.name = [];
      }
      errors.name.push("名前は必須です");
    }

    // 性別の検証
    if (this.gender && ![Gender.MALE, Gender.FEMALE, Gender.UNKNOWN].includes(this.gender)) {
      if (!errors.gender) {
        errors.gender = [];
      }
      errors.gender.push(`性別は ${Gender.MALE}, ${Gender.FEMALE}, ${Gender.UNKNOWN} のいずれかである必要があります`);
    }

    // birth_orderの検証
    if (this.birth_order !== null && this.birth_order < 0) {
      if (!errors.birth_order) {
        errors.birth_order = [];
      }
      errors.birth_order.push("出生順は 0 以上の整数である必要があります");
    }

    // 日付形式の検証 (YYYY-MM-DD or null)
    for (const [fieldName, dateVal] of [["birth_date", this.birth_date], ["death_date", this.death_date]]) {
      if (dateVal) {
        try {
          const date = new Date(dateVal);
          if (isNaN(date.getTime())) {
            if (!errors[fieldName]) {
              errors[fieldName] = [];
            }
            errors[fieldName].push(`${fieldName} は YYYY-MM-DD 形式である必要があります`);
          }
        } catch (e) {
          if (!errors[fieldName]) {
            errors[fieldName] = [];
          }
          errors[fieldName].push(`${fieldName} は YYYY-MM-DD 形式である必要があります`);
        }
      }
    }

    // 生年月日と死亡日の矛盾チェック
    if (!errors.birth_date && !errors.death_date && this.birth_date && this.death_date) {
      const birthDate = new Date(this.birth_date);
      const deathDate = new Date(this.death_date);
      
      if (birthDate > deathDate) {
        if (!errors.death_date) {
          errors.death_date = [];
        }
        errors.death_date.push("死亡日は生年月日より後である必要があります");
      }
    }

    return errors;
  }

  /**
   * 辞書からPersonオブジェクトを生成
   * @param {Object} data - 人物データの辞書
   * @returns {Person} - 生成されたPersonオブジェクト
   * @static
   */
  static fromDict(data) {
    if (!data.id || !data.name) {
      throw new Error(`Missing required field: id or name in data: ${JSON.stringify(data)}`);
    }
    
    return new Person(data);
  }
}

export default Person;
