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

    createUser: async (user: any): Promise<User> => {
        const response = await apiClient.post<User>('/users', user);
        return response.data;
    },

    updateUser: async (id: number, user: any): Promise<User> => {
        const response = await apiClient.put<User>(`/users/${id}`, user);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    }
};
