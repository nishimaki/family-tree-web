/**
 * FamilyTreeViewコンポーネント - 家系図全体を表示するコンポーネント
 * 人物ノードと関係線を配置し、パン・ズーム操作を管理
 */
class FamilyTreeView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      // ノードの実際のサイズを追跡
      nodeWidths: {},
      nodeHeights: {},
      // レイアウト情報
      layout: {
        nodePositions: {},
        connectorLines: []
      },
      // ズーム・パン
      scale: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    };
    
    // DOM参照
    this.containerRef = React.createRef();
    this.nodeRefs = {};
    
    // バインド
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.measureNodeSizes = this.measureNodeSizes.bind(this);
    this.calculateLayout = this.calculateLayout.bind(this);
  }
  
  componentDidMount() {
    // マウントした時点でレイアウト計算
    this.calculateInitialLayout();
    
    // イベントリスナー追加
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  }
  
  componentWillUnmount() {
    // イベントリスナー削除
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
  
  componentDidUpdate(prevProps) {
    // 家系図データや選択ノードが変わったら再計算
    const familyTreeChanged = prevProps.familyTree !== this.props.familyTree;
    const selectedPersonChanged = prevProps.selectedPersonId !== this.props.selectedPersonId;
    
    if (familyTreeChanged) {
      this.calculateInitialLayout();
    } else if (selectedPersonChanged) {
      this.focusOnSelectedPerson();
    }
  }
  
  /**
   * 初期レイアウトを計算
   */
  calculateInitialLayout() {
    // 初期の推定サイズでレイアウト計算
    this.calculateLayout();
    
    // ノードがレンダリングされたら実際のサイズを測定
    setTimeout(() => {
      this.measureNodeSizes();
      // 実際のサイズに基づいてレイアウトを再計算
      this.calculateLayout();
      // 選択中の人物にフォーカス
      this.focusOnSelectedPerson();
    }, 0);
  }
  
  /**
   * ノードの実際のサイズを測定
   */
  measureNodeSizes() {
    const { familyTree } = this.props;
    if (!familyTree) return;
    
    const nodeWidths = {};
    const nodeHeights = {};
    const allPersons = familyTree.getAllPersons();
    
    Object.keys(allPersons).forEach(personId => {
      const nodeRef = this.nodeRefs[personId];
      if (nodeRef && nodeRef.current) {
        const node = nodeRef.current;
        nodeWidths[personId] = node.offsetWidth;
        nodeHeights[personId] = node.offsetHeight;
      }
    });
    
    this.setState({ nodeWidths, nodeHeights });
  }
  
  /**
   * レイアウトを計算
   */
  calculateLayout() {
    const { familyTree } = this.props;
    const { nodeWidths, nodeHeights } = this.state;
    
    if (!familyTree) return;
    
    // レイアウトを計算
    const layout = LayoutCalculator.calculateFamilyTreeLayout(
      familyTree,
      nodeWidths,
      nodeHeights
    );
    
    this.setState({ layout });
  }
  
  /**
   * 選択中の人物にフォーカス
   */
  focusOnSelectedPerson() {
    const { selectedPersonId } = this.props;
    const { layout, nodeWidths, nodeHeights } = this.state;
    
    if (!selectedPersonId || !layout.nodePositions[selectedPersonId]) return;
    
    const container = this.containerRef.current;
    if (!container) return;
    
    // 選択中ノードの位置とサイズ
    const position = layout.nodePositions[selectedPersonId];
    const width = nodeWidths[selectedPersonId] || LayoutConstants.NODE_WIDTH_ESTIMATE;
    const height = nodeHeights[selectedPersonId] || LayoutConstants.NODE_HEIGHT_ESTIMATE;
    
    // コンテナの中央に配置するための変換を計算
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const centerX = position.x + width / 2;
    const centerY = position.y + height / 2;
    
    const translateX = containerWidth / 2 - centerX;
    const translateY = containerHeight / 2 - centerY;
    
    this.setState({ translateX, translateY });
  }
  
  /**
   * ノードクリック時のハンドラー
   * @param {string} personId - クリックされた人物のID
   */
  handleNodeClick(personId) {
    if (this.props.onPersonSelect) {
      this.props.onPersonSelect(personId);
    }
  }
  
  /**
   * マウスダウン時のハンドラー
   * @param {MouseEvent} event - マウスイベント
   */
  handleMouseDown(event) {
    if (event.button !== 0) return; // 左クリックのみ
    
    this.setState({
      isDragging: true,
      lastMouseX: event.clientX,
      lastMouseY: event.clientY
    });
    
    event.preventDefault();
  }
  
  /**
   * マウス移動時のハンドラー
   * @param {MouseEvent} event - マウスイベント
   */
  handleMouseMove(event) {
    if (!this.state.isDragging) return;
    
    const dx = event.clientX - this.state.lastMouseX;
    const dy = event.clientY - this.state.lastMouseY;
    
    this.setState({
      translateX: this.state.translateX + dx,
      translateY: this.state.translateY + dy,
      lastMouseX: event.clientX,
      lastMouseY: event.clientY
    });
  }
  
  /**
   * マウスアップ時のハンドラー
   */
  handleMouseUp() {
    this.setState({ isDragging: false });
  }
  
  /**
   * ホイール操作時のハンドラー
   * @param {WheelEvent} event - ホイールイベント
   */
  handleWheel(event) {
    event.preventDefault();
    
    // スケール変更量
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    const newScale = Math.max(0.1, Math.min(2.0, this.state.scale + delta));
    
    // マウス位置を中心にズーム
    const container = this.containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // マウス位置をズーム中心に
    const scaleRatio = newScale / this.state.scale;
    const translateX = mouseX - scaleRatio * (mouseX - this.state.translateX);
    const translateY = mouseY - scaleRatio * (mouseY - this.state.translateY);
    
    this.setState({ scale: newScale, translateX, translateY });
  }
  
  render() {
    const { familyTree, selectedPersonId } = this.props;
    const { layout, scale, translateX, translateY } = this.state;
    
    if (!familyTree) {
      return <div className="family-tree-view-empty">家系図データがありません。</div>;
    }
    
    const allPersons = familyTree.getAllPersons();
    const personIds = Object.keys(allPersons);
    
    if (personIds.length === 0) {
      return <div className="family-tree-view-empty">人物データがありません。</div>;
    }
    
    // ノードのスタイル（位置指定）
    const getNodeStyle = (personId) => {
      const position = layout.nodePositions[personId] || { x: 0, y: 0 };
      return {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`
      };
    };
    
    // 変換スタイル（ズーム・パン）
    const transformStyle = {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: '0 0'
    };
    
    return (
      <div 
        ref={this.containerRef}
        className="family-tree-view"
        onMouseDown={this.handleMouseDown}
        onWheel={this.handleWheel}
      >
        <div className="family-tree-view-content" style={transformStyle}>
          {/* 人物ノード */}
          {personIds.map(personId => {
            // このレンダリングサイクルで使用するref（既存のものを使うか新しいものを作成）
            if (!this.nodeRefs[personId]) {
              this.nodeRefs[personId] = React.createRef();
            }
            
            return (
              <div 
                key={`node-${personId}`}
                ref={this.nodeRefs[personId]}
                style={getNodeStyle(personId)}
              >
                <PersonNode 
                  person={allPersons[personId]}
                  isSelected={personId === selectedPersonId}
                  onClick={this.handleNodeClick}
                />
              </div>
            );
          })}
          
          {/* 関係線 */}
          {layout.connectorLines.map((connector, index) => (
            <RelationshipLine 
              key={`line-${index}`}
              connector={connector}
            />
          ))}
        </div>
      </div>
    );
  }
}

// デフォルトプロパティ
FamilyTreeView.defaultProps = {
  familyTree: null,
  selectedPersonId: null,
  onPersonSelect: null
};
