/**
 * 家系図アプリケーションで使用する定数を定義するモジュール
 */

// 性別の定数
const Gender = {
    MALE: 'M',
    FEMALE: 'F',
    UNKNOWN: 'U',
    
    // 文字列から性別定数を取得するユーティリティメソッド
    fromString: function(value) {
        if (!value) return this.UNKNOWN;
        
        const upperValue = value.toUpperCase();
        if (upperValue === 'M' || value === 'male') {
            return this.MALE;
        } else if (upperValue === 'F' || value === 'female') {
            return this.FEMALE;
        } else {
            return this.UNKNOWN;
        }
    },
    
    // 性別定数からラベルを取得するユーティリティメソッド
    getLabel: function(value) {
        switch(value) {
            case this.MALE: return '男性';
            case this.FEMALE: return '女性';
            default: return '不明';
        }
    }
};

// レイアウト関連の定数
const LayoutConstants = {
    // ノードの推定サイズ
    NODE_WIDTH_ESTIMATE: 150,
    NODE_HEIGHT_ESTIMATE: 80,
    
    // 配置間隔
    NODE_VERTICAL_SPACING: 100,     // 世代間の垂直間隔
    PARENT_HORIZONTAL_SPACING: 50,  // 夫婦間の水平間隔
    CHILD_HORIZONTAL_SPACING: 30,   // 兄弟間の水平間隔
    
    // 接続線の長さ
    VERTICAL_CONNECTOR_LENGTH: 40,  // 親子接続線の垂直部分の長さ
};

// アプリケーションの設定
const AppConfig = {
    VERSION: '0.1.0',
    APP_NAME: '家系図アプリケーション',
};
