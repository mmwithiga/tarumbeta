
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';  // ← THIS IS THE CSS IMPORT!
import App from './App';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);