import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewRequestPage from './NewRequestPage';
import { requestApi } from '../api/requests';
import { balanceApi } from '../api/balance';

// Mock dependencies
vi.mock('../api/requests', () => ({
    requestApi: {
        getVacationTypes: vi.fn(),
        createRequest: vi.fn()
    }
}));

vi.mock('../api/balance', () => ({
    balanceApi: {
        getMyBalance: vi.fn()
    }
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: { name: 'John Doe' } }))
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('NewRequestPage', () => {
    const mockTypes = [
        { id: 1, name: 'Annual Leave' },
        { id: 2, name: 'Sick Leave' }
    ];
    const mockBalances = [
        { type_id: 1, type_name: 'Annual Leave', remaining_days: 10 },
        { type_id: 2, type_name: 'Sick Leave', remaining_days: 5 }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (requestApi.getVacationTypes as any).mockResolvedValue(mockTypes);
        (balanceApi.getMyBalance as any).mockResolvedValue(mockBalances);
    });

    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <NewRequestPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it('renders form after loading data', async () => {
        render(
            <MemoryRouter>
                <NewRequestPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('New Vacation Request')).toBeInTheDocument();
            expect(screen.getByLabelText(/Vacation Type/i)).toBeInTheDocument();
        });

        expect(screen.getByText('Annual Leave')).toBeInTheDocument();
        expect(screen.getByText('Sick Leave')).toBeInTheDocument();
    });

    it('shows balance information when a type is selected', async () => {
        render(
            <MemoryRouter>
                <NewRequestPage />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByLabelText(/Vacation Type/i));

        fireEvent.change(screen.getByLabelText(/Vacation Type/i), {
            target: { value: '1' }
        });

        expect(screen.getByText(/You have 10 days remaining for this type/i)).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        (requestApi.createRequest as any).mockResolvedValue({});

        render(
            <MemoryRouter>
                <NewRequestPage />
            </MemoryRouter>
        );

        await waitFor(() => screen.getByLabelText(/Vacation Type/i));

        fireEvent.change(screen.getByLabelText(/Vacation Type/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2025-06-01' } });
        fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2025-06-05' } });
        fireEvent.change(screen.getByLabelText(/Comment/i), { target: { value: 'Going to the beach' } });

        fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

        await waitFor(() => {
            expect(requestApi.createRequest).toHaveBeenCalledWith({
                type_id: 1,
                start_date: '2025-06-01',
                end_date: '2025-06-05',
                comment: 'Going to the beach'
            });
            expect(mockNavigate).toHaveBeenCalledWith('/requests');
        });
    });
});
