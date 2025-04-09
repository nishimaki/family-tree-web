/**
 * 家系図を表すデータモデル
 * 家系図全体と、含まれる人物の関係性を管理するクラス
 */
class FamilyTree {
    /**
     * FamilyTreeクラスのコンストラクタ
     * @param {Object} [data] - 初期化データ（オプション）
     * @param {string} [data.title] - 家系図のタイトル
     * @param {string} [data.description] - 家系図の説明
     * @param {Object} [data.persons] - 人物IDをキー、人物データを値とするオブジェクト
     */
    constructor(data = {}) {
        // 人物のコレクション（IDをキー、Personオブジェクトを値とするマップ）
        this._persons = {};
        
        // 家系図のメタデータ
        this.title = data.title || "";
        this.description = data.description || "";
        
        // 初期データがあれば追加
        if (data.persons) {
            this._loadPersonsFromData(data.persons);
        }
    }
    
    /**
     * データオブジェクトから人物を読み込む
     * @param {Object} personsData - 人物IDをキー、人物データを値とするオブジェクト
     * @private
     */
    _loadPersonsFromData(personsData) {
        // 各人物データをPersonオブジェクトに変換して追加
        for (const [id, personData] of Object.entries(personsData)) {
            try {
                // IDの整合性を確保
                if (personData.id !== id) {
                    console.warn(`人物IDの不一致: オブジェクトIDは ${personData.id} ですが、マップキーは ${id} です。キー値を優先します。`);
                    personData.id = id;
                }
                
                const person = new Person(personData);
                this._persons[id] = person;
            } catch (error) {
                console.error(`人物の読み込みエラー (ID: ${id}):`, error);
                // エラーがあっても処理を続行
            }
        }
        
        // すべての人物を読み込んだ後に関係性を構築
        this.buildRelationships();
    }
    
    /**
     * 人物を家系図に追加する
     * @param {Person} person - 追加する人物オブジェクト
     * @returns {boolean} - 追加に成功した場合はtrue
     */
    addPerson(person) {
        if (!(person instanceof Person)) {
            console.error("追加しようとしているオブジェクトはPersonのインスタンスではありません。");
            return false;
        }
        
        // すでに存在するIDかチェック
        if (this._persons[person.id]) {
            console.warn(`ID: ${person.id} の人物はすでに存在します。追加できません。`);
            return false;
        }
        
        // Personオブジェクトを追加
        this._persons[person.id] = person;
        console.log(`人物 ${person.name} (${person.id}) を家系図に追加しました。`);
        return true;
    }
    
    /**
     * 家系図内の親子関係、配偶者関係を構築・更新する
     * 各人物のIDに基づいて関係性を設定し直す
     */
    buildRelationships() {
        console.log(`${Object.keys(this._persons).length}人の関係性を構築中...`);
        const allPersons = this.getAllPersons();
        
        // 1. 全員のchildren_idsをクリア
        for (const person of Object.values(allPersons)) {
            person.children_ids = [];
            // 注意: spouse_idsはクリアしない（JSONからの入力値を維持）
        }
        
        // 2. 親子関係の構築（children_idsの設定）
        for (const [personId, person] of Object.entries(allPersons)) {
            const fatherId = person.father_id;
            const motherId = person.mother_id;
            
            // 父親がいる場合、その子として登録
            if (fatherId && allPersons[fatherId]) {
                const father = allPersons[fatherId];
                if (!father.children_ids.includes(personId)) {
                    father.children_ids.push(personId);
                    console.log(`${person.name} (${personId}) を父親 ${father.name} (${fatherId}) の子に追加`);
                }
            }
            
            // 母親がいる場合、その子として登録
            if (motherId && allPersons[motherId]) {
                const mother = allPersons[motherId];
                if (!mother.children_ids.includes(personId)) {
                    mother.children_ids.push(personId);
                    console.log(`${person.name} (${personId}) を母親 ${mother.name} (${motherId}) の子に追加`);
                }
            }
        }
        
        // 3. 配偶者関係の構築（spouse_idsの相互参照）
        // 子の親情報から推測して設定
        const processedPairs = new Set(); // 同じペアを重複処理しないため
        
        for (const [personId, person] of Object.entries(allPersons)) {
            const fatherId = person.father_id;
            const motherId = person.mother_id;
            
            // 両親が存在する場合、相互に配偶者として登録
            if (fatherId && allPersons[fatherId] && motherId && allPersons[motherId]) {
                // ペアを一意に識別するためにIDをソートして結合
                const pairKey = [fatherId, motherId].sort().join('_');
                
                if (!processedPairs.has(pairKey)) {
                    const father = allPersons[fatherId];
                    const mother = allPersons[motherId];
                    
                    // 父親の配偶者に母親を追加（まだ登録されていなければ）
                    if (!father.spouse_ids.includes(motherId)) {
                        father.spouse_ids.push(motherId);
                        console.log(`配偶者関係推測: ${mother.name} (${motherId}) を ${father.name} (${fatherId}) の配偶者に追加`);
                    }
                    
                    // 母親の配偶者に父親を追加（まだ登録されていなければ）
                    if (!mother.spouse_ids.includes(fatherId)) {
                        mother.spouse_ids.push(fatherId);
                        console.log(`配偶者関係推測: ${father.name} (${fatherId}) を ${mother.name} (${motherId}) の配偶者に追加`);
                    }
                    
                    processedPairs.add(pairKey);
                }
            }
        }
        
        console.log("関係性の構築が完了しました。");
    }
    
    /**
     * 指定されたIDの人物を取得する
     * @param {string} personId - 人物のID
     * @returns {Person|null} - 該当する人物、存在しない場合はnull
     */
    getPerson(personId) {
        return this._persons[personId] || null;
    }
    
    /**
     * すべての人物を取得する
     * @returns {Object} - 人物IDをキー、Personオブジェクトを値とするオブジェクト
     */
    getAllPersons() {
        // 内部マップのシャローコピーを返す
        return {...this._persons};
    }
    
    /**
     * 指定された人物の配偶者IDリストを取得する
     * @param {string} personId - 人物のID
     * @returns {Array<string>} - 配偶者IDのリスト
     */
    getSpouses(personId) {
        const person = this.getPerson(personId);
        return person ? [...person.spouse_ids] : [];
    }
    
    /**
     * 指定された人物の親IDリストを取得する
     * @param {string} personId - 人物のID
     * @returns {Array<string>} - 親IDのリスト
     */
    getParents(personId) {
        const person = this.getPerson(personId);
        if (!person) return [];
        
        const parents = [];
        if (person.father_id) parents.push(person.father_id);
        if (person.mother_id) parents.push(person.mother_id);
        return parents;
    }
    
    /**
     * 指定された人物の子IDリストを取得する
     * @param {string} personId - 人物のID
     * @returns {Array<string>} - 子IDのリスト
     */
    getChildren(personId) {
        const person = this.getPerson(personId);
        return person ? [...person.children_ids] : [];
    }
    
    /**
     * 指定された人物の兄弟姉妹IDリストを取得する
     * @param {string} personId - 人物のID
     * @returns {Array<string>} - 兄弟姉妹IDのリスト
     */
    getSiblings(personId) {
        const person = this.getPerson(personId);
        if (!person) return [];
        
        // 兄弟姉妹 = 同じ親を持つ他の人物
        const siblings = [];
        const allPersons = this.getAllPersons();
        
        // 父親または母親が設定されている場合
        if (person.father_id || person.mother_id) {
            for (const [pid, p] of Object.entries(allPersons)) {
                // 自分自身は除外
                if (pid === personId) continue;
                
                // 父親または母親が一致する場合、兄弟姉妹とみなす
                if ((person.father_id && person.father_id === p.father_id) || 
                    (person.mother_id && person.mother_id === p.mother_id)) {
                    siblings.push(pid);
                }
            }
        }
        
        return siblings;
    }
    
    /**
     * 人物を削除し、関連する他の人物の参照も更新する
     * @param {string} personId - 削除する人物のID
     * @returns {boolean} - 削除に成功した場合はtrue
     */
    removePerson(personId) {
        if (!this._persons[personId]) {
            console.warn(`削除しようとした人物 ${personId} は存在しません。`);
            return false;
        }
        
        const personToRemove = this._persons[personId];
        console.log(`人物を削除します: ${personToRemove.name} (${personId})`);
        
        // 内部マップから削除
        delete this._persons[personId];
        
        // 他の人物の関連情報を更新
        for (const [pid, person] of Object.entries(this._persons)) {
            let needsUpdate = false;
            
            // 削除対象が親だった場合
            if (person.father_id === personId) {
                person.father_id = null;
                needsUpdate = true;
                console.log(`${person.name} の父親 (${personId}) をクリアしました`);
            }
            
            if (person.mother_id === personId) {
                person.mother_id = null;
                needsUpdate = true;
                console.log(`${person.name} の母親 (${personId}) をクリアしました`);
            }
            
            // 削除対象が配偶者だった場合
            if (person.spouse_ids.includes(personId)) {
                person.spouse_ids = person.spouse_ids.filter(id => id !== personId);
                needsUpdate = true;
                console.log(`${person.name} の配偶者 (${personId}) を削除しました`);
            }
            
            // 削除対象が子だった場合
            if (person.children_ids.includes(personId)) {
                person.children_ids = person.children_ids.filter(id => id !== personId);
                needsUpdate = true;
                console.log(`${person.name} の子 (${personId}) を削除しました`);
            }
        }
        
        console.log(`人物 ${personId} の削除と関連参照の更新が完了しました。`);
        return true;
    }
    
    /**
     * 指定された人物データを更新し、関係性を再構築する
     * @param {string} personId - 更新する人物のID
     * @param {Person} updatedPerson - 更新後のPersonオブジェクト
     * @returns {boolean} - 更新に成功した場合はtrue
     */
    updatePerson(personId, updatedPerson) {
        if (!this._persons[personId]) {
            console.error(`更新しようとした人物 ${personId} は存在しません。`);
            return false;
        }
        
        // IDが一致しているか確認（不一致の場合は強制的にIDを設定）
        if (updatedPerson.id !== personId) {
            console.warn(`人物 ${personId} の更新: 提供されたPersonオブジェクトのID (${updatedPerson.id}) が一致しません。IDを ${personId} に強制設定します。`);
            updatedPerson.id = personId;
        }
        
        try {
            // 更新されたPersonオブジェクトで内部マップを更新
            this._persons[personId] = updatedPerson;
            console.log(`人物データを更新しました: ${updatedPerson.name} (${personId})`);
            
            // 関係性を再構築
            this.buildRelationships();
            console.log(`人物 ${personId} の更新後に関係性を再構築しました。`);
            return true;
        } catch (error) {
            console.error(`人物 ${personId} の更新中にエラーが発生しました:`, error);
            return false;
        }
    }
    
    /**
     * 家系図内のルートノード（親がいない人物）のIDリストを取得する
     * @returns {Array<string>} - ルートノードのIDリスト
     */
    getRootNodes() {
        const rootNodes = [];
        
        for (const [personId, person] of Object.entries(this._persons)) {
            // 父親も母親もいない場合、ルートノード
            if (!person.father_id && !person.mother_id) {
                rootNodes.push(personId);
            }
        }
        
        console.log(`${rootNodes.length}個のルートノードを検出: ${rootNodes}`);
        return rootNodes;
    }
    
    /**
     * 家系図内の各人物に世代レベルを割り当てる
     * @returns {Object} - 人物IDをキー、世代レベルを値とするオブジェクト
     */
    assignGenerationLevels() {
        const levels = {};
        const allPersons = this.getAllPersons();
        if (Object.keys(allPersons).length === 0) return {};
        
        console.log("世代レベルの割り当てを開始します。");
        
        // 処理済みノード、訪問回数、キュー
        const processedNodes = new Set();
        const visitedCounts = {};
        const queue = [];
        
        // ルートノードを見つけてキューに追加（レベル0として）
        const rootNodes = this.getRootNodes();
        for (const rootId of rootNodes) {
            queue.push({ id: rootId, level: 0 });
            levels[rootId] = 0;
        }
        
        // BFSベースのレベル伝播
        const maxVisits = Object.keys(allPersons).length * 3; // 無限ループ防止
        
        while (queue.length > 0) {
            const { id: currentId, level: currentLevel } = queue.shift();
            
            // 訪問回数チェック
            visitedCounts[currentId] = (visitedCounts[currentId] || 0) + 1;
            if (visitedCounts[currentId] > maxVisits) {
                console.warn(`ノード ${currentId} の訪問回数が多すぎます (${visitedCounts[currentId]})。ループの可能性があります。処理をスキップします。`);
                continue;
            }
            
            const currentPerson = this.getPerson(currentId);
            if (!currentPerson) {
                console.warn(`レベル割り当て中に人物 ${currentId} が見つかりません。`);
                continue;
            }
            
            // 1. 子へのレベル伝播（親レベル + 1）
            const expectedChildLevel = currentLevel + 1;
            for (const childId of currentPerson.children_ids) {
                if (!allPersons[childId]) continue; // 存在しない子はスキップ
                
                const childLevel = levels[childId];
                if (childLevel === undefined) { // 子のレベル未設定
                    levels[childId] = expectedChildLevel;
                    if (!processedNodes.has(childId) && (visitedCounts[childId] || 0) < maxVisits) {
                        queue.push({ id: childId, level: expectedChildLevel });
                        console.log(`子 ${childId} にレベル ${expectedChildLevel} を割り当てました（親 ${currentId} から）。キューに追加します。`);
                    }
                } else if (childLevel !== expectedChildLevel) {
                    // 既に異なるレベルが設定されている場合
                    console.warn(`子 ${childId} のレベル不一致: 現在=${childLevel}, 期待値=${expectedChildLevel}（親 ${currentId} から）。現在のレベル ${childLevel} を維持します。`);
                }
            }
            
            // 2. 配偶者へのレベル伝播（同じレベル）
            for (const spouseId of currentPerson.spouse_ids) {
                if (!allPersons[spouseId]) continue; // 存在しない配偶者はスキップ
                
                const spouseLevel = levels[spouseId];
                if (spouseLevel === undefined) { // 配偶者のレベル未設定
                    levels[spouseId] = currentLevel;
                    if (!processedNodes.has(spouseId) && (visitedCounts[spouseId] || 0) < maxVisits) {
                        queue.push({ id: spouseId, level: currentLevel });
                        console.log(`配偶者 ${spouseId} にレベル ${currentLevel} を割り当てました（${currentId} から）。キューに追加します。`);
                    }
                } else if (spouseLevel !== currentLevel) {
                    // 既に異なるレベルが設定されている -> レベルが高い方に合わせる
                    const newLevel = Math.min(currentLevel, spouseLevel);
                    if (newLevel < spouseLevel) { // 配偶者のレベルを引き下げる場合
                        levels[spouseId] = newLevel;
                        if (!processedNodes.has(spouseId) && (visitedCounts[spouseId] || 0) < maxVisits) {
                            queue.push({ id: spouseId, level: newLevel });
                            console.log(`配偶者 ${spouseId} のレベルを ${spouseLevel} から ${newLevel} に調整しました（${currentId} のため）。キューに追加します。`);
                        }
                    } else if (newLevel < currentLevel) { // 自分のレベルを引き下げる場合
                        levels[currentId] = newLevel;
                        console.log(`自身 ${currentId} のレベルを ${currentLevel} から ${newLevel} に調整しました（配偶者 ${spouseId} のため）。`);
                    }
                }
            }
            
            processedNodes.add(currentId); // このノードの処理完了
        }
        
        // 未割り当てノードの検出
        const unassignedNodes = Object.keys(allPersons).filter(id => levels[id] === undefined);
        if (unassignedNodes.length > 0) {
            console.warn(`最初のパスで ${unassignedNodes.length} 個のノードにレベルを割り当てられませんでした: ${unassignedNodes}。二次割り当てを試みます...`);
            
            // 簡易的な二次割り当て（すべての未割り当てノードをレベル0とする）
            for (const nodeId of unassignedNodes) {
                levels[nodeId] = 0;
                console.log(`未割り当てノード ${nodeId} にデフォルトレベル 0 を割り当てました。`);
            }
        } else {
            console.log("すべてのノードにレベルの割り当てが完了しました。");
        }
        
        return levels;
    }
    
    /**
     * 二人の人物間の関係を特定する
     * @param {string} person1Id - 1人目の人物ID
     * @param {string} person2Id - 2人目の人物ID
     * @returns {string|null} - 関係を表す文字列、または関係が特定できない場合はnull
     */
    findRelationship(person1Id, person2Id) {
        // 同一人物かチェック
        if (person1Id === person2Id) {
            return "同一人物";
        }
        
        const person1 = this.getPerson(person1Id);
        const person2 = this.getPerson(person2Id);
        
        if (!person1 || !person2) {
            return null; // どちらかの人物が存在しない
        }
        
        // 直接の関係をチェック
        
        // 配偶者関係
        if (person1.spouse_ids.includes(person2Id)) {
            return "配偶者";
        }
        
        // 親子関係
        if (person1.father_id === person2Id) {
            return "父";
        }
        if (person1.mother_id === person2Id) {
            return "母";
        }
        if (person2.father_id === person1Id) {
            return "子";
        }
        if (person2.mother_id === person1Id) {
            return "子";
        }
        
        // 兄弟姉妹関係
        const siblings1 = this.getSiblings(person1Id);
        if (siblings1.includes(person2Id)) {
            return "兄弟姉妹";
        }
        
        // TODO: より複雑な関係（祖父母、孫、叔父叔母など）の識別は
        // 必要に応じて実装可能
        
        return "関係不明"; // 直接の関係が特定できない
    }
    
    /**
     * 家系図データをJSON形式に変換する
     * @returns {Object} - JSON形式の家系図データ
     */
    toJSON() {
        const personsData = {};
        
        // 各人物データをJSON形式に変換
        for (const [id, person] of Object.entries(this._persons)) {
            personsData[id] = person.toJSON();
        }
        
        return {
            title: this.title,
            description: this.description,
            persons: personsData
        };
    }
    
    /**
     * JSON形式の家系図データからFamilyTreeオブジェクトを生成する
     * @param {Object|string} data - JSON形式の家系図データ、または文字列（自動的にパースされる）
     * @returns {FamilyTree} - 生成されたFamilyTreeオブジェクト
     * @static
     */
    static fromJSON(data) {
        // 文字列の場合はパース
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                console.error("家系図データのパースエラー:", error);
                throw new Error("家系図データの形式が無効です。");
            }
        }
        
        // データの基本検証
        if (!data || typeof data !== 'object') {
            throw new Error("家系図データは有効なオブジェクトである必要があります。");
        }
        
        // FamilyTreeオブジェクトの生成
        const familyTree = new FamilyTree({
            title: data.title,
            description: data.description
        });
        
        // 人物データが存在する場合は追加
        if (data.persons && typeof data.persons === 'object') {
            familyTree._loadPersonsFromData(data.persons);
        } else {
            console.warn("家系図データに人物情報がありません。");
        }
        
        return familyTree;
    }
}
