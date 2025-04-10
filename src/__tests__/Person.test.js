import Person from '../models/Person';
import Gender from '../constants/Gender';

describe('Person クラスのテスト', () => {
  // コンストラクタのテスト
  describe('コンストラクタ', () => {
    test('基本的な人物情報が正しく設定されること', () => {
      const personData = {
        id: 'p1',
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-15',
        death_date: null,
        birth_order: 0,
        father_id: 'f1',
        mother_id: 'm1',
        spouse_ids: ['s1'],
        children_ids: ['c1', 'c2'],
        note: 'テスト用人物データ'
      };

      const person = new Person(personData);

      expect(person.id).toBe('p1');
      expect(person.name).toBe('山田太郎');
      expect(person.gender).toBe('M');
      expect(person.birth_date).toBe('1980-01-15');
      expect(person.death_date).toBeNull();
      expect(person.birth_order).toBe(0);
      expect(person.father_id).toBe('f1');
      expect(person.mother_id).toBe('m1');
      expect(person.spouse_ids).toEqual(['s1']);
      expect(person.children_ids).toEqual(['c1', 'c2']);
      expect(person.note).toBe('テスト用人物データ');
    });

    test('省略可能なプロパティが省略された場合、適切なデフォルト値が設定されること', () => {
      const personData = {
        id: 'p2',
        name: '山田花子'
      };

      const person = new Person(personData);

      expect(person.id).toBe('p2');
      expect(person.name).toBe('山田花子');
      expect(person.gender).toBeNull();
      expect(person.birth_date).toBeNull();
      expect(person.death_date).toBeNull();
      expect(person.birth_order).toBeNull();
      expect(person.father_id).toBeNull();
      expect(person.mother_id).toBeNull();
      expect(person.spouse_ids).toEqual([]);
      expect(person.children_ids).toEqual([]);
      expect(person.note).toBeNull();
    });
  });

  // 日付フォーマット処理のテスト
  describe('_formatDate メソッド', () => {
    test('有効な YYYY-MM-DD 形式の日付が正しく処理されること', () => {
      const person = new Person({ id: 'test', name: 'テスト', birth_date: '2000-12-31' });
      expect(person.birth_date).toBe('2000-12-31');
    });

    test('年のみ (YYYY) の形式が正しく処理されること', () => {
      const person = new Person({ id: 'test', name: 'テスト', birth_date: '1990' });
      expect(person.birth_date).toBe('1990-01-01');
    });

    test('無効な日付形式の場合、null が設定されること', () => {
      const person = new Person({ id: 'test', name: 'テスト', birth_date: 'invalid-date' });
      expect(person.birth_date).toBeNull();
    });

    test('null または空の日付が正しく処理されること', () => {
      const person1 = new Person({ id: 'test1', name: 'テスト1', birth_date: null });
      const person2 = new Person({ id: 'test2', name: 'テスト2', birth_date: '' });
      
      expect(person1.birth_date).toBeNull();
      expect(person2.birth_date).toBeNull();
    });
  });

  // 出生順のテスト
  describe('出生順 (birth_order) の設定と取得', () => {
    test('setBirthOrder で有効な値を設定できること', () => {
      const person = new Person({ id: 'test', name: 'テスト' });
      
      expect(person.setBirthOrder(1)).toBe(true);
      expect(person.birth_order).toBe(1);
      
      expect(person.setBirthOrder(0)).toBe(true);
      expect(person.birth_order).toBe(0);
      
      expect(person.setBirthOrder(null)).toBe(true);
      expect(person.birth_order).toBeNull();
    });

    test('setBirthOrder で負の値を設定できないこと', () => {
      const person = new Person({ id: 'test', name: 'テスト', birth_order: 1 });
      
      expect(person.setBirthOrder(-1)).toBe(false);
      expect(person.birth_order).toBe(1); // 変更されていないことを確認
    });

    test('getBirthOrder で正しい値が取得できること', () => {
      const person = new Person({ id: 'test', name: 'テスト', birth_order: 2 });
      expect(person.getBirthOrder()).toBe(2);
      
      person.setBirthOrder(3);
      expect(person.getBirthOrder()).toBe(3);
      
      person.setBirthOrder(null);
      expect(person.getBirthOrder()).toBeNull();
    });
  });

  // 配偶者関連のテスト
  describe('配偶者の追加と削除', () => {
    test('addSpouse で配偶者を追加できること', () => {
      const person = new Person({ id: 'test', name: 'テスト' });
      
      expect(person.addSpouse('spouse1')).toBe(true);
      expect(person.spouse_ids).toContain('spouse1');
      
      expect(person.addSpouse('spouse2')).toBe(true);
      expect(person.spouse_ids).toEqual(['spouse1', 'spouse2']);
    });

    test('addSpouse で同じ配偶者を重複して追加できないこと', () => {
      const person = new Person({ id: 'test', name: 'テスト' });
      
      expect(person.addSpouse('spouse1')).toBe(true);
      expect(person.addSpouse('spouse1')).toBe(false);
      expect(person.spouse_ids).toEqual(['spouse1']);
    });

    test('removeSpouse で配偶者を削除できること', () => {
      const person = new Person({ 
        id: 'test', 
        name: 'テスト',
        spouse_ids: ['spouse1', 'spouse2', 'spouse3']
      });
      
      expect(person.removeSpouse('spouse2')).toBe(true);
      expect(person.spouse_ids).toEqual(['spouse1', 'spouse3']);
    });

    test('removeSpouse で存在しない配偶者の削除が失敗すること', () => {
      const person = new Person({ 
        id: 'test', 
        name: 'テスト',
        spouse_ids: ['spouse1', 'spouse3']
      });
      
      expect(person.removeSpouse('spouse2')).toBe(false);
      expect(person.spouse_ids).toEqual(['spouse1', 'spouse3']);
    });
  });

  // 子関連のテスト
  describe('子の追加と削除', () => {
    test('addChild で子を追加できること', () => {
      const person = new Person({ id: 'test', name: 'テスト' });
      
      expect(person.addChild('child1')).toBe(true);
      expect(person.children_ids).toContain('child1');
      
      expect(person.addChild('child2')).toBe(true);
      expect(person.children_ids).toEqual(['child1', 'child2']);
    });

    test('addChild で同じ子を重複して追加できないこと', () => {
      const person = new Person({ id: 'test', name: 'テスト' });
      
      expect(person.addChild('child1')).toBe(true);
      expect(person.addChild('child1')).toBe(false);
      expect(person.children_ids).toEqual(['child1']);
    });

    test('removeChild で子を削除できること', () => {
      const person = new Person({ 
        id: 'test', 
        name: 'テスト',
        children_ids: ['child1', 'child2', 'child3']
      });
      
      expect(person.removeChild('child2')).toBe(true);
      expect(person.children_ids).toEqual(['child1', 'child3']);
    });

    test('removeChild で存在しない子の削除が失敗すること', () => {
      const person = new Person({ 
        id: 'test', 
        name: 'テスト',
        children_ids: ['child1', 'child3']
      });
      
      expect(person.removeChild('child2')).toBe(false);
      expect(person.children_ids).toEqual(['child1', 'child3']);
    });
  });

  // 親関連のテスト
  describe('親の設定とクリア', () => {
    test('setFather と setMother で親を設定できること', () => {
      const person = new Person({ id: 'test', name: 'テスト' });
      
      expect(person.setFather('father1')).toBe(true);
      expect(person.father_id).toBe('father1');
      
      expect(person.setMother('mother1')).toBe(true);
      expect(person.mother_id).toBe('mother1');
    });

    test('clearFather と clearMother で親をクリアできること', () => {
      const person = new Person({ 
        id: 'test', 
        name: 'テスト',
        father_id: 'father1',
        mother_id: 'mother1'
      });
      
      expect(person.clearFather()).toBe(true);
      expect(person.father_id).toBeNull();
      
      expect(person.clearMother()).toBe(true);
      expect(person.mother_id).toBeNull();
    });
  });

  // バリデーションのテスト
  describe('validate メソッド', () => {
    test('有効なデータの場合、空のエラーオブジェクトが返されること', () => {
      const person = new Person({
        id: 'p1',
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-01',
        death_date: '2020-12-31',
        birth_order: 0,
      });
      
      const errors = person.validate();
      expect(Object.keys(errors).length).toBe(0);
    });

    test('名前が空の場合、エラーが返されること', () => {
      const person = new Person({
        id: 'p1',
        name: '',
      });
      
      const errors = person.validate();
      expect(errors.name).toBeDefined();
      expect(errors.name.length).toBeGreaterThan(0);
    });

    test('無効な性別の場合、エラーが返されること', () => {
      const person = new Person({
        id: 'p1',
        name: '山田太郎',
        gender: 'X', // 無効な性別
      });
      
      const errors = person.validate();
      expect(errors.gender).toBeDefined();
      expect(errors.gender.length).toBeGreaterThan(0);
    });

    test('出生順が負の値の場合、エラーが返されること', () => {
      const person = new Person({
        id: 'p1',
        name: '山田太郎',
        birth_order: -1, // 無効な出生順
      });
      
      const errors = person.validate();
      expect(errors.birth_order).toBeDefined();
      expect(errors.birth_order.length).toBeGreaterThan(0);
    });

    test('生年月日が死亡日より後の場合、エラーが返されること', () => {
      const person = new Person({
        id: 'p1',
        name: '山田太郎',
        birth_date: '2000-01-01',
        death_date: '1990-01-01', // 生年月日より前
      });
      
      const errors = person.validate();
      expect(errors.death_date).toBeDefined();
      expect(errors.death_date.length).toBeGreaterThan(0);
    });
  });

  // 辞書変換のテスト
  describe('toDict メソッド', () => {
    test('正しくオブジェクトが辞書形式に変換されること', () => {
      const personData = {
        id: 'p1',
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-15',
        death_date: null,
        birth_order: 0,
        father_id: 'f1',
        mother_id: 'm1',
        spouse_ids: ['s1'],
        children_ids: ['c1', 'c2'],
        note: 'テスト用人物データ'
      };

      const person = new Person(personData);
      const dict = person.toDict();
      
      expect(dict).toEqual(personData);
      
      // 配列が新しいコピーであることを確認
      expect(dict.spouse_ids).not.toBe(person.spouse_ids);
      expect(dict.children_ids).not.toBe(person.children_ids);
    });
  });

  // クローン作成のテスト
  describe('clone メソッド', () => {
    test('正しくオブジェクトがクローンされること', () => {
      const personData = {
        id: 'p1',
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-15',
        death_date: null,
        birth_order: 0,
        father_id: 'f1',
        mother_id: 'm1',
        spouse_ids: ['s1'],
        children_ids: ['c1', 'c2'],
        note: 'テスト用人物データ'
      };

      const person = new Person(personData);
      const clone = person.clone();
      
      // プロパティが同じ値であることを確認
      expect(clone.id).toBe(person.id);
      expect(clone.name).toBe(person.name);
      expect(clone.gender).toBe(person.gender);
      expect(clone.birth_date).toBe(person.birth_date);
      expect(clone.death_date).toBe(person.death_date);
      expect(clone.birth_order).toBe(person.birth_order);
      expect(clone.father_id).toBe(person.father_id);
      expect(clone.mother_id).toBe(person.mother_id);
      expect(clone.spouse_ids).toEqual(person.spouse_ids);
      expect(clone.children_ids).toEqual(person.children_ids);
      expect(clone.note).toBe(person.note);
      
      // 異なるオブジェクトであることを確認
      expect(clone).not.toBe(person);
      
      // 配列が新しいコピーであることを確認
      expect(clone.spouse_ids).not.toBe(person.spouse_ids);
      expect(clone.children_ids).not.toBe(person.children_ids);
    });
  });

  // 静的メソッドのテスト
  describe('静的メソッド fromDict', () => {
    test('有効なデータから正しくオブジェクトが生成されること', () => {
      const personData = {
        id: 'p1',
        name: '山田太郎',
        gender: 'M',
        birth_date: '1980-01-15',
        death_date: null,
        birth_order: 0,
        father_id: 'f1',
        mother_id: 'm1',
        spouse_ids: ['s1'],
        children_ids: ['c1', 'c2'],
        note: 'テスト用人物データ'
      };

      const person = Person.fromDict(personData);
      
      expect(person instanceof Person).toBe(true);
      expect(person.id).toBe('p1');
      expect(person.name).toBe('山田太郎');
      expect(person.gender).toBe('M');
      expect(person.birth_date).toBe('1980-01-15');
    });

    test('必須フィールドが欠けている場合、例外が投げられること', () => {
      const invalidData1 = {
        name: '山田太郎' // idが欠けている
      };
      
      const invalidData2 = {
        id: 'p1' // nameが欠けている
      };
      
      expect(() => Person.fromDict(invalidData1)).toThrow();
      expect(() => Person.fromDict(invalidData2)).toThrow();
    });
  });
});
