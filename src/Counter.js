import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount(count + 1);
    };

    const decrement = () => {
        setCount(count - 1);
    };

    const reset = () => {
        setCount(0);
    };

    return (
        <div className="container">
            <h1>Reactサンプルアプリケーション</h1>
            <p>これは簡単なカウンターアプリケーションです。</p>
            
            <div className="counter">
                現在のカウント: {count}
            </div>
            
            <div>
                <button onClick={increment}>増加</button>
                <button onClick={decrement}>減少</button>
                <button onClick={reset}>リセット</button>
            </div>
        </div>
    );
}

export default Counter; 