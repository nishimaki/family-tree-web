import React, { useState, useEffect, useRef } from 'react';
import Gender from '../constants/Gender';
import './FamilyTreeSVG.css';

/**
 * SVGベースの家系図表示コンポーネント
 * @param {Object} props - プロパティ
 * @param {Object} props.hierarchyData - 家系図の階層構造データ
 * @param {Function} props.onPersonSelect - 人物選択時のコールバック関数
 */
function FamilyTreeSVG({ hierarchyData, onPersonSelect }) {
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState("0 0 1000 600");
  const [nodePositions, setNodePositions] = useState({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  // 定数
  const NODE_WIDTH = 120;
  const NODE_HEIGHT = 60;
  const LEVEL_HEIGHT = 150;
  const SIBLING_SPACING = 40;
  const SPOUSE_SPACING = 30;
  
  // 性別によるノードの色を決定
  const getGenderColor = (gender) => {
    switch (gender) {
      case Gender.MALE:
        return '#add8e6'; // 水色
      case Gender.FEMALE:
        return '#ffb6c1'; // ピンク色
      default:
        return '#d3d3d3'; // グレー
    }
  };
  
  // 日付をフォーマット
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-').slice(0, 2).join('-'); // YYYY-MM形式に
  };
  
  // 階層データからノード位置を計算
  useEffect(() => {
    if (!hierarchyData) return;
    
    // レイアウト計算用の関数
    const calculateLayout = (node, level = 0, offset = 0, positions = {}) => {
      if (!node) return { positions, width: 0 };
      
      // 現在のノードの幅計算（子ノードの合計幅かノード自体の幅の大きい方）
      let nodeWidth = NODE_WIDTH;
      let totalChildrenWidth = 0;
      
      // 子ノードがいる場合は再帰的に配置を計算
      if (node.children && node.children.length > 0) {
        let childOffset = offset;
        
        // 子ノードごとに位置を計算
        node.children.forEach((child) => {
          const result = calculateLayout(child, level + 1, childOffset, positions);
          positions = result.positions;
          childOffset += result.width + SIBLING_SPACING;
          totalChildrenWidth += result.width;
        });
        
        // 子ノード間のスペースを追加
        if (node.children.length > 1) {
          totalChildrenWidth += SIBLING_SPACING * (node.children.length - 1);
        }
      }
      
      // ノードの幅を子ノードの合計幅か単一ノード幅の大きい方に設定
      const finalWidth = Math.max(nodeWidth, totalChildrenWidth);
      
      // 現在のノードの中央位置を計算
      const centerX = offset + finalWidth / 2;
      
      // 現在のノードの位置を保存
      positions[node.id] = {
        x: centerX - NODE_WIDTH / 2, // 中央揃えのための調整
        y: level * LEVEL_HEIGHT,
        width: NODE_WIDTH,
        height: NODE_HEIGHT
      };
      
      // 配偶者がいる場合は配偶者の位置も計算
      if (node.spouses && node.spouses.length > 0) {
        node.spouses.forEach((spouse, index) => {
          positions[spouse.id] = {
            x: centerX + NODE_WIDTH / 2 + SPOUSE_SPACING + (index * (NODE_WIDTH + SPOUSE_SPACING)),
            y: level * LEVEL_HEIGHT,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            isSpouse: true,
            spouseOf: node.id
          };
        });
      }
      
      return { positions, width: finalWidth };
    };
    
    // レイアウト計算を実行
    const { positions } = calculateLayout(hierarchyData);
    setNodePositions(positions);
    
    // SVGのビューボックスを更新
    const maxX = Math.max(...Object.values(positions).map(pos => pos.x + NODE_WIDTH)) + 50;
    const maxY = Math.max(...Object.values(positions).map(pos => pos.y + NODE_HEIGHT)) + 50;
    setViewBox(`0 0 ${maxX} ${maxY}`);
  }, [hierarchyData]);
  
  // ズーム処理
  const handleZoom = (direction) => {
    if (direction === 'in') {
      setZoom(prev => Math.min(prev * 1.2, 3)); // 最大3倍まで
    } else {
      setZoom(prev => Math.max(prev / 1.2, 0.5)); // 最小0.5倍まで
    }
  };
  
  // パン処理（SVG内でのドラッグによる移動）
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // ノードクリック処理
  const handleNodeClick = (person) => {
    setSelectedPerson(person);
    if (onPersonSelect) {
      onPersonSelect(person);
    }
  };
  
  // SVGノードの描画関数
  const renderNode = (node, position) => {
    if (!node || !position) return null;
    
    const { x, y, width, height } = position;
    const bgColor = getGenderColor(node.gender);
    
    return (
      <g 
        key={node.id}
        onClick={() => handleNodeClick(node)}
        className="family-tree-node"
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={5}
          ry={5}
          fill={bgColor}
          stroke="#333"
          strokeWidth={1}
        />
        <text
          x={x + width / 2}
          y={y + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#333"
          fontSize="12"
          fontWeight="bold"
        >
          {node.name}
        </text>
        <text
          x={x + width / 2}
          y={y + 40}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#333"
          fontSize="10"
        >
          {formatDate(node.birth_date)}
          {node.death_date && ` - ${formatDate(node.death_date)}`}
        </text>
      </g>
    );
  };
  
  // 親子関係の線を描画する関数
  const renderParentChildLines = () => {
    if (!hierarchyData) return null;
    
    const lines = [];
    
    const renderLines = (node) => {
      if (!node) return;
      
      const nodePos = nodePositions[node.id];
      if (!nodePos) return;
      
      // 子ノードがある場合、親子関係の線を描画
      if (node.children && node.children.length > 0) {
        // 親の位置（中央下部）
        const parentX = nodePos.x + nodePos.width / 2;
        const parentY = nodePos.y + nodePos.height;
        
        // 親から下に向かって垂直線を引く
        const verticalLineY = parentY + LEVEL_HEIGHT / 3;
        lines.push(
          <line
            key={`vline-${node.id}`}
            x1={parentX}
            y1={parentY}
            x2={parentX}
            y2={verticalLineY}
            stroke="#333"
            strokeWidth={1}
          />
        );
        
        // 子ノードの位置を基に水平線を引く
        const childrenXs = node.children.map(child => {
          const childPos = nodePositions[child.id];
          return childPos ? childPos.x + childPos.width / 2 : null;
        }).filter(Boolean);
        
        if (childrenXs.length > 0) {
          const leftmostX = Math.min(...childrenXs);
          const rightmostX = Math.max(...childrenXs);
          
          // 子ノードを結ぶ水平線
          lines.push(
            <line
              key={`hline-${node.id}`}
              x1={leftmostX}
              y1={verticalLineY}
              x2={rightmostX}
              y2={verticalLineY}
              stroke="#333"
              strokeWidth={1}
            />
          );
          
          // 各子ノードに垂直線を引く
          node.children.forEach(child => {
            const childPos = nodePositions[child.id];
            if (childPos) {
              const childX = childPos.x + childPos.width / 2;
              const childY = childPos.y;
              
              lines.push(
                <line
                  key={`vline-child-${child.id}`}
                  x1={childX}
                  y1={verticalLineY}
                  x2={childX}
                  y2={childY}
                  stroke="#333"
                  strokeWidth={1}
                />
              );
            }
          });
        }
        
        // 子ノードを再帰的に処理
        node.children.forEach(renderLines);
      }
    };
    
    renderLines(hierarchyData);
    return lines;
  };
  
  // 配偶者関係の線を描画する関数
  const renderSpouseLines = () => {
    if (!hierarchyData) return null;
    
    const lines = [];
    
    // 配偶者間の線を描画する関数
    const addSpouseLines = (node) => {
      if (!node) return;
      
      const nodePos = nodePositions[node.id];
      if (!nodePos) return;
      
      // 配偶者がいる場合は水平線を引く
      if (node.spouses && node.spouses.length > 0) {
        node.spouses.forEach(spouse => {
          const spousePos = nodePositions[spouse.id];
          if (spousePos) {
            // 中央位置を計算
            const x1 = nodePos.x + nodePos.width;
            const x2 = spousePos.x;
            const y = nodePos.y + nodePos.height / 2;
            
            lines.push(
              <line
                key={`spouse-${node.id}-${spouse.id}`}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#333"
                strokeWidth={1}
                strokeDasharray="5,5"
              />
            );
          }
        });
      }
      
      // 子ノードを再帰的に処理
      if (node.children) {
        node.children.forEach(addSpouseLines);
      }
    };
    
    addSpouseLines(hierarchyData);
    return lines;
  };
  
  // 人物の詳細情報ポップアップを表示する関数
  const renderPersonDetail = () => {
    if (!selectedPerson) return null;
    
    const pos = nodePositions[selectedPerson.id];
    if (!pos) return null;
    
    const detailX = pos.x + pos.width + 10;
    const detailY = pos.y;
    
    return (
      <g className="person-detail">
        <rect
          x={detailX}
          y={detailY}
          width={200}
          height={120}
          fill="white"
          stroke="#333"
          strokeWidth={1}
          rx={5}
          ry={5}
        />
        <text x={detailX + 10} y={detailY + 20} fontSize="12" fontWeight="bold">
          {selectedPerson.name}
        </text>
        <text x={detailX + 10} y={detailY + 40} fontSize="11">
          生年月日: {selectedPerson.birth_date || '不明'}
        </text>
        <text x={detailX + 10} y={detailY + 60} fontSize="11">
          性別: {selectedPerson.gender === Gender.MALE ? '男性' : selectedPerson.gender === Gender.FEMALE ? '女性' : '不明'}
        </text>
        {selectedPerson.death_date && (
          <text x={detailX + 10} y={detailY + 80} fontSize="11">
            死亡日: {selectedPerson.death_date}
          </text>
        )}
        <text x={detailX + 10} y={detailY + (selectedPerson.death_date ? 100 : 80)} fontSize="11">
          配偶者: {selectedPerson.spouses && selectedPerson.spouses.length > 0 
            ? selectedPerson.spouses.map(s => s.name).join(', ') 
            : 'なし'}
        </text>
      </g>
    );
  };
  
  // 再帰的にノードをレンダリング
  const renderNodes = () => {
    if (!hierarchyData) return null;
    
    const nodes = [];
    
    const processNode = (node) => {
      if (!node) return;
      
      // 現在のノードを描画
      const pos = nodePositions[node.id];
      if (pos) {
        nodes.push(
          <g key={node.id}>
            {renderNode(node, pos)}
          </g>
        );
      }
      
      // 配偶者を描画
      if (node.spouses) {
        node.spouses.forEach(spouse => {
          const spousePos = nodePositions[spouse.id];
          if (spousePos) {
            nodes.push(
              <g key={spouse.id}>
                {renderNode(spouse, spousePos)}
              </g>
            );
          }
        });
      }
      
      // 子ノードを再帰的に処理
      if (node.children) {
        node.children.forEach(processNode);
      }
    };
    
    processNode(hierarchyData);
    return nodes;
  };
  
  // コントロールパネルの描画
  const renderControls = () => {
    return (
      <div className="family-tree-controls">
        <div className="zoom-controls">
          <button onClick={() => handleZoom('in')} className="zoom-button">
            +
          </button>
          <button onClick={() => handleZoom('out')} className="zoom-button">
            -
          </button>
        </div>
        <div className="info-text">
          ドラッグして移動、クリックで人物選択
        </div>
      </div>
    );
  };
  
  // 家系図がない場合のメッセージ
  if (!hierarchyData) {
    return (
      <div className="family-tree-svg">
        <p>表示するデータがありません。家系図を読み込むか、別のルート人物を選択してください。</p>
      </div>
    );
  }
  
  // SVGレンダリング
  return (
    <div className="family-tree-svg">
      {renderControls()}
      <div className="svg-container">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
            {/* 親子関係の線 */}
            {renderParentChildLines()}
            
            {/* 配偶者関係の線 */}
            {renderSpouseLines()}
            
            {/* ノード */}
            {renderNodes()}
            
            {/* 選択された人物の詳細 */}
            {renderPersonDetail()}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default FamilyTreeSVG;