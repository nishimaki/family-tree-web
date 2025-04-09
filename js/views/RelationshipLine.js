/**
 * RelationshipLineコンポーネント - 家系図の関係線を表示するコンポーネント
 * 夫婦間、親子間、兄弟姉妹間の接続線を描画
 */
class RelationshipLine extends React.Component {
  /**
   * 線のタイプに応じたCSSクラスを返す
   * @param {string} type - 線のタイプ
   * @returns {string} - CSSクラス名
   */
  getLineClass(type) {
    let baseClass = 'relationship-line';
    
    switch (type) {
      case 'spouse':
        return `${baseClass} spouse-line`;
      case 'parent-child-vertical':
        return `${baseClass} parent-child-line-vertical`;
      case 'parent-child-horizontal':
      case 'sibling-horizontal':
        return `${baseClass} parent-child-line-horizontal`;
      default:
        return baseClass;
    }
  }
  
  render() {
    const { connector } = this.props;
    const lineClass = this.getLineClass(connector.type);
    
    // 線の長さと位置を計算（開始点と終了点に基づく）
    let style = {};
    
    if (connector.type === 'parent-child-vertical' || connector.type === 'parent-child-horizontal' || 
        connector.type === 'sibling-horizontal') {
      // 垂直線
      if (connector.y1 !== connector.y2) {
        const top = Math.min(connector.y1, connector.y2);
        const height = Math.abs(connector.y2 - connector.y1);
        const left = connector.x1;
        
        style = {
          top: `${top}px`,
          left: `${left}px`,
          height: `${height}px`
        };
      }
      // 水平線
      else {
        const top = connector.y1;
        const left = Math.min(connector.x1, connector.x2);
        const width = Math.abs(connector.x2 - connector.x1);
        
        style = {
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`
        };
      }
    }
    // 配偶者線
    else if (connector.type === 'spouse') {
      const top = connector.y1;
      const left = connector.x1;
      const width = connector.x2 - connector.x1;
      
      style = {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`
      };
    }
    
    return (
      <div className={lineClass} style={style}></div>
    );
  }
}

// デフォルトプロパティ
RelationshipLine.defaultProps = {
  connector: {
    type: 'parent-child-vertical',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    persons: []
  }
};
