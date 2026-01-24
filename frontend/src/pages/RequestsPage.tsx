import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import { requestApi, type VacationRequest } from '../api/requests';
import { Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export default function RequestsPage() {
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await requestApi.getRequests();
                setRequests(data);
            } catch (error) {
                console.error('Failed to fetch requests', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        return t(`requests.status.${status}`) || status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('requests.title')}</h1>
                <Link
                    to="/requests/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('requests.newRequest')}
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {requests.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">{t('requests.noRequests')}</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {requests.map((request) => (
                                <li key={request.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div
                                                    className="flex-shrink-0 h-2.5 w-2.5 rounded-full mr-2"
                                                    style={{ backgroundColor: request.type_color }}
                                                />
                                                <p className="text-sm font-medium text-blue-600 truncate">
                                                    {request.type_name}
                                                </p>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(request.status))}>
                                                    {getStatusText(request.status)}
                                                </p>
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
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    {t('common.submittedOn')} {format(new Date(request.created_at), 'MMM d, yyyy')}
                                                </p>
                                            </div>
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
