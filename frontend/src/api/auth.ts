import apiClient from './client';

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'employee' | 'manager' | 'admin';
    is_active: boolean;
    manager_id?: number | null;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const response = await apiClient.post<LoginResponse>('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },

    me: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    },
};
