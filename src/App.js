import React, { useState } from 'react';
import PersonList from './components/PersonList';
import FileManager from './services/FileManager';
import './App.css';

function App() {
  const [familyTree, setFamilyTree] = useState(null);
  const [persons, setPersons] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
    // 将来的に詳細表示など拡張予定
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
        
        <section className="person-section">
          <PersonList persons={persons} onPersonSelect={handlePersonSelect} />
        </section>
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 家系図アプリケーション</p>
      </footer>
    </div>
  );
}

export default App;
