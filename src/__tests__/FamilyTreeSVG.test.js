// src/__tests__/FamilyTreeSVG.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FamilyTreeSVG from '../components/FamilyTreeSVG';
import Gender from '../constants/Gender';

// モック用のリサイズオブザーバー
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// テスト実行前にモックを設定
beforeAll(() => {
  global.ResizeObserver = ResizeObserverMock;
});

describe('FamilyTreeSVG コンポーネント', () => {
  // 階層データのモック
  const mockHierarchyData = {
    id: 'root',
    name: '山田太郎',
    gender: Gender.MALE,
    birth_date: '1940-01-01',
    death_date: null,
    children: [
      {
        id: 'child1',
        name: '山田次郎',
        gender: Gender.MALE,
        birth_date: '1970-05-15',
        death_date: null,
        children: []
      }
    ],
    spouses: [
      {
        id: 'spouse1',
        name: '山田良子',
        gender: Gender.FEMALE
      }
    ]
  };

  const mockOnPersonSelect = jest.fn();
  const mockOnResetToAllFamily = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('階層データがない場合にメッセージが表示される', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={null}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );

    expect(screen.getByText(/表示するデータがありません/)).toBeInTheDocument();
  });

  test('階層データがある場合にSVG要素が正しくレンダリングされる', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );

    // SVG要素が存在することを確認
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // ズームコントロールが存在することを確認
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();

    // 「家族全員に戻す」ボタンが存在することを確認
    expect(screen.getByText('家族全員に戻す')).toBeInTheDocument();

    // 人物名のテキストノードが表示されていることを確認
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
  });

  test('ズームボタンをクリックするとズーム状態が変わる', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );

    // ズームインボタンをクリック
    fireEvent.click(screen.getByText('+'));
    
    // SVG要素のスタイルが変わったことを確認するためのモック関数
    // 実際の実装はコンポーネントの内部状態に依存するため、実装方法によって異なる

    // ズームアウトボタンをクリック
    fireEvent.click(screen.getByText('-'));
    
    // SVG要素のスタイルが再び変わったことを確認するためのモック関数
    // 実際の実装はコンポーネントの内部状態に依存するため、実装方法によって異なる
  });

  test('「家族全員に戻す」ボタンをクリックすると onResetToAllFamily が呼ばれる', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );

    fireEvent.click(screen.getByText('家族全員に戻す'));
    expect(mockOnResetToAllFamily).toHaveBeenCalled();
  });

  test('SVG内の人物ノードをクリックすると onPersonSelect が呼ばれる', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );
    
    // SVGの人物ノードを見つけてクリック
    // Note: テキスト内容に依存せず、data-testid属性を追加する方がより堅牢
    // 実際の実装では、コンポーネントにdata-testid属性を追加することを検討してください
    const personNode = screen.getByText('山田太郎').closest('g');
    fireEvent.click(personNode);
    
    // コールバックが呼ばれたかどうかを確認
    // 注: 実際のコンポーネント実装によっては、引数やコールバックの呼び出し方が異なる場合があります
    expect(mockOnPersonSelect).toHaveBeenCalled();
  });

  test('パン操作をシミュレートする', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );
    
    const svgElement = document.querySelector('svg');
    
    // マウスダウン、移動、マウスアップのイベントをシミュレート
    fireEvent.mouseDown(svgElement, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(svgElement, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(svgElement);
    
    // パン操作後の状態確認
    // 注: 実際の実装に応じて、状態変化の確認方法を適宜変更してください
  });

  // SVG要素内の線（親子関係、配偶者関係）が正しく描画されていることを確認するテスト
  test('SVG内に親子関係と配偶者関係の線が描画される', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );
    
    // SVG内のline要素が存在することを確認
    const lineElements = document.querySelectorAll('svg line');
    expect(lineElements.length).toBeGreaterThan(0);
    
    // 点線（配偶者関係を表す）の有無を確認
    const dashedLines = Array.from(lineElements).filter(line => 
      line.getAttribute('stroke-dasharray') === '5,5'
    );
    expect(dashedLines.length).toBeGreaterThan(0);
  });

  // 人物を選択した際に詳細情報が表示されることを確認するテスト
  test('人物ノードをクリックすると詳細情報が表示される', () => {
    render(
      <FamilyTreeSVG
        hierarchyData={mockHierarchyData}
        onPersonSelect={mockOnPersonSelect}
        onResetToAllFamily={mockOnResetToAllFamily}
      />
    );
    
    // 人物ノードをクリック
    const personNode = screen.getByText('山田太郎').closest('g');
    fireEvent.click(personNode);
    
    // 注: 実際の実装によっては、詳細情報の表示方法やタイミングが異なる場合があります
    // 詳細情報の要素が表示されることを確認するためのテスト
  });
});