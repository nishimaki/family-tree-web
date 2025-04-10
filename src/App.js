import React, { useState } from 'react';
import PersonList from './components/PersonList';
import PersonEditor from './components/PersonEditor';
import FamilyTreeGraph from './components/FamilyTreeGraph';
import FamilyTreeSVG from './components/FamilyTreeSVG';
import FileManager from './services/FileManager';
import './App.css';

function App() {
  const [familyTree, setFamilyTree] = useState(null);
  const [persons, setPersons] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [hierarchyData, setHierarchyData] = useState(null);
  const [selectedRootId, setSelectedRootId] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [treeViewMode, setTreeViewMode] = useState('svg'); // 'simple' または 'svg'
  
  /**
   * ファイル選択イベントハンドラ
   * @param {Event} event 
   */
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      setError(null);
      setWarnings([]);
      
      const result = await FileManager.loadFamilyTree(file);
      setFamilyTree(result.familyTree);
      
      // 人物一覧データを作成
      const personList = Object.values(result.familyTree.getAllPersons());
      setPersons(personList);
      
      if (result.warnings.length > 0) {
        setWarnings(result.warnings);
      }
      
      // ルートノードを取得し、階層データを初期化
      const rootNodes = result.familyTree.getRootNodes();
      if (rootNodes.length > 0) {
        setSelectedRootId(rootNodes[0]);
        setHierarchyData(result.familyTree.getHierarchyData(rootNodes[0]));
      }
      
      setLoading(false);
      setShowFileMenu(false);
      setHasChanges(false);
      setActiveTab('list'); // ファイル読み込み後に人物一覧画面を表示
    } catch (err) {
      setLoading(false);
      setError(err.message);
      console.error('ファイル読み込みエラー:', err);
    }
  };
  
  /**
   * 人物選択イベントハンドラ
   * @param {Object} person 
   */
  const handlePersonSelect = (person) => {
    if (familyTree && person.id) {
      setSelectedRootId(person.id);
      setHierarchyData(familyTree.getHierarchyData(person.id));
      setActiveTab('tree');
      setShowFileMenu(false);
    }
  };
  
  const handlePersonEdit = (person) => {
    setEditingPerson(person);
    setActiveTab('edit');
    setShowFileMenu(false);
  };

  const handlePersonSave = (editedPerson) => {
    if (familyTree) {
      familyTree.updatePerson(editedPerson.id, editedPerson);
      const updatedPersons = Object.values(familyTree.getAllPersons());
      setPersons(updatedPersons);
      setEditingPerson(null);
      setActiveTab('list');
      setHasChanges(true);
      
      // 現在選択されているルートノードが更新された場合、階層データも更新
      if (selectedRootId === editedPerson.id) {
        setHierarchyData(familyTree.getHierarchyData(selectedRootId));
      }
    }
  };

  const handlePersonEditCancel = () => {
    setEditingPerson(null);
    setActiveTab('list');
  };

  const handleSaveFile = async () => {
    if (familyTree && hasChanges) {
      try {
        setLoading(true);
        await FileManager.saveFamilyTree(familyTree, familyTree.title || 'family_tree');
        setHasChanges(false);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  };
  
  /**
   * 表示モード切替ハンドラ
   */
  const toggleTreeViewMode = () => {
    setTreeViewMode(prevMode => prevMode === 'simple' ? 'svg' : 'simple');
  };
  
  /**
   * タブ切り替えハンドラ
   * @param {string} tabName 
   */
  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setShowFileMenu(false);
  };
  
  const toggleFileMenu = () => {
    setShowFileMenu(!showFileMenu);
    if (!showFileMenu) {
      // ファイルメニューを開く際にタブを非表示にする
      setActiveTab(null);
    } else if (familyTree) {
      // ファイルメニューを閉じる際に、家系図データがあれば人物一覧画面を表示
      setActiveTab('list');
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>家系図アプリケーション</h1>
        <nav className="main-nav">
          <button 
            className={`nav-button ${showFileMenu ? 'active' : ''}`}
            onClick={toggleFileMenu}
          >
            ファイル操作
          </button>
          {familyTree && (
            <>
              <button 
                className={`nav-button ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => switchTab('list')}
              >
                人物一覧
              </button>
              <button 
                className={`nav-button ${activeTab === 'tree' ? 'active' : ''}`}
                onClick={() => switchTab('tree')}
              >
                家系図表示
              </button>
            </>
          )}
        </nav>
      </header>
      
      <main className="app-main">
        {showFileMenu && (
          <section className="file-section">
            <h2>ファイル操作</h2>
            <div className="file-input">
              <label htmlFor="file-upload">JSONファイルを選択してください:</label>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            
            {loading && (
              <div className="loading">
                <p>読み込み中...</p>
              </div>
            )}
            
            {error && (
              <div className="error">
                <p>エラー: {error}</p>
              </div>
            )}
            
            {warnings.length > 0 && (
              <div className="warnings">
                <h3>警告:</h3>
                <ul>
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {familyTree && (
              <div className="family-info">
                <h3>家系図情報</h3>
                <p><strong>タイトル:</strong> {familyTree.title || "(なし)"}</p>
                <p><strong>説明:</strong> {familyTree.description || "(なし)"}</p>
                <p><strong>人物数:</strong> {Object.keys(familyTree.getAllPersons()).length}</p>
                {hasChanges && (
                  <button 
                    className="save-button"
                    onClick={handleSaveFile}
                    disabled={loading}
                  >
                    変更を保存
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        
        {!familyTree && !showFileMenu && (
          <div className="welcome-section">
            <h2>ようこそ</h2>
            <p>家系図アプリケーションへようこそ。</p>
            <p>「ファイル操作」ボタンをクリックして、JSONファイルを読み込んでください。</p>
          </div>
        )}
        
        {familyTree && activeTab === 'list' && (
          <section className="person-section">
            <PersonList 
              persons={persons} 
              onPersonSelect={handlePersonSelect}
              onPersonEdit={handlePersonEdit}
            />
          </section>
        )}
        
        {familyTree && activeTab === 'tree' && (
          <section className="person-section">
            <div className="tree-view-controls">
              <button 
                className="view-toggle-button"
                onClick={toggleTreeViewMode}
              >
                表示モード切替: {treeViewMode === 'simple' ? 'シンプル' : 'グラフィカル'}
              </button>
            </div>
            
            {treeViewMode === 'simple' ? (
              <FamilyTreeGraph 
                hierarchyData={hierarchyData} 
                onPersonSelect={handlePersonSelect} 
              />
            ) : (
              <FamilyTreeSVG 
                hierarchyData={hierarchyData} 
                onPersonSelect={handlePersonSelect} 
              />
            )}
          </section>
        )}

        {familyTree && activeTab === 'edit' && editingPerson && (
          <section className="person-section">
            <PersonEditor
              person={editingPerson}
              persons={persons}
              familyTree={familyTree}
              onSave={handlePersonSave}
              onCancel={handlePersonEditCancel}
            />
          </section>
        )}
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 家系図アプリケーション</p>
      </footer>
    </div>
  );
}

export default App;