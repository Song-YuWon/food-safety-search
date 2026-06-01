import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 모든 전역 CSS를 한 곳에서 import — 순서가 중요하다.
// 토큰 → base → 레이아웃 → 컴포넌트 → 애니메이션 순.
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
