import React from 'react';
import Gender from '../constants/Gender';

/**
 * 家系図のグラフィカル表示コンポーネント
 * @param {Object} props - プロパティ
 * @param {Object} props.hierarchyData - 家系図の階層構造データ
 * @param {Function} props.onPersonSelect - 人物選択時のコールバック関数
 */
function FamilyTreeGraph({ hierarchyData, onPersonSelect }) {
  // 階層データがない場合
  if (!hierarchyData) {
    return (
      <div className="family-tree-graph">
        <p>表示するデータがありません。家系図を読み込むか、別のルート人物を選択してください。</p>
      </div>
    );
  }

  // 性別に対応するラベルを取得
  const getGenderLabel = (gender) => {
    switch (gender) {
      case Gender.MALE:
        return '男性';
      case Gender.FEMALE:
        return '女性';
      default:
        return '不明';
    }
  };

  // 日付を表示用にフォーマット
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr;
  };

  // 人物ノードをレンダリング
  const renderPersonNode = (person) => {
    return (
      <div 
        key={person.id} 
        className="family-tree-node"
        onClick={() => onPersonSelect(person)}
      >
        <h3>{person.name}</h3>
        <p>性別: {getGenderLabel(person.gender)}</p>
        <p>生年月日: {formatDate(person.birth_date)}</p>
        
        {/* 配偶者情報の表示 */}
        {person.spouses && person.spouses.length > 0 && (
          <div>
            {person.spouses.map(spouse => (
              <div key={spouse.id} className="family-tree-spouse">
                配偶者: {spouse.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 家系図ツリーを再帰的にレンダリング
  const renderFamilyTree = (node) => {
    if (!node) return null;

    return (
      <div key={node.id} className="family-tree">
        {/* 現在の人物 */}
        <div className="family-tree-level">
          {renderPersonNode(node)}
        </div>

        {/* 子孫 */}
        {node.children && node.children.length > 0 && (
          <div className="family-tree-children">
            {node.children.map(child => renderFamilyTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="family-tree-graph">
      <h2>家系図</h2>
      {renderFamilyTree(hierarchyData)}
    </div>
  );
}

export default FamilyTreeGraph;