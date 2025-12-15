/**
 * App Component Test
 * Basic smoke test to ensure app renders without crashing
 */

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock auth utilities
jest.mock('./utils/auth', () => ({
  getAuth: jest.fn(() => null),
  clearAuth: jest.fn(),
  getRole: jest.fn(() => null),
  getName: jest.fn(() => null)
}));

test('App renders without crashing', () => {
  render(<App />);
  // App should render login or dashboard based on auth state
  expect(document.body).toBeInTheDocument();
});
