import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonEditor from '../components/PersonEditor';
import Gender from '../constants/Gender';

describe('PersonEditor コンポーネントのテスト', () => {
  // テスト用の人物データ
  const mockPerson = {
    id: 'p1',
    name: '山田太郎',
    gender: Gender.MALE,
    birth_date: '1980-01-01',
    death_date: null,
    birth_order: 1,
    father_id: null,
    mother_id: null,
    spouse_ids: [],
    children_ids: [],
    note: 'テスト備考'
  };

  const mockPersons = [
    mockPerson,
    {
      id: 'p2',
      name: '山田花子',
      gender: Gender.FEMALE,
      birth_date: '1985-05-05',
      death_date: null,
      birth_order: 1,
      father_id: null,
      mother_id: null,
      spouse_ids: [],
      children_ids: [],
      note: ''
    }
  ];

  const mockFamilyTree = {
    persons: mockPersons
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('コンポーネントが正しくレンダリングされること', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('名前:')).toHaveValue('山田太郎');
    expect(screen.getByLabelText('性別:')).toHaveValue(Gender.MALE);
    expect(screen.getByLabelText('生年月日:')).toHaveValue('1980-01-01');
    expect(screen.getByLabelText('出生順:')).toHaveValue(1);
    expect(screen.getByLabelText('メモ:')).toHaveValue('テスト備考');
  });

  test('保存ボタンがクリックされるとonSaveコールバックが呼ばれること', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('名前:');
    fireEvent.change(nameInput, { target: { value: '山田次郎', name: 'name' } });
    
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      ...mockPerson,
      name: '山田次郎'
    });
  });

  test('キャンセルボタンがクリックされるとonCancelコールバックが呼ばれること', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('フォームの入力値が正しく更新されること', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // 名前の変更
    const nameInput = screen.getByLabelText('名前:');
    fireEvent.change(nameInput, { target: { value: '新しい名前', name: 'name' } });
    expect(nameInput).toHaveValue('新しい名前');

    // 性別の変更
    const genderSelect = screen.getByLabelText('性別:');
    fireEvent.change(genderSelect, { target: { value: Gender.FEMALE, name: 'gender' } });
    expect(genderSelect).toHaveValue(Gender.FEMALE);

    // 生年月日の変更
    const birthDateInput = screen.getByLabelText('生年月日:');
    fireEvent.change(birthDateInput, { target: { value: '1990-12-31', name: 'birth_date' } });
    expect(birthDateInput).toHaveValue('1990-12-31');
  });
});
