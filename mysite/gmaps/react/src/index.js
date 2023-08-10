import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import AppRoutes from './AppRoutes';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './desktop-index.css'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AppRoutes />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
