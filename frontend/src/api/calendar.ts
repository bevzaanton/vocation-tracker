import apiClient from './client';

export interface CalendarEntry {
    user_id: number;
    user_name: string;
    date: string;
    type_name: string;
    type_color: string;
    status: string;
}

export const calendarApi = {
    getTeamCalendar: async (startDate: string, endDate: string): Promise<CalendarEntry[]> => {
        const response = await apiClient.get<CalendarEntry[]>(`/calendar?start_date=${startDate}&end_date=${endDate}`);
        return response.data;
    }
};
