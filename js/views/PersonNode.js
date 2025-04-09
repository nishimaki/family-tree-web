/**
 * PersonNodeコンポーネント - 家系図の人物ノードを表示するコンポーネント
 * 人物の基本情報（名前、性別、生没年）とスタイリングを担当
 */
class PersonNode extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  
  /**
   * ノードクリック時のハンドラー
   * @param {Event} event - クリックイベント
   */
  handleClick(event) {
    event.stopPropagation();
    if (this.props.onClick) {
      this.props.onClick(this.props.person.id);
    }
  }
  
  /**
   * 生年月日の表示用フォーマット (YYYY-MM-DD → YYYY年MM月DD日 など)
   * @param {string} dateStr - YYYY-MM-DD 形式の日付文字列
   * @returns {string} - 表示用にフォーマットされた日付文字列
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    // 日付を解析
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      
      // 月日が 01-01 の場合は年のみ表示（年だけわかっている場合など）
      if (month === '01' && day === '01') {
        return `${year}年`;
      }
      
      return `${year}年${parseInt(month)}月${parseInt(day)}日`;
    }
    
    return dateStr; // 解析できない場合はそのまま返す
  }
  
  /**
   * 生没年の表示文字列を生成
   * @param {Person} person - 人物オブジェクト
   * @returns {string} - 表示用の生没年文字列
   */
  formatLifespan(person) {
    if (!person.birth_date && !person.death_date) {
      return '';
    }
    
    const birth = person.birth_date ? this.formatDate(person.birth_date) : '?';
    const death = person.death_date ? this.formatDate(person.death_date) : '';
    
    if (death) {
      return `${birth} - ${death}`;
    } else {
      return birth;
    }
  }
  
  /**
   * 性別に応じたCSSクラスを返す
   * @param {string} gender - 性別 ('M', 'F', 'U')
   * @returns {string} - CSSクラス名
   */
  getGenderClass(gender) {
    switch (gender) {
      case Gender.MALE:
        return 'male';
      case Gender.FEMALE:
        return 'female';
      default:
        return 'unknown';
    }
  }
  
  /**
   * 選択状態に応じたCSSクラスを返す
   * @param {boolean} isSelected - 選択されているかどうか
   * @returns {string} - CSSクラス名
   */
  getSelectionClass(isSelected) {
    return isSelected ? 'selected' : '';
  }
  
  render() {
    const { person, isSelected } = this.props;
    const genderClass = this.getGenderClass(person.gender);
    const selectionClass = this.getSelectionClass(isSelected);
    const lifespan = this.formatLifespan(person);
    
    return (
      <div 
        className={`person-node ${genderClass} ${selectionClass}`}
        onClick={this.handleClick}
        style={this.props.style}
      >
        <div className="name">{person.name}</div>
        {lifespan && <div className="dates">{lifespan}</div>}
      </div>
    );
  }
}

// デフォルトプロパティ
PersonNode.defaultProps = {
  isSelected: false,
  onClick: null,
  style: {}
};
