import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Design tokens FIRST
import './styles/tokens.css';
// 2. Reset + base SECOND
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);