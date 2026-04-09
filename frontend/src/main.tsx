import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initTheme } from './theme.ts';
import { initPosthog } from './posthog.ts';

initTheme();

const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;
if (posthogApiKey) {
  initPosthog(posthogApiKey, posthogHost ? {api_host: posthogHost} : undefined);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
