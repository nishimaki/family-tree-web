import Person from './Person';

/**
 * 家系図クラス
 * 家系図全体のデータモデル
 */
class FamilyTree {
  /**
   * コンストラクタ
   */
  constructor() {
    this._persons = {}; // id -> Personオブジェクト
    this.title = "";
    this.description = "";
  }

  /**
   * 人物を追加する
   * @param {Person} person - 追加する人物オブジェクト
   * @returns {boolean} - 追加に成功した場合はtrue
   */
  addPerson(person) {
    if (person.id in this._persons) {
      console.warn(`Person with ID ${person.id} already exists. Cannot add again.`);
      return false;
    }
    this._persons[person.id] = person;
    console.log(`Person ${person.name} (${person.id}) added to the tree dictionary.`);
    return true;
  }

  /**
   * 親子関係、配偶者関係を構築・更新する
   */
  buildRelationships() {
    console.log(`Building relationships for ${Object.keys(this._persons).length} persons...`);
    const allPersons = this.getAllPersons();

    // すべての人物の子リストをクリア
    Object.values(allPersons).forEach(person => {
      person.children_ids = [];
    });

    // 親子関係の構築
    Object.values(allPersons).forEach(person => {
      const fatherId = person.father_id;
      const motherId = person.mother_id;

      if (fatherId && fatherId in allPersons) {
        const father = allPersons[fatherId];
        if (!father.children_ids.includes(person.id)) {
          father.children_ids.push(person.id);
          console.log(`Added ${person.name} (${person.id}) to children of Father ${father.name} (${fatherId})`);
        }
      }

      if (motherId && motherId in allPersons) {
        const mother = allPersons[motherId];
        if (!mother.children_ids.includes(person.id)) {
          mother.children_ids.push(person.id);
          console.log(`Added ${person.name} (${person.id}) to children of Mother ${mother.name} (${motherId})`);
        }
      }
    });

    // 配偶者関係の構築
    const processedParentPairs = new Set();
    Object.values(allPersons).forEach(person => {
      const fatherId = person.father_id;
      const motherId = person.mother_id;

      // 両親が存在する場合
      if (fatherId && fatherId in allPersons && motherId && motherId in allPersons) {
        const pair = [fatherId, motherId].sort().join('-');
        if (!processedParentPairs.has(pair)) {
          const father = allPersons[fatherId];
          const mother = allPersons[motherId];

          // 相互に spouse_ids を追加
          if (!father.spouse_ids.includes(motherId)) {
            father.spouse_ids.push(motherId);
            console.log(`Inferred spouse link: Added ${motherId} to spouses of ${fatherId}`);
          }
          if (!mother.spouse_ids.includes(fatherId)) {
            mother.spouse_ids.push(fatherId);
            console.log(`Inferred spouse link: Added ${fatherId} to spouses of ${motherId}`);
          }

          processedParentPairs.add(pair);
        }
      }
    });

    console.log("Finished building relationships.");
  }

  /**
   * 人物情報を取得
   * @param {string} personId - 取得する人物のID
   * @returns {Person|null} - 人物オブジェクト、存在しない場合はnull
   */
  getPerson(personId) {
    return this._persons[personId] || null;
  }

  /**
   * すべての人物データを取得する
   * @returns {Object} - 人物IDとPersonオブジェクトのマッピング
   */
  getAllPersons() {
    return { ...this._persons };
  }

  /**
   * 配偶者IDリストを取得
   * @param {string} personId - 対象の人物ID
   * @returns {Array} - 配偶者IDのリスト
   */
  getSpouses(personId) {
    const person = this.getPerson(personId);
    return person ? person.spouse_ids : [];
  }

  /**
   * 親IDリストを取得
   * @param {string} personId - 対象の人物ID
   * @returns {Array} - 親IDのリスト
   */
  getParents(personId) {
    const person = this.getPerson(personId);
    if (!person) {
      return [];
    }
    
    const parents = [];
    if (person.father_id) {
      parents.push(person.father_id);
    }
    if (person.mother_id) {
      parents.push(person.mother_id);
    }
    
    return parents;
  }

  /**
   * 子IDリストを取得
   * @param {string} personId - 対象の人物ID
   * @returns {Array} - 子IDのリスト
   */
  getChildren(personId) {
    const person = this.getPerson(personId);
    return person ? person.children_ids : [];
  }

  /**
   * 兄弟IDリストを取得
   * @param {string} personId - 対象の人物ID
   * @returns {Array} - 兄弟IDのリスト
   */
  getSiblings(personId) {
    const person = this.getPerson(personId);
    if (!person) {
      return [];
    }
    
    const siblings = [];
    if (person.father_id || person.mother_id) {
      Object.entries(this._persons).forEach(([pid, p]) => {
        // 自分自身は除外
        if (pid === personId) {
          return;
        }
        
        // 父親または母親が一致している場合
        if ((person.father_id && person.father_id === p.father_id) || 
            (person.mother_id && person.mother_id === p.mother_id)) {
          siblings.push(pid);
        }
      });
    }
    
    return siblings;
  }

  /**
   * 人物を削除し、関連する他の人物の家族関係情報も更新する
   * @param {string} personId - 削除する人物のID
   * @returns {boolean} - 削除に成功した場合はtrue
   */
  removePerson(personId) {
    if (!(personId in this._persons)) {
      console.warn(`Attempted to remove non-existent person: ${personId}`);
      return false;
    }

    const personToRemove = this._persons[personId];
    console.log(`Removing person: ${personToRemove.name} (${personId})`);

    // 内部辞書から削除
    delete this._persons[personId];

    // 他の人物の関連情報を更新
    Object.values(this._persons).forEach(p => {
      let needsUpdate = false;
      
      // 削除対象が親だった場合
      if (p.father_id === personId) {
        p.father_id = null;
        needsUpdate = true;
        console.log(`Cleared father_id (${personId}) for ${p.name}`);
      }
      
      if (p.mother_id === personId) {
        p.mother_id = null;
        needsUpdate = true;
        console.log(`Cleared mother_id (${personId}) for ${p.name}`);
      }
      
      // 削除対象が配偶者だった場合
      const spouseIndex = p.spouse_ids.indexOf(personId);
      if (spouseIndex !== -1) {
        p.spouse_ids.splice(spouseIndex, 1);
        needsUpdate = true;
        console.log(`Removed spouse_id (${personId}) from ${p.name}`);
      }
      
      // 削除対象が子だった場合
      const childIndex = p.children_ids.indexOf(personId);
      if (childIndex !== -1) {
        p.children_ids.splice(childIndex, 1);
        needsUpdate = true;
        console.log(`Removed child_id (${personId}) from ${p.name}`);
      }
    });
    
    console.log(`Successfully removed person ${personId} and updated related references.`);
    return true;
  }

  /**
   * ルートノード（親がいないノード）のIDリストを取得する
   * @returns {Array} - ルートノードのIDリスト
   */
  getRootNodes() {
    const rootNodes = [];
    Object.entries(this._persons).forEach(([personId, person]) => {
      // father_id と mother_id が両方とも null であればルートノード
      if (person.father_id === null && person.mother_id === null) {
        rootNodes.push(personId);
      }
    });
    
    console.log(`Found ${rootNodes.length} root nodes: ${rootNodes}`);
    return rootNodes;
  }

  /**
   * 家系図データをグラフィカル表示用の階層構造に変換する
   * @param {string} rootPersonId - 表示のルートとなる人物ID（指定しない場合は家系図のルートノードが使用される）
   * @param {number} maxGenerations - 表示する最大世代数（デフォルト: 3）
   * @returns {Object} - 階層構造データ
   */
  getHierarchyData(rootPersonId = null, maxGenerations = 3) {
    // ルート人物IDが指定されていない場合、家系図のルートノードの最初を使用
    if (!rootPersonId) {
      const rootNodes = this.getRootNodes();
      if (rootNodes.length === 0) {
        console.warn('家系図にルートノードがありません。');
        return null;
      }
      rootPersonId = rootNodes[0];
    }

    // 指定されたIDの人物が存在するか確認
    const rootPerson = this.getPerson(rootPersonId);
    if (!rootPerson) {
      console.warn(`指定されたID ${rootPersonId} の人物が見つかりません。`);
      return null;
    }

    // 階層構造を再帰的に構築する関数
    const buildHierarchy = (personId, generation = 0, processedIds = new Set()) => {
      if (generation >= maxGenerations || processedIds.has(personId)) {
        return null;
      }

      const person = this.getPerson(personId);
      if (!person) {
        return null;
      }

      processedIds.add(personId);

      // 基本情報
      const node = {
        id: person.id,
        name: person.name,
        gender: person.gender,
        birth_date: person.birth_date,
        death_date: person.death_date,
        children: [],
        spouses: []
      };

      // 配偶者情報を追加
      person.spouse_ids.forEach(spouseId => {
        const spouse = this.getPerson(spouseId);
        if (spouse) {
          node.spouses.push({
            id: spouse.id,
            name: spouse.name,
            gender: spouse.gender
          });
        }
      });

      // 子情報を追加（再帰的に子の階層を構築）
      if (generation < maxGenerations - 1) {
        person.children_ids.forEach(childId => {
          const childNode = buildHierarchy(childId, generation + 1, new Set(processedIds));
          if (childNode) {
            node.children.push(childNode);
          }
        });
      }

      return node;
    };

    // 階層構造の構築を開始
    return buildHierarchy(rootPersonId);
  }

  /**
   * 指定されたIDの人物データを更新し、関連する関係性を再構築する
   * @param {string} personId - 更新する人物のID
   * @param {Person} updatedPerson - 更新後の Person オブジェクト
   * @returns {boolean} - 更新に成功した場合はtrue
   */
  updatePerson(personId, updatedPerson) {
    if (!(personId in this._persons)) {
      console.error(`Cannot update non-existent person: ${personId}`);
      return false;
    }

    // IDが一致しているか確認（もしくは強制的に設定）
    if (updatedPerson.id !== personId) {
      console.warn(`Updating person ${personId}: Provided Person object has different ID (${updatedPerson.id}). Forcing ID to ${personId}.`);
      updatedPerson.id = personId; // IDを強制的に合わせる
    }
    
    try {
      // 更新された Person オブジェクトで内部辞書を置き換え
      this._persons[personId] = updatedPerson;
      console.log(`Updated person data for ${updatedPerson.name} (${personId})`);
      
      // 関係性を再構築 (更新によって親子関係などが変わる可能性があるため)
      this.buildRelationships();
      console.log(`Rebuilt relationships after updating ${personId}.`);
      return true;
    } catch (e) {
      console.error(`Error updating Person object in dictionary for ${personId}: ${e}`);
      return false;
    }
  }
}

export default FamilyTree;
