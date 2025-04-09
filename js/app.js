/**
 * メインアプリケーションコンポーネント
 * アプリケーション全体の状態管理とコンポーネントの連携を担当
 */

class FamilyTreeApp extends React.Component {
  constructor(props) {
    super(props);
    
    // 家系図コントローラーの初期化
    this.familyTreeController = new FamilyTreeController();
    this.fileController = new FileController(this.familyTreeController);
    
    // コントローラーのコールバック登録
    this.familyTreeController.registerCallback('onFamilyTreeUpdated', this.handleFamilyTreeUpdated.bind(this));
    this.familyTreeController.registerCallback('onPersonSelected', this.handlePersonSelected.bind(this));
    this.familyTreeController.registerCallback('onError', this.handleError.bind(this));
    
    // 初期状態
    this.state = {
      familyTree: this.familyTreeController.familyTree,
      selectedPersonId: null,
      selectedPerson: null,
      errorMessage: null
    };
  }
  
  componentDidMount() {
    // サンプルデータを読み込む
    this.familyTreeController.loadSampleData();
  }
  
  /**
   * 家系図更新時のハンドラー
   * @param {FamilyTree} familyTree - 更新された家系図
   */
  handleFamilyTreeUpdated(familyTree) {
    this.setState({ familyTree });
  }
  
  /**
   * 人物選択時のハンドラー
   * @param {string} personId - 選択された人物のID
   * @param {Person} person - 選択された人物
   */
  handlePersonSelected(personId, person) {
    this.setState({
      selectedPersonId: personId,
      selectedPerson: person
    });
  }
  
  /**
   * エラー発生時のハンドラー
   * @param {string} message - エラーメッセージ
   */
  handleError(message) {
    this.setState({ errorMessage: message });
    
    // エラーメッセージを一定時間後に消去
    setTimeout(() => {
      this.setState({ errorMessage: null });
    }, 5000);
  }
  
  /**
   * 人物クリック時のハンドラー
   * @param {string} personId - クリックされた人物のID
   */
  handlePersonClick(personId) {
    this.familyTreeController.selectPerson(personId);
  }
  
  render() {
    const { familyTree, selectedPersonId, selectedPerson, errorMessage } = this.state;
    
    return (
      <div className="family-tree-app">
        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        {/* 家系図表示エリア */}
        <div className="family-tree-view-container">
          <FamilyTreeView
            familyTree={familyTree}
            selectedPersonId={selectedPersonId}
            onPersonSelect={this.handlePersonClick.bind(this)}
          />
        </div>
        
        {/* 選択中の人物情報表示 */}
        {selectedPerson && (
          <div className="selected-person-info">
            <h3>{selectedPerson.name}</h3>
            <p>性別: {Gender.getLabel(selectedPerson.gender)}</p>
            {selectedPerson.birth_date && <p>生年月日: {selectedPerson.birth_date}</p>}
            {selectedPerson.death_date && <p>死亡日: {selectedPerson.death_date}</p>}
            {selectedPerson.note && <p>メモ: {selectedPerson.note}</p>}
          </div>
        )}
      </div>
    );
  }
}

// DOMにレンダリング
ReactDOM.render(
  <FamilyTreeApp />,
  document.getElementById('family-tree-app')
);
