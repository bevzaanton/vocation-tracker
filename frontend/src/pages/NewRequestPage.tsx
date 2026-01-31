import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { requestApi, type VacationType } from '../api/requests';
import { Loader2 } from 'lucide-react';
import { balanceApi, type VacationBalance } from '../api/balance';

export default function NewRequestPage() {
    const { register, handleSubmit, watch } = useForm();
    const [types, setTypes] = useState<VacationType[]>([]);
    const [balances, setBalances] = useState<VacationBalance[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const selectedTypeId = watch('type_id');
    const selectedBalance = balances.find(b => b.type_id === Number(selectedTypeId));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesData, balanceData] = await Promise.all([
                    requestApi.getVacationTypes(),
                    balanceApi.getMyBalance(2025)
                ]);
                setTypes(typesData);
                setBalances(balanceData);
            } catch (error) {
                console.error('Failed to load data', error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await requestApi.createRequest({
                type_id: Number(data.type_id),
                start_date: data.start_date,
                end_date: data.end_date,
                comment: data.comment
            });
            navigate('/requests');
        } catch (error) {
            console.error('Failed to create request', error);
            alert(t('newRequest.createError'));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Layout><div>{t('common.loading')}</div></Layout>;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('newRequest.title')}</h1>

                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="type_id" className="block text-sm font-medium text-gray-700">{t('newRequest.vacationType')}</label>
                            <select
                                id="type_id"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                {...register('type_id', { required: true })}
                            >
                                <option value="">{t('newRequest.selectType')}</option>
                                {types.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedBalance && (
                            <div className="bg-blue-50 p-4 rounded-md">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">{t('newRequest.balanceInfo')}</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>{t('newRequest.balanceRemaining', { days: selectedBalance.remaining_days })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">{t('newRequest.startDate')}</label>
                                <input
                                    id="start_date"
                                    type="date"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    {...register('start_date', { required: true })}
                                />
                            </div>
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">{t('newRequest.endDate')}</label>
                                <input
                                    id="end_date"
                                    type="date"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    {...register('end_date', { required: true })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">{t('newRequest.comment')}</label>
                            <textarea
                                id="comment"
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                {...register('comment')}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/requests')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('newRequest.submitRequest')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
