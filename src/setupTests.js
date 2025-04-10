// テスト環境のセットアップ
import '@testing-library/jest-dom';

// グローバルなモックの設定
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// コンソール出力のモック化
let consoleSpies = {};

beforeEach(() => {
  // 既存のスパイをクリーンアップ
  Object.values(consoleSpies).forEach(spy => {
    if (spy && typeof spy.mockRestore === 'function') {
      spy.mockRestore();
    }
  });
  
  // 新しいスパイを設定
  consoleSpies = {
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {})
  };
});

afterEach(() => {
  // スパイをクリーンアップ
  Object.values(consoleSpies).forEach(spy => {
    if (spy && typeof spy.mockRestore === 'function') {
      spy.mockRestore();
    }
  });
}); 