  import { StrictMode } from 'react';
  import { createRoot } from 'react-dom/client';
  import { BrowserRouter } from 'react-router-dom';
  import { HelmetProvider } from 'react-helmet-async';
  import App from './App.tsx';
  import './index.css';
  import './i18n/config';

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* @ts-expect-error - HelmetProvider type mismatch with React 19 */}
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );
  