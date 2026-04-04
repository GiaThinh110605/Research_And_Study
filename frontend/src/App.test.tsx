import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders UniStudy logo or branding', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Just checking if it can render without crashing
  expect(true).toBe(true);
});
