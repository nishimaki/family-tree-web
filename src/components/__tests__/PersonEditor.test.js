import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonEditor from '../PersonEditor';
import Gender from '../../constants/Gender';

describe('PersonEditor', () => {
  const mockPerson = {
    id: '1',
    name: 'テスト太郎',
    gender: Gender.MALE,
    birth_date: '1990-01-01',
    death_date: null,
    birth_order: 1,
    father_id: null,
    mother_id: null,
    spouse_ids: [],
    children_ids: [],
    note: 'テストメモ'
  };

  const mockPersons = [
    mockPerson,
    {
      id: '2',
      name: 'テスト花子',
      gender: Gender.FEMALE,
      birth_date: '1992-02-02',
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

  test('人物情報が正しく表示される', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('名前:')).toHaveValue('テスト太郎');
    expect(screen.getByLabelText('性別:')).toHaveValue(Gender.MALE);
    expect(screen.getByLabelText('生年月日:')).toHaveValue('1990-01-01');
    expect(screen.getByLabelText('メモ:')).toHaveValue('テストメモ');
  });

  test('保存ボタンをクリックするとonSaveが呼ばれる', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('保存'));
    expect(mockOnSave).toHaveBeenCalledWith(mockPerson);
  });

  test('キャンセルボタンをクリックするとonCancelが呼ばれる', () => {
    render(
      <PersonEditor
        person={mockPerson}
        persons={mockPersons}
        familyTree={mockFamilyTree}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('人物情報を編集できる', () => {
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
    fireEvent.change(nameInput, { target: { value: '新しい名前' } });
    expect(nameInput).toHaveValue('新しい名前');

    const genderSelect = screen.getByLabelText('性別:');
    fireEvent.change(genderSelect, { target: { value: Gender.FEMALE } });
    expect(genderSelect).toHaveValue(Gender.FEMALE);
  });
}); 