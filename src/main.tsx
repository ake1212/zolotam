import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import { AppProvider } from './store/AppContext';
import { App } from './App';

// HashRouter keeps deep links working on any static host (including the
// single-file preview build) with no server-side rewrite rules.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
