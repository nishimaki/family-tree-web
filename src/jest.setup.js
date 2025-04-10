import '@testing-library/jest-dom';

// グローバルなモックの設定
global.fetch = jest.fn();
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
}); 