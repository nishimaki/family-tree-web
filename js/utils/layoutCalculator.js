/**
 * 家系図のレイアウト計算を担当するクラス
 * 人物ノードの配置座標と接続線の情報を計算する
 */
class LayoutCalculator {
    /**
     * 家系図全体のレイアウトを計算する
     * @param {FamilyTree} familyTree - 家系図データ
     * @param {Object} nodeWidths - ノードの幅の情報 (IDがキー、幅が値)
     * @param {Object} nodeHeights - ノードの高さの情報 (IDがキー、高さが値)
     * @returns {Object} 計算されたレイアウト情報
     */
    static calculateFamilyTreeLayout(familyTree, nodeWidths = {}, nodeHeights = {}) {
        console.log("家系図全体のレイアウトを計算中...");
        
        if (!familyTree || Object.keys(familyTree.getAllPersons()).length === 0) {
            console.warn("空の家系図のためレイアウト計算をスキップします。");
            return {
                nodePositions: {},
                connectorLines: []
            };
        }
        
        // 1. 世代レベルの計算
        const generationLevels = familyTree.assignGenerationLevels();
        console.log("世代レベル:", generationLevels);
        
        // 2. 各世代の人物をグループ化
        const generationGroups = this._groupPersonsByGeneration(familyTree, generationLevels);
        console.log("世代グループ:", generationGroups);
        
        // 3. Y座標の計算（世代レベルに基づく）
        const yPositions = this._calculateYPositions(generationGroups, nodeHeights);
        console.log("Y座標:", yPositions);
        
        // 4. X座標の計算（各世代内での順序に基づく）
        const nodePositions = this._calculateXPositions(familyTree, generationGroups, generationLevels, yPositions, nodeWidths);
        console.log("ノード位置:", nodePositions);
        
        // 5. 接続線情報の計算
        const connectorLines = this._calculateConnectorLines(familyTree, nodePositions, nodeWidths, nodeHeights);
        console.log("接続線:", connectorLines);
        
        return {
            nodePositions,
            connectorLines
        };
    }
    
    /**
     * 世代ごとに人物をグループ化する
     * @param {FamilyTree} familyTree - 家系図データ
     * @param {Object} generationLevels - 各人物の世代レベル
     * @returns {Object} 世代ごとの人物IDの配列
     * @private
     */
    static _groupPersonsByGeneration(familyTree, generationLevels) {
        const groups = {};
        const allPersons = familyTree.getAllPersons();
        
        // 各人物を世代レベルごとにグループ化
        for (const [personId, person] of Object.entries(allPersons)) {
            const level = generationLevels[personId];
            if (level === undefined) {
                console.warn(`人物 ${personId} (${person.name}) の世代レベルが不明です。`);
                continue;
            }
            
            if (!groups[level]) {
                groups[level] = [];
            }
            groups[level].push(personId);
        }
        
        // 各世代内で人物を出生順でソート
        for (const level in groups) {
            groups[level] = this._sortPersonsByBirthOrder(groups[level], allPersons);
        }
        
        return groups;
    }
    
    /**
     * 人物を出生順でソートする
     * @param {Array<string>} personIds - 人物IDのリスト
     * @param {Object} persons - 人物オブジェクト (IDがキー)
     * @returns {Array<string>} ソートされた人物IDのリスト
     * @private
     */
    static _sortPersonsByBirthOrder(personIds, persons) {
        return personIds.sort((aId, bId) => {
            const personA = persons[aId];
            const personB = persons[bId];
            
            // 出生順が設定されている場合はそれを優先
            if (personA.birth_order !== null && personB.birth_order !== null) {
                return personA.birth_order - personB.birth_order;
            }
            
            // 生年月日で比較
            if (personA.birth_date && personB.birth_date) {
                return personA.birth_date.localeCompare(personB.birth_date);
            }
            
            // どちらも情報がない場合はIDで比較（一貫性のため）
            return aId.localeCompare(bId);
        });
    }
    
    /**
     * Y座標を計算する（世代レベルに基づく）
     * @param {Object} generationGroups - 世代ごとの人物IDの配列
     * @param {Object} nodeHeights - ノードの高さの情報
     * @returns {Object} 各人物のY座標
     * @private
     */
    static _calculateYPositions(generationGroups, nodeHeights) {
        const yPositions = {};
        const verticalSpacing = LayoutConstants.NODE_VERTICAL_SPACING;
        let currentY = 0;
        
        // 世代レベルの昇順で処理
        const levels = Object.keys(generationGroups).map(Number).sort((a, b) => a - b);
        
        for (const level of levels) {
            const personIds = generationGroups[level];
            
            // この世代の人物すべてに同じY座標を割り当て
            for (const personId of personIds) {
                yPositions[personId] = currentY;
            }
            
            // この世代の最大ノード高さを計算
            let maxHeight = LayoutConstants.NODE_HEIGHT_ESTIMATE; // デフォルト値
            for (const personId of personIds) {
                if (nodeHeights[personId]) {
                    maxHeight = Math.max(maxHeight, nodeHeights[personId]);
                }
            }
            
            // 次の世代のY座標の基点を計算
            currentY += maxHeight + verticalSpacing;
        }
        
        return yPositions;
    }
    
    /**
     * X座標を計算する（各世代内での順序に基づく）
     * @param {FamilyTree} familyTree - 家系図データ
     * @param {Object} generationGroups - 世代ごとの人物IDの配列
     * @param {Object} generationLevels - 各人物の世代レベル
     * @param {Object} yPositions - 各人物のY座標
     * @param {Object} nodeWidths - ノードの幅の情報
     * @returns {Object} 各人物のXY座標
     * @private
     */
    static _calculateXPositions(familyTree, generationGroups, generationLevels, yPositions, nodeWidths) {
        const nodePositions = {};
        const horizontalSpacing = LayoutConstants.CHILD_HORIZONTAL_SPACING;
        const defaultNodeWidth = LayoutConstants.NODE_WIDTH_ESTIMATE;
        
        // すべての人物に初期Y座標を設定
        for (const personId in yPositions) {
            nodePositions[personId] = {
                x: 0, // 仮のX値（後で調整）
                y: yPositions[personId]
            };
        }
        
        // 世代レベルの昇順で処理
        const levels = Object.keys(generationGroups).map(Number).sort((a, b) => a - b);
        
        // 最初の世代（通常はルートノード）のX座標を設定
        let currentX = 0;
        for (const personId of generationGroups[levels[0]]) {
            const width = nodeWidths[personId] || defaultNodeWidth;
            nodePositions[personId].x = currentX;
            currentX += width + horizontalSpacing;
        }
        
        // 残りの世代のX座標を計算
        for (let i = 1; i < levels.length; i++) {
            const level = levels[i];
            const personIds = generationGroups[level];
            
            // この世代の各人物を処理
            currentX = 0;
            for (const personId of personIds) {
                const person = familyTree.getPerson(personId);
                if (!person) continue;
                
                const width = nodeWidths[personId] || defaultNodeWidth;
                
                // 親のX座標に基づいて配置を決定
                const parents = familyTree.getParents(personId);
                if (parents.length > 0) {
                    let parentCenterX = 0;
                    
                    // 両親の中央にする
                    for (const parentId of parents) {
                        if (nodePositions[parentId]) {
                            const parentWidth = nodeWidths[parentId] || defaultNodeWidth;
                            parentCenterX += nodePositions[parentId].x + parentWidth / 2;
                        }
                    }
                    
                    parentCenterX /= parents.length;
                    
                    // 子の中央を親の中央に合わせる
                    nodePositions[personId].x = parentCenterX - width / 2;
                } else {
                    // 親がいない場合は単純に順番に配置
                    nodePositions[personId].x = currentX;
                }
                
                currentX = nodePositions[personId].x + width + horizontalSpacing;
            }
            
            // 重複を解決（この世代内の人物が重ならないように調整）
            this._resolveOverlaps(personIds, nodePositions, nodeWidths);
        }
        
        return nodePositions;
    }
    
    /**
     * 人物ノード間の重複を解決する
     * @param {Array<string>} personIds - 調整する人物IDのリスト
     * @param {Object} nodePositions - 各人物の座標情報
     * @param {Object} nodeWidths - ノードの幅の情報
     * @private
     */
    static _resolveOverlaps(personIds, nodePositions, nodeWidths) {
        const defaultNodeWidth = LayoutConstants.NODE_WIDTH_ESTIMATE;
        const minSpacing = LayoutConstants.CHILD_HORIZONTAL_SPACING;
        
        // ノードを左から右へ順に処理
        for (let i = 0; i < personIds.length - 1; i++) {
            const currentId = personIds[i];
            const nextId = personIds[i + 1];
            
            if (!nodePositions[currentId] || !nodePositions[nextId]) continue;
            
            const currentWidth = nodeWidths[currentId] || defaultNodeWidth;
            const currentRight = nodePositions[currentId].x + currentWidth;
            const nextLeft = nodePositions[nextId].x;
            
            // 重なりがある場合、右側のノードを移動
            if (currentRight + minSpacing > nextLeft) {
                const offset = currentRight + minSpacing - nextLeft;
                
                // i+1以降のすべてのノードを右にシフト
                for (let j = i + 1; j < personIds.length; j++) {
                    const shiftId = personIds[j];
                    if (nodePositions[shiftId]) {
                        nodePositions[shiftId].x += offset;
                    }
                }
            }
        }
    }
    
    /**
     * 接続線情報を計算する
     * @param {FamilyTree} familyTree - 家系図データ
     * @param {Object} nodePositions - 各人物の座標情報
     * @param {Object} nodeWidths - ノードの幅の情報
     * @param {Object} nodeHeights - ノードの高さの情報
     * @returns {Array} 接続線情報の配列
     * @private
     */
    static _calculateConnectorLines(familyTree, nodePositions, nodeWidths, nodeHeights) {
        const connectors = [];
        const defaultNodeWidth = LayoutConstants.NODE_WIDTH_ESTIMATE;
        const defaultNodeHeight = LayoutConstants.NODE_HEIGHT_ESTIMATE;
        const verticalConnectorLength = LayoutConstants.VERTICAL_CONNECTOR_LENGTH;
        
        const allPersons = familyTree.getAllPersons();
        
        // 1. 夫婦の接続線
        const processedPairs = new Set();
        
        for (const [personId, person] of Object.entries(allPersons)) {
            // 配偶者ごとに処理
            for (const spouseId of person.spouse_ids) {
                const spouse = familyTree.getPerson(spouseId);
                if (!spouse) continue;
                
                // 各カップルを一度だけ処理（ID順でキーを作成）
                const pairKey = [personId, spouseId].sort().join('_');
                if (processedPairs.has(pairKey)) continue;
                processedPairs.add(pairKey);
                
                // 両方のノードの位置情報が存在するか確認
                if (!nodePositions[personId] || !nodePositions[spouseId]) continue;
                
                const personWidth = nodeWidths[personId] || defaultNodeWidth;
                const spouseWidth = nodeWidths[spouseId] || defaultNodeWidth;
                const personHeight = nodeHeights[personId] || defaultNodeHeight;
                const spouseHeight = nodeHeights[spouseId] || defaultNodeHeight;
                
                // 左右の関係を決定（X座標が小さい方が左）
                let leftId, rightId, leftWidth, rightWidth, leftHeight, rightHeight;
                if (nodePositions[personId].x <= nodePositions[spouseId].x) {
                    leftId = personId;
                    rightId = spouseId;
                    leftWidth = personWidth;
                    rightWidth = spouseWidth;
                    leftHeight = personHeight;
                    rightHeight = spouseHeight;
                } else {
                    leftId = spouseId;
                    rightId = personId;
                    leftWidth = spouseWidth;
                    rightWidth = personWidth;
                    leftHeight = spouseHeight;
                    rightHeight = personHeight;
                }
                
                // 夫婦を結ぶ水平線
                const y = Math.min(
                    nodePositions[leftId].y + leftHeight / 2,
                    nodePositions[rightId].y + rightHeight / 2
                );
                
                const spouseLine = {
                    type: 'spouse',
                    x1: nodePositions[leftId].x + leftWidth,
                    y1: y,
                    x2: nodePositions[rightId].x,
                    y2: y,
                    persons: [leftId, rightId]
                };
                
                connectors.push(spouseLine);
                
                // 子供がいる場合、夫婦線の中央から子への接続線を追加
                const childrenIds = [...new Set([...allPersons[leftId].children_ids, ...allPersons[rightId].children_ids])];
                if (childrenIds.length > 0) {
                    // 共通の子のみ（両方の親がこのカップル）
                    const commonChildren = childrenIds.filter(childId => {
                        const child = familyTree.getPerson(childId);
                        return child && 
                               ((child.father_id === leftId && child.mother_id === rightId) || 
                                (child.father_id === rightId && child.mother_id === leftId));
                    });
                    
                    if (commonChildren.length > 0) {
                        this._addParentChildConnectors(
                            connectors,
                            commonChildren,
                            nodePositions,
                            nodeWidths,
                            nodeHeights,
                            // 親の中央位置
                            (nodePositions[leftId].x + leftWidth + nodePositions[rightId].x) / 2,
                            y
                        );
                    }
                }
            }
            
            // 2. 単独親と子の接続線
            // 配偶者と共有していない子を処理
            const singleParentChildren = person.children_ids.filter(childId => {
                const child = familyTree.getPerson(childId);
                if (!child) return false;
                
                // 両親のうち、現在の人物だけが親である子を探す
                const otherParentId = child.father_id === personId ? child.mother_id : child.father_id;
                return !person.spouse_ids.includes(otherParentId);
            });
            
            if (singleParentChildren.length > 0 && nodePositions[personId]) {
                const personWidth = nodeWidths[personId] || defaultNodeWidth;
                const personHeight = nodeHeights[personId] || defaultNodeHeight;
                
                // 親の中央位置
                const parentCenterX = nodePositions[personId].x + personWidth / 2;
                const parentBottomY = nodePositions[personId].y + personHeight;
                
                this._addParentChildConnectors(
                    connectors,
                    singleParentChildren,
                    nodePositions,
                    nodeWidths,
                    nodeHeights,
                    parentCenterX,
                    parentBottomY
                );
            }
        }
        
        return connectors;
    }
    
    /**
     * 親から子への接続線を追加する
     * @param {Array} connectors - 接続線情報の配列
     * @param {Array<string>} childrenIds - 子のIDリスト
     * @param {Object} nodePositions - 各人物の座標情報
     * @param {Object} nodeWidths - ノードの幅の情報
     * @param {Object} nodeHeights - ノードの高さの情報
     * @param {number} parentX - 親のX座標中央
     * @param {number} parentY - 親のY座標（接続開始点）
     * @private
     */
    static _addParentChildConnectors(connectors, childrenIds, nodePositions, nodeWidths, nodeHeights, parentX, parentY) {
        const defaultNodeWidth = LayoutConstants.NODE_WIDTH_ESTIMATE;
        const defaultNodeHeight = LayoutConstants.NODE_HEIGHT_ESTIMATE;
        const verticalConnectorLength = LayoutConstants.VERTICAL_CONNECTOR_LENGTH;
        
        // 有効な子ノードのみフィルター
        const validChildren = childrenIds.filter(id => nodePositions[id]);
        if (validChildren.length === 0) return;
        
        // 子ノードのX座標中央位置を計算
        const childrenCenters = validChildren.map(id => {
            const width = nodeWidths[id] || defaultNodeWidth;
            return {
                id,
                centerX: nodePositions[id].x + width / 2,
                topY: nodePositions[id].y
            };
        });
        
        // 子ノードが1人の場合は直接接続
        if (childrenCenters.length === 1) {
            const child = childrenCenters[0];
            
            // 親から子に垂直線を引く
            connectors.push({
                type: 'parent-child-vertical',
                x1: parentX,
                y1: parentY,
                x2: parentX,
                y2: child.topY - verticalConnectorLength,
                persons: [validChildren[0]]
            });
            
            // 子に水平線を引く（必要な場合）
            if (Math.abs(parentX - child.centerX) > 1) {
                connectors.push({
                    type: 'parent-child-horizontal',
                    x1: parentX,
                    y1: child.topY - verticalConnectorLength,
                    x2: child.centerX,
                    y2: child.topY - verticalConnectorLength,
                    persons: [validChildren[0]]
                });
            }
            
            // 子に垂直線を引く
            connectors.push({
                type: 'parent-child-vertical',
                x1: child.centerX,
                y1: child.topY - verticalConnectorLength,
                x2: child.centerX,
                y2: child.topY,
                persons: [validChildren[0]]
            });
        } 
        // 子ノードが複数の場合
        else {
            // 子ノードのX座標でソート
            childrenCenters.sort((a, b) => a.centerX - b.centerX);
            
            // 左端と右端の子の中間位置
            const leftmostChildX = childrenCenters[0].centerX;
            const rightmostChildX = childrenCenters[childrenCenters.length - 1].centerX;
            const childrenMiddleX = (leftmostChildX + rightmostChildX) / 2;
            
            // 親からの最初の垂直線
            const commonVerticalY = Math.min(...childrenCenters.map(c => c.topY)) - verticalConnectorLength;
            
            connectors.push({
                type: 'parent-child-vertical',
                x1: parentX,
                y1: parentY,
                x2: parentX,
                y2: commonVerticalY,
                persons: validChildren
            });
            
            // 親から子集合の中央への水平線（必要な場合）
            if (Math.abs(parentX - childrenMiddleX) > 1) {
                connectors.push({
                    type: 'parent-child-horizontal',
                    x1: parentX,
                    y1: commonVerticalY,
                    x2: childrenMiddleX,
                    y2: commonVerticalY,
                    persons: validChildren
                });
            }
            
            // 左端と右端を繋ぐ水平バー
            connectors.push({
                type: 'sibling-horizontal',
                x1: leftmostChildX,
                y1: commonVerticalY,
                x2: rightmostChildX,
                y2: commonVerticalY,
                persons: validChildren
            });
            
            // 各子ノードへの垂直線
            for (const child of childrenCenters) {
                connectors.push({
                    type: 'parent-child-vertical',
                    x1: child.centerX,
                    y1: commonVerticalY,
                    x2: child.centerX,
                    y2: child.topY,
                    persons: [child.id]
                });
            }
        }
    }
}
