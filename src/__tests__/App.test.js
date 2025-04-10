// src/__tests__/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// FileManagerのモック
jest.mock('../services/FileManager', () => ({
  loadFamilyTree: jest.fn(),
  saveFamilyTree: jest.fn()
}));

describe('App コンポーネント', () => {
  test('初期表示時に「ようこそ」メッセージが表示される', () => {
    render(<App />);
    
    // ようこそメッセージの表示確認
    expect(screen.getByText('ようこそ')).toBeInTheDocument();
  });
});
