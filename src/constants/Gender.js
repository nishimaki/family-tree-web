/**
 * 性別を表す定数
 */
const Gender = {
  MALE: 'M',
  FEMALE: 'F',
  UNKNOWN: 'U',

  /**
   * 文字列から性別定数に変換する
   * @param {string} value - 性別を表す文字列
   * @returns {string} - 性別定数の値
   */
  fromString: (value) => {
    if (!value) {
      return Gender.UNKNOWN;
    }
    
    const valueUpper = typeof value === 'string' ? value.toUpperCase() : '';
    
    if (valueUpper === 'M' || value === 'male') {
      return Gender.MALE;
    } else if (valueUpper === 'F' || value === 'female') {
      return Gender.FEMALE;
    } else {
      return Gender.UNKNOWN;
    }
  }
};

export default Gender;
