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
    }
};
