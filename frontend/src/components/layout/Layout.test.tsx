import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Layout from './Layout';
import { useAuth } from '../../context/AuthContext';

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('Layout Component', () => {
    it('renders the application title', () => {
        (useAuth as any).mockReturnValue({
            user: { name: 'John Doe', role: 'employee' },
            logout: vi.fn()
        });

        render(
            <MemoryRouter>
                <Layout>
                    <div>Test Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.getByText('Vacation Manager')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders navigation links for employee', () => {
        (useAuth as any).mockReturnValue({
            user: { name: 'John Doe', role: 'employee' },
            logout: vi.fn()
        });

        render(
            <MemoryRouter>
                <Layout>
                    <div>Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('My Requests')).toBeInTheDocument();
        expect(screen.queryByText('Team Approvals')).not.toBeInTheDocument();
        expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument();
    });

    it('renders Team Approvals link for manager', () => {
        (useAuth as any).mockReturnValue({
            user: { name: 'Manager User', role: 'manager' },
            logout: vi.fn()
        });

        render(
            <MemoryRouter>
                <Layout>
                    <div>Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.getByText('Team Approvals')).toBeInTheDocument();
        expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument();
    });

    it('renders Admin Settings link for admin', () => {
        (useAuth as any).mockReturnValue({
            user: { name: 'Admin User', role: 'admin' },
            logout: vi.fn()
        });

        render(
            <MemoryRouter>
                <Layout>
                    <div>Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.getByText('Team Approvals')).toBeInTheDocument();
        expect(screen.getByText('Admin Settings')).toBeInTheDocument();
    });
});
