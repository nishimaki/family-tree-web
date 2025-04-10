import React, { useState, useEffect } from 'react';
import Gender from '../constants/Gender';

/**
 * 人物編集コンポーネント
 * @param {Object} props - プロパティ
 * @param {Object} props.person - 編集する人物オブジェクト
 * @param {Array} props.persons - 家系図内の全人物リスト
 * @param {Object} props.familyTree - 家系図オブジェクト
 * @param {Function} props.onSave - 保存時のコールバック関数
 * @param {Function} props.onCancel - キャンセル時のコールバック関数
 */
function PersonEditor({ person, persons, familyTree, onSave, onCancel }) {
  const [editedPerson, setEditedPerson] = useState({ ...person });
  const [availablePersons, setAvailablePersons] = useState([]);
  
  useEffect(() => {
    setEditedPerson({ ...person });
    
    // 自分以外の人物リストを取得（父親、母親、配偶者、子供の選択用）
    if (persons) {
      setAvailablePersons(persons.filter(p => p.id !== person.id));
    }
  }, [person, persons]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEditedPerson(prev => ({
      ...prev,
      [name]: type === 'date' && value === '' ? null : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // 空文字列か数値のみ許可
    if (value === '' || !isNaN(value)) {
      setEditedPerson(prev => ({
        ...prev,
        [name]: value === '' ? null : parseInt(value, 10)
      }));
    }
  };

  const handleRelationChange = (e) => {
    const { name, value } = e.target;
    setEditedPerson(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setEditedPerson(prev => ({
      ...prev,
      [name]: selectedValues
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedPerson);
  };

  // 人物の選択肢を性別でフィルタリングする関数
  const getPersonsFilteredByGender = (gender) => {
    return availablePersons.filter(p => 
      gender === 'all' || p.gender === gender || p.gender === Gender.UNKNOWN
    );
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

        <div className="form-group">
          <label htmlFor="birth_order">出生順:</label>
          <input
            type="number"
            id="birth_order"
            name="birth_order"
            min="0"
            value={editedPerson.birth_order || ''}
            onChange={handleNumberChange}
            placeholder="兄弟姉妹の中での順序（0から）"
          />
        </div>

        <div className="form-group">
          <label htmlFor="father_id">父親:</label>
          <select
            id="father_id"
            name="father_id"
            value={editedPerson.father_id || ''}
            onChange={handleRelationChange}
          >
            <option value="">選択なし</option>
            {getPersonsFilteredByGender(Gender.MALE).map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mother_id">母親:</label>
          <select
            id="mother_id"
            name="mother_id"
            value={editedPerson.mother_id || ''}
            onChange={handleRelationChange}
          >
            <option value="">選択なし</option>
            {getPersonsFilteredByGender(Gender.FEMALE).map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="spouse_ids">配偶者:</label>
          <select
            id="spouse_ids"
            name="spouse_ids"
            multiple
            value={editedPerson.spouse_ids || []}
            onChange={handleMultiSelectChange}
            size="4"
          >
            {availablePersons.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.gender === Gender.MALE ? '男性' : p.gender === Gender.FEMALE ? '女性' : '不明'})
              </option>
            ))}
          </select>
          <small className="help-text">Ctrlキーを押しながらクリックで複数選択</small>
        </div>

        <div className="form-group">
          <label htmlFor="children_ids">子供:</label>
          <select
            id="children_ids"
            name="children_ids"
            multiple
            value={editedPerson.children_ids || []}
            onChange={handleMultiSelectChange}
            size="4"
          >
            {availablePersons.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.gender === Gender.MALE ? '男性' : p.gender === Gender.FEMALE ? '女性' : '不明'})
              </option>
            ))}
          </select>
          <small className="help-text">Ctrlキーを押しながらクリックで複数選択</small>
        </div>

        <div className="form-group">
          <label htmlFor="note">メモ:</label>
          <textarea
            id="note"
            name="note"
            value={editedPerson.note || ''}
            onChange={handleChange}
            rows="4"
            placeholder="メモを入力してください"
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