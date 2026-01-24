import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { requestApi, type VacationRequest } from '../api/requests';
import apiClient from '../api/client';
import { Loader2, Check, X, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');
    const { user } = useAuth();

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

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await apiClient.post(`/requests/${id}/approve`);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Failed to approve', error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await apiClient.post(`/requests/${id}/reject`);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Failed to reject', error);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await requestApi.cancelRequest(id);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Failed to cancel', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredRequests = filter === 'pending'
        ? requests.filter(r => r.status === 'pending')
        : requests;

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Requests</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md",
                            filter === 'pending'
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}
                    >
                        Pending Only
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md",
                            filter === 'all'
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}
                    >
                        All Requests
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {filteredRequests.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            {filter === 'pending' ? 'No pending approvals.' : 'No requests found.'}
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredRequests.map((request) => (
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
                                                    <p className={cn("mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusColor(request.status))}>
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Check className="mr-1 h-3 w-3" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                                        >
                                                            <X className="mr-1 h-3 w-3" /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {(request.status === 'approved' || request.status === 'pending') && user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleCancel(request.id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                                                    >
                                                        <XCircle className="mr-1 h-3 w-3" /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    {request.business_days} business days
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
