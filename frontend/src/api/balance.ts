import apiClient from './client';

export interface VacationBalance {
    id: number;
    type_id: number;
    type_name: string;
    year: number;
    total_days: number;
    used_days: number;
    remaining_days: number;
}

export const balanceApi = {
    getMyBalance: async (year: number): Promise<VacationBalance[]> => {
        // We don't have a direct endpoint for "my balance" but we can implement it or user /users/{id}/balance
        // Let's assume we fetch current user ID from context or token decoding, 
        // BUT strictly speaking the backend API spec said: GET /users/{id}/balance
        // We need the user ID. For now let's assume the frontend passes it or we add a 'me/balance' endpoint.
        // Let's add 'me/balance' or just use the user ID we have.

        // Actually the spec said:
        // GET /users/{id}/balance -> Auth: admin, manager, or self

        const { data } = await apiClient.get('/auth/me'); // simple way to get ID if not stored
        const response = await apiClient.get<VacationBalance[]>(`/users/${data.id}/balance?year=${year}`);
        return response.data;
    },

    getUserBalance: async (userId: number, year: number): Promise<VacationBalance[]> => {
        const response = await apiClient.get<VacationBalance[]>(`/users/${userId}/balance?year=${year}`);
        return response.data;
    }
};
