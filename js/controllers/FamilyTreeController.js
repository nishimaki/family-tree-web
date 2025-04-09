/**
 * 家系図コントローラー
 * モデルとビューの間を仲介し、アプリケーションの主要なロジックを管理
 */
class FamilyTreeController {
    /**
     * コントローラーを初期化
     */
    constructor() {
        // 家系図モデル
        this.familyTree = new FamilyTree();
        
        // 選択中の人物ID
        this.selectedPersonId = null;
        
        // ビューの更新をリクエストするためのコールバック関数
        this.callbacks = {
            onFamilyTreeUpdated: null,
            onPersonSelected: null,
            onError: null
        };
    }
    
    /**
     * コールバック関数を登録
     * @param {string} event - イベント名
     * @param {Function} callback - コールバック関数
     */
    registerCallback(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        } else {
            console.warn(`未知のイベント "${event}" にコールバックを登録しようとしました。`);
        }
    }
    
    /**
     * サンプルデータを読み込む
     */
    async loadSampleData() {
        try {
            const data = await FileManager.loadSampleData();
            this.loadFamilyTreeFromData(data);
        } catch (error) {
            console.error('サンプルデータの読み込みに失敗しました。', error);
            this._notifyError('サンプルデータの読み込みに失敗しました。', error);
        }
    }
    
    /**
     * 家系図データをロード
     * @param {Object|string} data - 家系図データまたはJSON文字列
     */
    loadFamilyTreeFromData(data) {
        try {
            // 文字列の場合はJSON解析
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            // FamilyTreeオブジェクトを生成
            this.familyTree = FamilyTree.fromJSON(data);
            
            console.log('家系図データを読み込みました。', this.familyTree);
            
            // ルートノードまたは最初の人物を選択
            const rootNodes = this.familyTree.getRootNodes();
            if (rootNodes.length > 0) {
                this.selectPerson(rootNodes[0]);
            } else {
                const allPersons = this.familyTree.getAllPersons();
                const personIds = Object.keys(allPersons);
                if (personIds.length > 0) {
                    this.selectPerson(personIds[0]);
                }
            }
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
        } catch (error) {
            console.error('家系図データの読み込みに失敗しました。', error);
            this._notifyError('家系図データの読み込みに失敗しました。', error);
        }
    }
    
    /**
     * ファイルから家系図をロード
     * @param {File} file - JSONファイル
     */
    async loadFamilyTreeFromFile(file) {
        try {
            const data = await FileManager.readFromFile(file);
            this.loadFamilyTreeFromData(data);
            return true;
        } catch (error) {
            console.error('ファイルからの読み込みに失敗しました。', error);
            this._notifyError('ファイルからの読み込みに失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 家系図をファイルに保存
     * @param {string} [filename='family_tree.json'] - 保存するファイル名
     */
    saveFamilyTreeToFile(filename = 'family_tree.json') {
        try {
            const data = this.familyTree.toJSON();
            FileManager.saveToFile(data, filename);
            return true;
        } catch (error) {
            console.error('家系図の保存に失敗しました。', error);
            this._notifyError('家系図の保存に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 人物を選択
     * @param {string} personId - 選択する人物のID
     */
    selectPerson(personId) {
        const person = this.familyTree.getPerson(personId);
        if (!person) {
            console.warn(`ID: ${personId} の人物は存在しません。`);
            return false;
        }
        
        this.selectedPersonId = personId;
        console.log(`人物を選択: ${person.name} (${personId})`);
        
        // 人物選択イベントを通知
        if (this.callbacks.onPersonSelected) {
            this.callbacks.onPersonSelected(personId, person);
        }
        
        return true;
    }
    
    /**
     * 人物を追加
     * @param {Object} personData - 人物データ
     * @returns {string|null} - 追加された人物のID、失敗した場合はnull
     */
    addPerson(personData) {
        try {
            // Personオブジェクトを生成
            const person = new Person(personData);
            
            // バリデーション
            const errors = person.validate();
            if (Object.keys(errors).length > 0) {
                console.error('人物データが無効です。', errors);
                this._notifyError('人物データにエラーがあります。', errors);
                return null;
            }
            
            // 家系図に追加
            const success = this.familyTree.addPerson(person);
            if (!success) {
                console.error('人物の追加に失敗しました。');
                return null;
            }
            
            // 家系図の関係性を再構築
            this.familyTree.buildRelationships();
            
            console.log(`人物を追加しました: ${person.name} (${person.id})`);
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return person.id;
        } catch (error) {
            console.error('人物の追加中にエラーが発生しました。', error);
            this._notifyError('人物の追加に失敗しました。', error);
            return null;
        }
    }
    
    /**
     * 人物を更新
     * @param {string} personId - 更新する人物のID
     * @param {Object} personData - 更新データ
     * @returns {boolean} - 更新に成功した場合はtrue
     */
    updatePerson(personId, personData) {
        try {
            // 既存の人物を取得
            const existingPerson = this.familyTree.getPerson(personId);
            if (!existingPerson) {
                console.error(`ID: ${personId} の人物は存在しません。更新できません。`);
                return false;
            }
            
            // 更新データにIDを設定（一貫性のため）
            personData.id = personId;
            
            // Personオブジェクトを生成
            const updatedPerson = new Person(personData);
            
            // バリデーション
            const errors = updatedPerson.validate();
            if (Object.keys(errors).length > 0) {
                console.error('更新データが無効です。', errors);
                this._notifyError('人物データにエラーがあります。', errors);
                return false;
            }
            
            // 家系図の人物を更新
            const success = this.familyTree.updatePerson(personId, updatedPerson);
            if (!success) {
                console.error(`人物 ${personId} の更新に失敗しました。`);
                return false;
            }
            
            console.log(`人物を更新しました: ${updatedPerson.name} (${personId})`);
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return true;
        } catch (error) {
            console.error('人物の更新中にエラーが発生しました。', error);
            this._notifyError('人物の更新に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 人物を削除
     * @param {string} personId - 削除する人物のID
     * @returns {boolean} - 削除に成功した場合はtrue
     */
    removePerson(personId) {
        try {
            // 現在選択中の人物が削除される場合、別の人物を選択
            if (this.selectedPersonId === personId) {
                const allPersons = this.familyTree.getAllPersons();
                const personIds = Object.keys(allPersons).filter(id => id !== personId);
                
                if (personIds.length > 0) {
                    // 親または子を優先的に選択
                    const person = this.familyTree.getPerson(personId);
                    const relatedIds = [
                        ...(person?.father_id ? [person.father_id] : []),
                        ...(person?.mother_id ? [person.mother_id] : []),
                        ...(person?.children_ids || [])
                    ].filter(id => id !== personId);
                    
                    if (relatedIds.length > 0) {
                        this.selectedPersonId = relatedIds[0];
                    } else {
                        this.selectedPersonId = personIds[0];
                    }
                } else {
                    this.selectedPersonId = null;
                }
            }
            
            // 家系図から人物を削除
            const success = this.familyTree.removePerson(personId);
            if (!success) {
                console.error(`人物 ${personId} の削除に失敗しました。`);
                return false;
            }
            
            console.log(`人物 ${personId} を削除しました。`);
            
            // 選択中の人物が変わった場合、人物選択イベントを通知
            if (this.callbacks.onPersonSelected && this.selectedPersonId) {
                const selectedPerson = this.familyTree.getPerson(this.selectedPersonId);
                this.callbacks.onPersonSelected(this.selectedPersonId, selectedPerson);
            }
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return true;
        } catch (error) {
            console.error('人物の削除中にエラーが発生しました。', error);
            this._notifyError('人物の削除に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 親子関係を設定
     * @param {string} childId - 子のID
     * @param {string} parentId - 親のID
     * @param {string} parentType - 親の種類（'father'または'mother'）
     * @returns {boolean} - 設定に成功した場合はtrue
     */
    setParentChild(childId, parentId, parentType) {
        try {
            const child = this.familyTree.getPerson(childId);
            const parent = this.familyTree.getPerson(parentId);
            
            if (!child || !parent) {
                console.error('親または子が存在しません。');
                return false;
            }
            
            if (childId === parentId) {
                console.error('自分自身を親に設定することはできません。');
                return false;
            }
            
            // 親の種類に応じて設定
            if (parentType === 'father') {
                child.setFather(parentId);
            } else if (parentType === 'mother') {
                child.setMother(parentId);
            } else {
                console.error(`無効な親タイプ: ${parentType}`);
                return false;
            }
            
            // 家系図の関係性を再構築
            this.familyTree.buildRelationships();
            
            console.log(`${parentType === 'father' ? '父' : '母'}子関係を設定: ${parent.name} → ${child.name}`);
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return true;
        } catch (error) {
            console.error('親子関係の設定中にエラーが発生しました。', error);
            this._notifyError('親子関係の設定に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 親子関係を解除
     * @param {string} childId - 子のID
     * @param {string} parentType - 親の種類（'father'または'mother'）
     * @returns {boolean} - 解除に成功した場合はtrue
     */
    removeParentChild(childId, parentType) {
        try {
            const child = this.familyTree.getPerson(childId);
            
            if (!child) {
                console.error('子が存在しません。');
                return false;
            }
            
            // 親の種類に応じて解除
            if (parentType === 'father') {
                child.clearFather();
            } else if (parentType === 'mother') {
                child.clearMother();
            } else {
                console.error(`無効な親タイプ: ${parentType}`);
                return false;
            }
            
            // 家系図の関係性を再構築
            this.familyTree.buildRelationships();
            
            console.log(`${child.name} の${parentType === 'father' ? '父' : '母'}親関係を解除しました。`);
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return true;
        } catch (error) {
            console.error('親子関係の解除中にエラーが発生しました。', error);
            this._notifyError('親子関係の解除に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 配偶者関係を追加
     * @param {string} person1Id - 1人目のID
     * @param {string} person2Id - 2人目のID
     * @returns {boolean} - 追加に成功した場合はtrue
     */
    addSpouseRelationship(person1Id, person2Id) {
        try {
            const person1 = this.familyTree.getPerson(person1Id);
            const person2 = this.familyTree.getPerson(person2Id);
            
            if (!person1 || !person2) {
                console.error('どちらかの人物が存在しません。');
                return false;
            }
            
            if (person1Id === person2Id) {
                console.error('自分自身を配偶者に設定することはできません。');
                return false;
            }
            
            // 相互に配偶者を追加
            person1.addSpouse(person2Id);
            person2.addSpouse(person1Id);
            
            console.log(`配偶者関係を追加: ${person1.name} ⇔ ${person2.name}`);
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return true;
        } catch (error) {
            console.error('配偶者関係の追加中にエラーが発生しました。', error);
            this._notifyError('配偶者関係の追加に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 配偶者関係を削除
     * @param {string} person1Id - 1人目のID
     * @param {string} person2Id - 2人目のID
     * @returns {boolean} - 削除に成功した場合はtrue
     */
    removeSpouseRelationship(person1Id, person2Id) {
        try {
            const person1 = this.familyTree.getPerson(person1Id);
            const person2 = this.familyTree.getPerson(person2Id);
            
            if (!person1 || !person2) {
                console.error('どちらかの人物が存在しません。');
                return false;
            }
            
            // 相互に配偶者を削除
            person1.removeSpouse(person2Id);
            person2.removeSpouse(person1Id);
            
            console.log(`配偶者関係を削除: ${person1.name} ⇔ ${person2.name}`);
            
            // 家系図更新イベントを通知
            this._notifyFamilyTreeUpdated();
            
            return true;
        } catch (error) {
            console.error('配偶者関係の削除中にエラーが発生しました。', error);
            this._notifyError('配偶者関係の削除に失敗しました。', error);
            return false;
        }
    }
    
    /**
     * 家系図更新イベントを通知
     * @private
     */
    _notifyFamilyTreeUpdated() {
        if (this.callbacks.onFamilyTreeUpdated) {
            this.callbacks.onFamilyTreeUpdated(this.familyTree);
        }
    }
    
    /**
     * エラーイベントを通知
     * @param {string} message - エラーメッセージ
     * @param {*} [details] - エラーの詳細
     * @private
     */
    _notifyError(message, details = null) {
        if (this.callbacks.onError) {
            this.callbacks.onError(message, details);
        }
    }
}
