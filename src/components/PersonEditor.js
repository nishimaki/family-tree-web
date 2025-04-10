import React, { useState, useEffect } from 'react';
import Gender from '../constants/Gender';

/**
 * 人物編集コンポーネント
 * @param {Object} props - プロパティ
 * @param {Object} props.person - 編集する人物オブジェクト
 * @param {Function} props.onSave - 保存時のコールバック関数
 * @param {Function} props.onCancel - キャンセル時のコールバック関数
 */
function PersonEditor({ person, onSave, onCancel }) {
  const [editedPerson, setEditedPerson] = useState({ ...person });

  useEffect(() => {
    setEditedPerson({ ...person });
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedPerson);
  };

  return (
    <div className="person-editor">
      <h2>人物情報の編集</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">名前:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={editedPerson.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">性別:</label>
          <select
            id="gender"
            name="gender"
            value={editedPerson.gender}
            onChange={handleChange}
          >
            <option value={Gender.MALE}>男性</option>
            <option value={Gender.FEMALE}>女性</option>
            <option value={Gender.UNKNOWN}>不明</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="birth_date">生年月日:</label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            value={editedPerson.birth_date || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="death_date">死亡日:</label>
          <input
            type="date"
            id="death_date"
            name="death_date"
            value={editedPerson.death_date || ''}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-button">保存</button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

export default PersonEditor; 