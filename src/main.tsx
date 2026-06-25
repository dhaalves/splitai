import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initApp } from './db/init';
import './index.css';

initApp().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
