// src/__tests__/FamilyTreeGraph.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import FamilyTreeGraph from '../components/FamilyTreeGraph';

describe('FamilyTreeGraph コンポーネント', () => {
  test('階層データがない場合にメッセージが表示される', () => {
    render(
      <FamilyTreeGraph
        hierarchyData={null}
        onPersonSelect={() => {}}
        onResetToAllFamily={() => {}}
      />
    );

    expect(screen.getByText(/表示するデータがありません/)).toBeInTheDocument();
  });
});
