import FamilyTree from '../models/FamilyTree';
import Person from '../models/Person';

describe('FamilyTree クラスのテスト', () => {
  // 基本的な機能のテスト
  describe('基本機能', () => {
    test('インスタンス作成時に空のツリーが初期化されること', () => {
      const tree = new FamilyTree();
      
      expect(tree._persons).toEqual({});
      expect(tree.title).toBe('');
      expect(tree.description).toBe('');
    });
  });
  
  // 人物追加のテスト
  describe('addPerson メソッド', () => {
    test('正常に人物を追加できること', () => {
      const tree = new FamilyTree();
      const person = new Person({ id: 'p1', name: '山田太郎' });
      
      expect(tree.addPerson(person)).toBe(true);
      expect(tree.getPerson('p1')).toBe(person);
    });
    
    test('同じIDの人物を重複して追加できないこと', () => {
      const tree = new FamilyTree();
      const person1 = new Person({ id: 'p1', name: '山田太郎' });
      const person2 = new Person({ id: 'p1', name: '鈴木次郎' }); // 同じID
      
      expect(tree.addPerson(person1)).toBe(true);
      expect(tree.addPerson(person2)).toBe(false);
      
      // 最初に追加した人物が維持されていることを確認
      expect(tree.getPerson('p1').name).toBe('山田太郎');
    });
  });
  
  // 関係性構築のテスト
  describe('buildRelationships メソッド', () => {
    test('親子関係が正しく構築されること', () => {
      const tree = new FamilyTree();
      
      // 父親
      const father = new Person({ 
        id: 'father1', 
        name: '山田一郎',
        gender: 'M'
      });
      
      // 母親
      const mother = new Person({ 
        id: 'mother1', 
        name: '山田花子',
        gender: 'F'
      });
      
      // 子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'father1',
        mother_id: 'mother1'
      });
      
      // 家系図に追加
      tree.addPerson(father);
      tree.addPerson(mother);
      tree.addPerson(child);
      
      // 関係性を構築
      tree.buildRelationships();
      
      // 父親の子リストに子どもが追加されていることを確認
      expect(father.children_ids).toContain('child1');
      
      // 母親の子リストに子どもが追加されていることを確認
      expect(mother.children_ids).toContain('child1');
    });
    
    test('配偶者関係が正しく構築されること', () => {
      const tree = new FamilyTree();
      
      // 父親
      const father = new Person({ 
        id: 'father1', 
        name: '山田一郎',
        gender: 'M'
      });
      
      // 母親
      const mother = new Person({ 
        id: 'mother1', 
        name: '山田花子',
        gender: 'F'
      });
      
      // 子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'father1',
        mother_id: 'mother1'
      });
      
      // 家系図に追加
      tree.addPerson(father);
      tree.addPerson(mother);
      tree.addPerson(child);
      
      // 関係性を構築
      tree.buildRelationships();
      
      // 父親の配偶者リストに母親が追加されていることを確認
      expect(father.spouse_ids).toContain('mother1');
      
      // 母親の配偶者リストに父親が追加されていることを確認
      expect(mother.spouse_ids).toContain('father1');
    });
  });
  
  // 人物取得のテスト
  describe('getPerson メソッド', () => {
    test('存在する人物IDを指定した場合、正しく人物が取得できること', () => {
      const tree = new FamilyTree();
      const person = new Person({ id: 'p1', name: '山田太郎' });
      
      tree.addPerson(person);
      
      expect(tree.getPerson('p1')).toBe(person);
    });
    
    test('存在しない人物IDを指定した場合、null が返されること', () => {
      const tree = new FamilyTree();
      
      expect(tree.getPerson('not_exist')).toBeNull();
    });
  });
  
  // 全人物取得のテスト
  describe('getAllPersons メソッド', () => {
    test('追加したすべての人物が取得できること', () => {
      const tree = new FamilyTree();
      const person1 = new Person({ id: 'p1', name: '山田太郎' });
      const person2 = new Person({ id: 'p2', name: '山田花子' });
      
      tree.addPerson(person1);
      tree.addPerson(person2);
      
      const allPersons = tree.getAllPersons();
      
      expect(Object.keys(allPersons).length).toBe(2);
      expect(allPersons.p1).toBe(person1);
      expect(allPersons.p2).toBe(person2);
    });
    
    test('返されるオブジェクトが元のオブジェクトと異なることを確認', () => {
      const tree = new FamilyTree();
      
      const allPersons = tree.getAllPersons();
      
      expect(allPersons).not.toBe(tree._persons);
    });
  });
  
  // 配偶者取得のテスト
  describe('getSpouses メソッド', () => {
    test('存在する人物の配偶者IDリストが取得できること', () => {
      const tree = new FamilyTree();
      
      // 夫
      const husband = new Person({ 
        id: 'husband1', 
        name: '山田一郎',
        spouse_ids: ['wife1', 'wife2']
      });
      
      tree.addPerson(husband);
      
      const spouses = tree.getSpouses('husband1');
      
      expect(spouses).toEqual(['wife1', 'wife2']);
    });
    
    test('存在しない人物IDを指定した場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      const spouses = tree.getSpouses('not_exist');
      
      expect(spouses).toEqual([]);
    });
  });
  
  // 親取得のテスト
  describe('getParents メソッド', () => {
    test('存在する人物の親IDリストが取得できること', () => {
      const tree = new FamilyTree();
      
      // 子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'father1',
        mother_id: 'mother1'
      });
      
      tree.addPerson(child);
      
      const parents = tree.getParents('child1');
      
      expect(parents).toEqual(['father1', 'mother1']);
    });
    
    test('親が一人のみの場合、その親のIDが含まれたリストが返されること', () => {
      const tree = new FamilyTree();
      
      // 父親のみの子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'father1'
      });
      
      tree.addPerson(child);
      
      const parents = tree.getParents('child1');
      
      expect(parents).toEqual(['father1']);
    });
    
    test('親がない場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      // 親なしの人物
      const person = new Person({ 
        id: 'p1', 
        name: '山田太郎'
      });
      
      tree.addPerson(person);
      
      const parents = tree.getParents('p1');
      
      expect(parents).toEqual([]);
    });
    
    test('存在しない人物IDを指定した場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      const parents = tree.getParents('not_exist');
      
      expect(parents).toEqual([]);
    });
  });
  
  // 子取得のテスト
  describe('getChildren メソッド', () => {
    test('存在する人物の子IDリストが取得できること', () => {
      const tree = new FamilyTree();
      
      // 親
      const parent = new Person({ 
        id: 'parent1', 
        name: '山田一郎',
        children_ids: ['child1', 'child2']
      });
      
      tree.addPerson(parent);
      
      const children = tree.getChildren('parent1');
      
      expect(children).toEqual(['child1', 'child2']);
    });
    
    test('存在しない人物IDを指定した場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      const children = tree.getChildren('not_exist');
      
      expect(children).toEqual([]);
    });
  });
  
  // 兄弟取得のテスト
  describe('getSiblings メソッド', () => {
    test('同じ父を持つ兄弟が取得できること', () => {
      const tree = new FamilyTree();
      
      // 兄弟1
      const sibling1 = new Person({ 
        id: 'sibling1', 
        name: '山田太郎',
        father_id: 'father1'
      });
      
      // 兄弟2
      const sibling2 = new Person({ 
        id: 'sibling2', 
        name: '山田次郎',
        father_id: 'father1'
      });
      
      // 無関係の人物
      const other = new Person({ 
        id: 'other1', 
        name: '鈴木一郎',
        father_id: 'other_father'
      });
      
      tree.addPerson(sibling1);
      tree.addPerson(sibling2);
      tree.addPerson(other);
      
      const siblings = tree.getSiblings('sibling1');
      
      expect(siblings).toEqual(['sibling2']);
    });
    
    test('同じ母を持つ兄弟が取得できること', () => {
      const tree = new FamilyTree();
      
      // 兄弟1
      const sibling1 = new Person({ 
        id: 'sibling1', 
        name: '山田太郎',
        mother_id: 'mother1'
      });
      
      // 兄弟2
      const sibling2 = new Person({ 
        id: 'sibling2', 
        name: '山田次郎',
        mother_id: 'mother1'
      });
      
      tree.addPerson(sibling1);
      tree.addPerson(sibling2);
      
      const siblings = tree.getSiblings('sibling1');
      
      expect(siblings).toEqual(['sibling2']);
    });
    
    test('親がいない場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      // 親なしの人物
      const person = new Person({ 
        id: 'p1', 
        name: '山田太郎'
      });
      
      tree.addPerson(person);
      
      const siblings = tree.getSiblings('p1');
      
      expect(siblings).toEqual([]);
    });
    
    test('存在しない人物IDを指定した場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      const siblings = tree.getSiblings('not_exist');
      
      expect(siblings).toEqual([]);
    });
  });
  
  // 人物削除のテスト
  describe('removePerson メソッド', () => {
    test('正常に人物を削除できること', () => {
      const tree = new FamilyTree();
      const person = new Person({ id: 'p1', name: '山田太郎' });
      
      tree.addPerson(person);
      expect(tree.removePerson('p1')).toBe(true);
      expect(tree.getPerson('p1')).toBeNull();
    });
    
    test('存在しない人物IDを指定した場合、削除に失敗すること', () => {
      const tree = new FamilyTree();
      
      expect(tree.removePerson('not_exist')).toBe(false);
    });
    
    test('削除した人物が他の人物の親だった場合、関連が正しく削除されること', () => {
      const tree = new FamilyTree();
      
      // 父親
      const father = new Person({ 
        id: 'father1', 
        name: '山田一郎'
      });
      
      // 子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'father1'
      });
      
      tree.addPerson(father);
      tree.addPerson(child);
      tree.buildRelationships();
      
      // 削除前に関係性が構築されていることを確認
      expect(father.children_ids).toContain('child1');
      expect(child.father_id).toBe('father1');
      
      // 父親を削除
      tree.removePerson('father1');
      
      // 子どもの父親IDがnullになっていることを確認
      expect(tree.getPerson('child1').father_id).toBeNull();
    });
    
    test('削除した人物が他の人物の配偶者だった場合、関連が正しく削除されること', () => {
      const tree = new FamilyTree();
      
      // 夫
      const husband = new Person({ 
        id: 'husband1', 
        name: '山田一郎',
        spouse_ids: ['wife1']
      });
      
      // 妻
      const wife = new Person({ 
        id: 'wife1', 
        name: '山田花子',
        spouse_ids: ['husband1']
      });
      
      tree.addPerson(husband);
      tree.addPerson(wife);
      
      // 夫を削除
      tree.removePerson('husband1');
      
      // 妻の配偶者リストから夫が削除されていることを確認
      expect(tree.getPerson('wife1').spouse_ids).not.toContain('husband1');
    });
    
    test('削除した人物が他の人物の子だった場合、関連が正しく削除されること', () => {
      const tree = new FamilyTree();
      
      // 親
      const parent = new Person({ 
        id: 'parent1', 
        name: '山田一郎',
        children_ids: ['child1']
      });
      
      // 子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'parent1'
      });
      
      tree.addPerson(parent);
      tree.addPerson(child);
      
      // 子どもを削除
      tree.removePerson('child1');
      
      // 親の子リストから削除されていることを確認
      expect(tree.getPerson('parent1').children_ids).not.toContain('child1');
    });
  });
  
  // ルートノード取得のテスト
  describe('getRootNodes メソッド', () => {
    test('親がいない人物のIDリストが取得できること', () => {
      const tree = new FamilyTree();
      
      // ルートノード1
      const root1 = new Person({ 
        id: 'root1', 
        name: '山田一郎'
      });
      
      // ルートノード2
      const root2 = new Person({ 
        id: 'root2', 
        name: '鈴木一郎'
      });
      
      // ルートでない人物
      const nonRoot = new Person({ 
        id: 'non_root', 
        name: '山田太郎',
        father_id: 'root1'
      });
      
      tree.addPerson(root1);
      tree.addPerson(root2);
      tree.addPerson(nonRoot);
      
      const rootNodes = tree.getRootNodes();
      
      expect(rootNodes.length).toBe(2);
      expect(rootNodes).toContain('root1');
      expect(rootNodes).toContain('root2');
      expect(rootNodes).not.toContain('non_root');
    });
    
    test('家系図が空の場合、空の配列が返されること', () => {
      const tree = new FamilyTree();
      
      const rootNodes = tree.getRootNodes();
      
      expect(rootNodes).toEqual([]);
    });
  });
  
  // 人物更新のテスト
  describe('updatePerson メソッド', () => {
    test('正常に人物情報を更新できること', () => {
      const tree = new FamilyTree();
      
      // 初期の人物
      const originalPerson = new Person({ 
        id: 'p1', 
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-01'
      });
      
      tree.addPerson(originalPerson);
      
      // 更新用の人物
      const updatedPerson = new Person({ 
        id: 'p1', 
        name: '山田太郎（更新）',
        gender: 'M',
        birth_date: '1980-01-15',
        note: '更新されました'
      });
      
      expect(tree.updatePerson('p1', updatedPerson)).toBe(true);
      
      // 更新された情報を確認
      const retrievedPerson = tree.getPerson('p1');
      expect(retrievedPerson.name).toBe('山田太郎（更新）');
      expect(retrievedPerson.birth_date).toBe('1980-01-15');
      expect(retrievedPerson.note).toBe('更新されました');
    });
    
    test('IDが異なる場合でも、指定されたIDが優先されること', () => {
      const tree = new FamilyTree();
      
      // 初期の人物
      const originalPerson = new Person({ 
        id: 'p1', 
        name: '山田太郎'
      });
      
      tree.addPerson(originalPerson);
      
      // 異なるIDを持つ更新用の人物
      const updatedPerson = new Person({ 
        id: 'p2', // 異なるID
        name: '山田太郎（更新）'
      });
      
      expect(tree.updatePerson('p1', updatedPerson)).toBe(true);
      
      // 更新された人物のIDが維持されていることを確認
      const retrievedPerson = tree.getPerson('p1');
      expect(retrievedPerson.id).toBe('p1');
      expect(retrievedPerson.name).toBe('山田太郎（更新）');
    });
    
    test('存在しない人物IDを指定した場合、更新に失敗すること', () => {
      const tree = new FamilyTree();
      
      const person = new Person({ 
        id: 'p1', 
        name: '山田太郎'
      });
      
      expect(tree.updatePerson('not_exist', person)).toBe(false);
    });
    
    test('更新後に関係性が再構築されること', () => {
      const tree = new FamilyTree();
      
      // 父親
      const father = new Person({ 
        id: 'father1', 
        name: '山田一郎'
      });
      
      // 元の母親
      const originalMother = new Person({ 
        id: 'mother1', 
        name: '山田花子'
      });
      
      // 子ども
      const child = new Person({ 
        id: 'child1', 
        name: '山田太郎',
        father_id: 'father1',
        mother_id: 'mother1'
      });
      
      tree.addPerson(father);
      tree.addPerson(originalMother);
      tree.addPerson(child);
      tree.buildRelationships();
      
      // 更新用の母親（子どもが変わる）
      const updatedMother = originalMother.clone();
      updatedMother.children_ids = []; // 子リストをクリア
      
      tree.updatePerson('mother1', updatedMother);
      
      // 母親の子リストに子どもが再度追加されていることを確認
      expect(tree.getPerson('mother1').children_ids).toContain('child1');
      
      // 父親の配偶者リストに母親が含まれていることを確認
      expect(tree.getPerson('father1').spouse_ids).toContain('mother1');
    });
  });
});
