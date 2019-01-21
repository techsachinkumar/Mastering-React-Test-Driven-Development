import React from 'react';
import ReactDOM from 'react-dom';
import { StoreContext } from 'redux-react-hook';
import { configureStoreWithLocalStorage } from './store';
import { App } from './App';

const store = configureStoreWithLocalStorage();
store.dispatch({ type: 'TRY_START_WATCHING' });

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root'));
