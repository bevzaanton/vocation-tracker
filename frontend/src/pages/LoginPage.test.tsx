import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../api/auth', () => ({
    authApi: {
        login: vi.fn()
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('LoginPage', () => {
    const mockLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            login: mockLogin
        });
    });

    it('renders login form', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    });

    it('shows error message on failed login', async () => {
        (authApi.login as any).mockRejectedValue(new Error('Invalid credentials'));

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), {
            target: { value: 'wrongpassword' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
        });
    });

    it('navigates to home on successful login', async () => {
        (authApi.login as any).mockResolvedValue({ access_token: 'fake-token' });

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
            target: { value: 'admin@company.com' }
        });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), {
            target: { value: 'password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('fake-token');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
