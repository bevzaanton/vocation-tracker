import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import { useAuth } from '../context/AuthContext';
import { balanceApi } from '../api/balance';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../api/balance', () => ({
    balanceApi: {
        getMyBalance: vi.fn()
    }
}));

describe('DashboardPage', () => {
    const mockUser = { name: 'John Doe', role: 'employee' };
    const mockBalances = [
        {
            id: 1,
            type_name: 'Annual Leave',
            remaining_days: 15,
            total_days: 25,
            used_days: 10
        },
        {
            id: 2,
            type_name: 'Sick Leave',
            remaining_days: 10,
            total_days: 10,
            used_days: 0
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            user: mockUser
        });
        (balanceApi.getMyBalance as any).mockResolvedValue(mockBalances);
    });

    it('renders welcome message with user name', async () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Welcome back, John Doe/i)).toBeInTheDocument();
    });

    it('renders balance cards after loading', async () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Annual Leave')).toBeInTheDocument();
            expect(screen.getByText('15')).toBeInTheDocument();
            expect(screen.getByText('Sick Leave')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });
    });

    it('renders total and used days in cards', async () => {
        render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Total: 25')).toBeInTheDocument();
            expect(screen.getByText('Used: 10')).toBeInTheDocument();
        });
    });
});
