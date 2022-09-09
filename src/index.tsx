import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { DirContentDescription, ServerMessage } from './types/ServerMessage';

import App from './App';
import { store } from './storage/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <App />
    </Provider>
  </React.StrictMode>
);