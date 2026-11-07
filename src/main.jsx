import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles/index.css';
import App from './App.jsx';
import { ENV } from './config/env.js';

// 가짜 API(MSW)는 VITE_USE_MOCK=true일 때만 켜요. 실제 서버에 붙일 땐 .env에서 false로 바꿔요.
async function enableMocking() {
  if (!ENV.useMock) return;
  const { worker } = await import('./mocks/browser.js');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
