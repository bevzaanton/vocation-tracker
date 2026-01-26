import apiClient from './client';

export interface PublicHoliday {
    id: number;
    date: string;
    name: string;
    country_code: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
    manager_id?: number | null;
    start_date?: string | null;
    approvers?: User[];
}

export interface VacationType {
    id: number;
    name: string;
    is_paid: boolean;
    default_days: number;
    color: string;
}

export interface BalanceAdjustment {
    type_id: number;
    year?: number;
    total_days?: number;
    used_days?: number;
    reason?: string;
}

export interface BalanceAdjustmentResponse {
    id: number;
    user_id: number;
    type_id: number;
    type_name: string;
    year: number;
    total_days: number;
    used_days: number;
    remaining_days: number;
    adjusted_by: string;
    reason?: string;
}

export interface UserBalance {
    id: number;
    type_id: number;
    type_name: string;
    year: number;
    total_days: number;
    used_days: number;
    remaining_days: number;
}

export interface CreateUserPayload {
    email: string;
    name: string;
    password: string;
    role: string;
    is_active?: boolean;
    manager_id?: number | null;
    start_date?: string | null;
    approver_ids?: number[];
}

export interface UpdateUserPayload {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    is_active?: boolean;
    manager_id?: number | null;
    start_date?: string | null;
    approver_ids?: number[];
}

export const adminApi = {
    getHolidays: async (year: number): Promise<PublicHoliday[]> => {
        const response = await apiClient.get<PublicHoliday[]>(`/holidays?year=${year}`);
        return response.data;
    },

    createHoliday: async (date: string, name: string): Promise<PublicHoliday> => {
        const response = await apiClient.post<PublicHoliday>('/holidays', {
            date,
            name,
            country_code: 'US' // Defaulting for simple MVP
        });
        return response.data;
    },

    getUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    createUser: async (user: CreateUserPayload): Promise<User> => {
        const response = await apiClient.post<User>('/users', user);
        return response.data;
    },

    updateUser: async (id: number, user: UpdateUserPayload): Promise<User> => {
        const response = await apiClient.put<User>(`/users/${id}`, user);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    getVacationTypes: async (): Promise<VacationType[]> => {
        const response = await apiClient.get<VacationType[]>('/vacation-types/');
        return response.data;
    },

    getUserBalance: async (userId: number, year: number = 2025): Promise<UserBalance[]> => {
        const response = await apiClient.get<UserBalance[]>(`/users/${userId}/balance?year=${year}`);
        return response.data;
    },

    adjustUserBalance: async (userId: number, adjustment: BalanceAdjustment): Promise<BalanceAdjustmentResponse> => {
        const response = await apiClient.put<BalanceAdjustmentResponse>(
            `/users/${userId}/balance/adjust`,
            adjustment
        );
        return response.data;
    }
};
