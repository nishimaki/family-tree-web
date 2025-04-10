import React, { useState } from 'react';
import PersonList from './components/PersonList';
import FamilyTreeGraph from './components/FamilyTreeGraph';
import FileManager from './services/FileManager';
import './App.css';

function App() {
  const [familyTree, setFamilyTree] = useState(null);
  const [persons, setPersons] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' または 'tree'
  const [hierarchyData, setHierarchyData] = useState(null);
  const [selectedRootId, setSelectedRootId] = useState(null);
  
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
    console.log('Selected person:', person);
    
    // 選択された人物をルートにした家系図を表示
    if (familyTree && person.id) {
      setSelectedRootId(person.id);
      setHierarchyData(familyTree.getHierarchyData(person.id));
      // 家系図タブに切り替え
      setActiveTab('tree');
    }
  };
  
  /**
   * タブ切り替えハンドラ
   * @param {string} tabName 
   */
  const switchTab = (tabName) => {
    setActiveTab(tabName);
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>家系図アプリケーション</h1>
      </header>
      
      <main className="app-main">
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
            </div>
          )}
        </section>
        
        {familyTree && (
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => switchTab('list')}
            >
              人物一覧
            </div>
            <div 
              className={`tab ${activeTab === 'tree' ? 'active' : ''}`}
              onClick={() => switchTab('tree')}
            >
              家系図表示
            </div>
          </div>
        )}
        
        {activeTab === 'list' && (
          <section className="person-section">
            <PersonList persons={persons} onPersonSelect={handlePersonSelect} />
          </section>
        )}
        
        {activeTab === 'tree' && (
          <section className="person-section">
            <FamilyTreeGraph 
              hierarchyData={hierarchyData} 
              onPersonSelect={handlePersonSelect} 
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