import FileManager from '../services/FileManager';
import Person from '../models/Person';
import FamilyTree from '../models/FamilyTree';

// ブラウザAPIのモック
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = jest.fn((content, options) => {
  return {
    content,
    options
  };
});

describe('FileManager クラスのテスト', () => {
  let mockFileReader;
  let mockAnchorElement;
  
  beforeEach(() => {
    // コンソール出力のモック化（テスト出力をクリーンに保つため）
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // FileReader モックのセットアップ
    mockFileReader = {
      onload: null,
      onerror: null,
      readAsText: jest.fn(function(file) {
        // 成功時の処理をシミュレート
        if (file && file.content) {
          const event = {
            target: {
              result: file.content
            }
          };
          
          setTimeout(() => this.onload(event), 0);
        } else {
          // エラー時の処理をシミュレート
          setTimeout(() => this.onerror(new Error('File read error')), 0);
        }
      })
    };
    
    // FileReader コンストラクタのモック
    global.FileReader = jest.fn(() => mockFileReader);
    
    // リンク要素のモック
    mockAnchorElement = {
      href: '',
      download: '',
      click: jest.fn()
    };
    
    // document.createElement のモック
    document.createElement = jest.fn(tagName => {
      if (tagName === 'a') {
        return mockAnchorElement;
      }
      return {};
    });
  });
  
  afterEach(() => {
    // コンソール出力のモックを元に戻す
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });
  
  // ファイル読み込みのテスト
  describe('loadFamilyTree メソッド', () => {
    test('有効なJSONファイルから家系図データを読み込めること', async () => {
      // テスト用のファイルデータ
      const fileData = {
        title: 'テスト家系図',
        description: 'テスト用の家系図です',
        persons: {
          'p1': {
            id: 'p1',
            name: '山田太郎',
            gender: 'M',
            birth_date: '1980-01-01'
          },
          'p2': {
            id: 'p2',
            name: '山田花子',
            gender: 'F',
            birth_date: '1985-05-05',
            spouse_ids: ['p1']
          }
        }
      };
      
      // モックファイルオブジェクト
      const mockFile = {
        name: 'test.json',
        content: JSON.stringify(fileData)
      };
      
      // 家系図データの読み込み
      const result = await FileManager.loadFamilyTree(mockFile);
      
      // 期待する結果の検証
      expect(result.familyTree).toBeInstanceOf(FamilyTree);
      expect(result.familyTree.title).toBe('テスト家系図');
      expect(result.familyTree.description).toBe('テスト用の家系図です');
      
      // 人物データの検証
      const allPersons = result.familyTree.getAllPersons();
      expect(Object.keys(allPersons).length).toBe(2);
      
      const person1 = result.familyTree.getPerson('p1');
      expect(person1).toBeInstanceOf(Person);
      expect(person1.name).toBe('山田太郎');
      expect(person1.gender).toBe('M');
      
      const person2 = result.familyTree.getPerson('p2');
      expect(person2).toBeInstanceOf(Person);
      expect(person2.name).toBe('山田花子');
      expect(person2.gender).toBe('F');
      expect(person2.spouse_ids).toContain('p1');
      
      // 警告がないことを確認
      expect(result.warnings.length).toBe(0);
    });
    
    test('無効なJSONデータの場合、エラーが投げられること', async () => {
      // 無効なJSONデータを含むファイル
      const mockFile = {
        name: 'invalid.json',
        content: '{invalid: json}'
      };
      
      // エラーが投げられることを期待
      await expect(FileManager.loadFamilyTree(mockFile)).rejects.toThrow();
    });
    
    test('必須フィールドが欠けている人物データがある場合、警告が返されること', async () => {
      // 無効な人物データを含むファイル
      const fileData = {
        title: 'テスト家系図',
        persons: {
          'p1': {
            id: 'p1',
            name: '山田太郎'
          },
          'p2': {
            // idが欠けている
            name: '山田花子'
          }
        }
      };
      
      // モックファイルオブジェクト
      const mockFile = {
        name: 'test.json',
        content: JSON.stringify(fileData)
      };
      
      // 家系図データの読み込み
      const result = await FileManager.loadFamilyTree(mockFile);
      
      // 期待する結果の検証
      expect(result.familyTree).toBeInstanceOf(FamilyTree);
      
      // 有効な人物データのみ読み込まれていることを確認
      const allPersons = result.familyTree.getAllPersons();
      expect(Object.keys(allPersons).length).toBe(1);
      expect(result.familyTree.getPerson('p1')).toBeDefined();
      
      // 警告があることを確認
      expect(result.warnings.length).toBeGreaterThan(0);
    });
    
    test('ファイル読み込みエラーの場合、エラーが投げられること', async () => {
      // 読み込みエラーをシミュレートするためのnullファイル
      const mockFile = null;
      
      // エラーが投げられることを期待
      await expect(FileManager.loadFamilyTree(mockFile)).rejects.toThrow();
    });
  });
  
  // ファイル保存のテスト
  describe('saveFamilyTree メソッド', () => {
    test('家系図データをJSONファイルとして保存できること', () => {
      // テスト用の家系図データ
      const tree = new FamilyTree();
      tree.title = 'テスト家系図';
      tree.description = 'テスト用の家系図です';
      
      // 人物を追加
      const person1 = new Person({
        id: 'p1',
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-01'
      });
      
      const person2 = new Person({
        id: 'p2',
        name: '山田花子',
        gender: 'F',
        birth_date: '1985-05-05'
      });
      
      tree.addPerson(person1);
      tree.addPerson(person2);
      
      // 配偶者関係を設定
      person1.addSpouse('p2');
      person2.addSpouse('p1');
      
      // 保存処理
      const result = FileManager.saveFamilyTree(tree, 'test_family');
      
      // 結果の検証
      expect(result).toBe(true);
      
      // Blobが正しく作成されていることを確認
      expect(global.Blob).toHaveBeenCalled();
      const blobArgs = global.Blob.mock.calls[0];
      const blobContent = blobArgs[0][0];
      
      // Blobの内容を検証
      const savedData = JSON.parse(blobContent);
      expect(savedData.title).toBe('テスト家系図');
      expect(savedData.description).toBe('テスト用の家系図です');
      expect(Object.keys(savedData.persons).length).toBe(2);
      
      // 人物データが正しく含まれていることを確認
      expect(savedData.persons.p1.name).toBe('山田太郎');
      expect(savedData.persons.p2.name).toBe('山田花子');
      
      // ダウンロードリンクが正しく設定されていることを確認
      expect(mockAnchorElement.href).toBe('mock-url');
      expect(mockAnchorElement.download).toBe('test_family.json');
      expect(mockAnchorElement.click).toHaveBeenCalled();
      
      // URLオブジェクトが解放されていることを確認
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
    
    test('ファイル名が指定されていない場合、デフォルトのファイル名が使用されること', () => {
      // テスト用の家系図データ
      const tree = new FamilyTree();
      
      // 保存処理
      FileManager.saveFamilyTree(tree, null);
      
      // デフォルトのファイル名が使用されていることを確認
      expect(mockAnchorElement.download).toBe('family_tree.json');
    });
    
    test('例外が発生した場合、falseが返されること', () => {
      // テスト用の家系図データ
      const tree = new FamilyTree();
      
      // URL.createObjectURLで例外をスローするようにモック
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = jest.fn(() => {
        throw new Error('Mock error');
      });
      
      // 保存処理
      const result = FileManager.saveFamilyTree(tree, 'test_family');
      
      // 結果の検証
      expect(result).toBe(false);
      
      // モックを元に戻す
      URL.createObjectURL = originalCreateObjectURL;
    });
  });
});
