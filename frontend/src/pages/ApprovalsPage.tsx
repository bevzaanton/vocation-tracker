import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import { requestApi, type VacationRequest } from '../api/requests';
import apiClient from '../api/client';
import { Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const fetchRequests = async () => {
        try {
            const data = await requestApi.getRequests();
            const pending = data.filter(r => r.status === 'pending');
            setRequests(pending);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await apiClient.post(`/requests/${id}/approve`);
            fetchRequests();
        } catch (error) {
            console.error('Failed to approve', error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await apiClient.post(`/requests/${id}/reject`);
            fetchRequests();
        } catch (error) {
            console.error('Failed to reject', error);
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('approvals.title')}</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {requests.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">{t('approvals.noApprovals')}</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {requests.map((request) => (
                                <li key={request.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <span className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                                                        <span className="text-sm font-medium leading-none text-white">{request.user_name.charAt(0)}</span>
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                                                    <div className="text-sm text-gray-500">{request.type_name}</div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <Check className="mr-1 h-3 w-3" /> {t('common.approve')}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                                >
                                                    <X className="mr-1 h-3 w-3" /> {t('common.reject')}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    {request.business_days} {t('common.businessDays')}
                                                </p>
                                            </div>
                                            {request.comment && (
                                                <div className="mt-2 text-sm text-gray-500 italic">
                                                    "{request.comment}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </Layout>
    );
}
