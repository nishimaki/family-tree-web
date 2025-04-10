import React from 'react';
import { render, screen } from '@testing-library/react';

// シンプルなテスト用コンポーネント
const SimpleComponent = () => {
  return <div>Simple Test Component</div>;
};

test('シンプルなコンポーネントがレンダリングされる', () => {
  render(<SimpleComponent />);
  
  // テキストが表示されているか確認
  expect(screen.getByText('Simple Test Component')).toBeInTheDocument();
});
