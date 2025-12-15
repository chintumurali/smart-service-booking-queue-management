/**
 * US-14: Usability Validation Testing
 * Tests to ensure core actions are intuitive and users can complete bookings
 * Assigned to: Murali
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CustomerDashboard from '../pages/CustomerDashboard';
import ProviderDashboard from '../pages/ProviderDashboard';
import Register from '../pages/Register';
import Login from '../pages/Login';
import { api } from '../api/client';

// Mock the API client
jest.mock('../api/client', () => ({
  api: jest.fn()
}));

describe('US-14: Usability Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration Flow Usability', () => {
    test('Registration form should have all required fields visible', () => {
      const mockOnDone = jest.fn();
      render(<Register onDone={mockOnDone} />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('User should see clear error message on registration failure', async () => {
      api.mockRejectedValueOnce(new Error('Email already used'));
      const mockOnDone = jest.fn();
      
      render(<Register onDone={mockOnDone} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already used/i)).toBeInTheDocument();
      });
    });

    test('User should see success message on successful registration', async () => {
      api.mockResolvedValueOnce({});
      const mockOnDone = jest.fn();
      
      render(<Register onDone={mockOnDone} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registered successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Login Flow Usability', () => {
    test('Login form should have email and password fields', () => {
      const mockOnLoggedIn = jest.fn();
      render(<Login onLoggedIn={mockOnLoggedIn} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('User should see error message for invalid login', async () => {
      api.mockRejectedValueOnce(new Error('Invalid credentials'));
      const mockOnLoggedIn = jest.fn();
      
      render(<Login onLoggedIn={mockOnLoggedIn} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Customer Dashboard Usability', () => {
    test('Customer should see service selection dropdown', async () => {
      const mockServices = [
        { id: '1', title: 'Service 1', provider: { fullName: 'Provider 1' } },
        { id: '2', title: 'Service 2', provider: { fullName: 'Provider 2' } }
      ];

      api.mockImplementation((endpoint) => {
        if (endpoint === '/services') {
          return Promise.resolve(mockServices);
        }
        if (endpoint === '/bookings/mine') {
          return Promise.resolve([]);
        }
      });

      render(<CustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/select service/i)).toBeInTheDocument();
      });
    });

    test('Customer should see date/time picker for booking', async () => {
      api.mockImplementation((endpoint) => {
        if (endpoint === '/services') return Promise.resolve([]);
        if (endpoint === '/bookings/mine') return Promise.resolve([]);
      });

      render(<CustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByLabelText(/date & time/i)).toBeInTheDocument();
      });
    });

    test('Customer should see "Book Now" button', async () => {
      api.mockImplementation((endpoint) => {
        if (endpoint === '/services') return Promise.resolve([]);
        if (endpoint === '/bookings/mine') return Promise.resolve([]);
      });

      render(<CustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
      });
    });

    test('Customer should see success message after creating booking', async () => {
      const mockServices = [
        { id: '1', title: 'Service 1', provider: { fullName: 'Provider 1' } }
      ];

      api.mockImplementation((endpoint, options) => {
        if (endpoint === '/services') {
          return Promise.resolve(mockServices);
        }
        if (endpoint === '/bookings/mine') {
          return Promise.resolve([]);
        }
        if (endpoint === '/bookings' && options?.method === 'POST') {
          return Promise.resolve({ id: '1', queueNumber: 1 });
        }
      });

      render(<CustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/select service/i)).toBeInTheDocument();
      });

      const serviceSelect = screen.getByLabelText(/service/i);
      const dateInput = screen.getByLabelText(/date & time/i);
      const bookButton = screen.getByRole('button', { name: /book now/i });

      fireEvent.change(serviceSelect, { target: { value: '1' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-31T10:00' } });
      fireEvent.click(bookButton);

      await waitFor(() => {
        expect(screen.getByText(/booking created/i)).toBeInTheDocument();
      });
    });

    test('Customer should see their bookings with queue numbers', async () => {
      const mockBookings = [
        {
          id: '1',
          service: { title: 'Service 1' },
          date: new Date().toISOString(),
          queueNumber: 1,
          status: 'WAITING'
        }
      ];

      api.mockImplementation((endpoint) => {
        if (endpoint === '/services') return Promise.resolve([]);
        if (endpoint === '/bookings/mine') return Promise.resolve(mockBookings);
      });

      render(<CustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/service 1/i)).toBeInTheDocument();
        expect(screen.getByText(/#1/i)).toBeInTheDocument();
        expect(screen.getByText(/waiting/i)).toBeInTheDocument();
      });
    });

    test('Customer should see helpful message when no bookings exist', async () => {
      api.mockImplementation((endpoint) => {
        if (endpoint === '/services') return Promise.resolve([]);
        if (endpoint === '/bookings/mine') return Promise.resolve([]);
      });

      render(<CustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/no bookings yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Provider Dashboard Usability', () => {
    test('Provider should see service creation form', async () => {
      api.mockImplementation((endpoint) => {
        if (endpoint === '/services/mine') return Promise.resolve([]);
        if (endpoint === '/bookings/provider') return Promise.resolve([]);
      });

      render(<ProviderDashboard />);

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add service/i })).toBeInTheDocument();
      });
    });

    test('Provider should see success message after creating service', async () => {
      api.mockImplementation((endpoint, options) => {
        if (endpoint === '/services/mine') return Promise.resolve([]);
        if (endpoint === '/bookings/provider') return Promise.resolve([]);
        if (endpoint === '/services' && options?.method === 'POST') {
          return Promise.resolve({ id: '1', title: 'New Service' });
        }
      });

      render(<ProviderDashboard />);

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const submitButton = screen.getByRole('button', { name: /add service/i });

      fireEvent.change(titleInput, { target: { value: 'New Service' } });
      fireEvent.change(descriptionInput, { target: { value: 'Service Description' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/service created/i)).toBeInTheDocument();
      });
    });

    test('Provider should see their services list', async () => {
      const mockServices = [
        { id: '1', title: 'Service 1', description: 'Desc 1', active: true },
        { id: '2', title: 'Service 2', description: 'Desc 2', active: true }
      ];

      api.mockImplementation((endpoint) => {
        if (endpoint === '/services/mine') return Promise.resolve(mockServices);
        if (endpoint === '/bookings/provider') return Promise.resolve([]);
      });

      render(<ProviderDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/service 1/i)).toBeInTheDocument();
        expect(screen.getByText(/service 2/i)).toBeInTheDocument();
      });
    });

    test('Provider should see bookings queue with customer information', async () => {
      const mockBookings = [
        {
          id: '1',
          customer: { fullName: 'John Doe' },
          service: { title: 'Service 1' },
          date: new Date().toISOString(),
          queueNumber: 1,
          status: 'WAITING'
        }
      ];

      api.mockImplementation((endpoint) => {
        if (endpoint === '/services/mine') return Promise.resolve([]);
        if (endpoint === '/bookings/provider') return Promise.resolve(mockBookings);
      });

      render(<ProviderDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/service 1/i)).toBeInTheDocument();
        expect(screen.getByText(/#1/i)).toBeInTheDocument();
      });
    });

    test('Provider should be able to update booking status', async () => {
      const mockBookings = [
        {
          id: '1',
          customer: { fullName: 'John Doe' },
          service: { title: 'Service 1' },
          date: new Date().toISOString(),
          queueNumber: 1,
          status: 'WAITING'
        }
      ];

      api.mockImplementation((endpoint, options) => {
        if (endpoint === '/services/mine') return Promise.resolve([]);
        if (endpoint === '/bookings/provider') return Promise.resolve(mockBookings);
        if (endpoint.includes('/status') && options?.method === 'PATCH') {
          return Promise.resolve({ ...mockBookings[0], status: 'SERVING' });
        }
      });

      render(<ProviderDashboard />);

      await waitFor(() => {
        const statusSelect = screen.getByDisplayValue(/waiting/i);
        expect(statusSelect).toBeInTheDocument();
        
        fireEvent.change(statusSelect, { target: { value: 'SERVING' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/status updated/i)).toBeInTheDocument();
      });
    });

    test('Provider should see helpful message when no bookings exist', async () => {
      api.mockImplementation((endpoint) => {
        if (endpoint === '/services/mine') return Promise.resolve([]);
        if (endpoint === '/bookings/provider') return Promise.resolve([]);
      });

      render(<ProviderDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/no bookings yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Message Clarity', () => {
    test('Error messages should be user-friendly and visible', async () => {
      api.mockRejectedValueOnce(new Error('Network error'));
      const mockOnDone = jest.fn();
      
      render(<Register onDone={mockOnDone} />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/network error/i);
        expect(errorMessage).toBeInTheDocument();
        // Check that error message has visible styling
        expect(errorMessage).toBeVisible();
      });
    });
  });
});

