import React from 'react';
import Gender from '../constants/Gender';

/**
 * 人物一覧コンポーネント
 * @param {Object} props - プロパティ
 * @param {Array} props.persons - 表示する人物オブジェクトの配列
 * @param {Function} props.onPersonSelect - 人物選択時のコールバック関数
 */
function PersonList({ persons, onPersonSelect }) {
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

  return (
    <div className="person-list">
      <h2>人物一覧</h2>
      
      {persons.length === 0 ? (
        <p>人物データがありません。JSONファイルを読み込んでください。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名前</th>
              <th>性別</th>
              <th>生年月日</th>
              <th>死亡日</th>
            </tr>
          </thead>
          <tbody>
            {persons.map(person => (
              <tr key={person.id} onClick={() => onPersonSelect(person)}>
                <td>{person.id}</td>
                <td>{person.name}</td>
                <td>{getGenderLabel(person.gender)}</td>
                <td>{formatDate(person.birth_date)}</td>
                <td>{formatDate(person.death_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PersonList;
