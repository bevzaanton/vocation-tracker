import apiClient from './client';

export interface VacationRequest {
    id: number;
    user_id: number;
    user_name: string;
    type_id: number;
    type_name: string;
    type_color: string;
    start_date: string;
    end_date: string;
    business_days: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    comment: string | null;
    reviewer_name: string | null;
    reviewer_comment: string | null;
    created_at: string;
}

export interface CreateRequestPayload {
    type_id: number;
    start_date: string;
    end_date: string;
    comment?: string;
}

export interface VacationType {
    id: number;
    name: string;
    is_paid: boolean;
    default_days: number;
    color: string;
}

export const requestApi = {
    getRequests: async (): Promise<VacationRequest[]> => {
        const response = await apiClient.get<VacationRequest[]>('/requests');
        return response.data;
    },

    createRequest: async (data: CreateRequestPayload): Promise<VacationRequest> => {
        const response = await apiClient.post<VacationRequest>('/requests', data);
        return response.data;
    },

    approveRequest: async (requestId: number): Promise<VacationRequest> => {
        const response = await apiClient.post<VacationRequest>(`/requests/${requestId}/approve`);
        return response.data;
    },

    rejectRequest: async (requestId: number): Promise<VacationRequest> => {
        const response = await apiClient.post<VacationRequest>(`/requests/${requestId}/reject`);
        return response.data;
    },

    cancelRequest: async (requestId: number): Promise<VacationRequest> => {
        const response = await apiClient.post<VacationRequest>(`/requests/${requestId}/cancel`);
        return response.data;
    },

    getVacationTypes: async (): Promise<VacationType[]> => {
        const response = await apiClient.get<VacationType[]>('/vacation-types/');
        return response.data;
    }
};
