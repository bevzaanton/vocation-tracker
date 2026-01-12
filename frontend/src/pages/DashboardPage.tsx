import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { balanceApi, type VacationBalance } from '../api/balance';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [balances, setBalances] = useState<VacationBalance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const data = await balanceApi.getMyBalance(2025);
                setBalances(data);
            } catch (error) {
                console.error('Failed to fetch balance', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBalance();
        }
    }, [user]);

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
                <p className="text-gray-600">Here's your time off overview for 2025.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {balances.map((balance) => (
                        <div key={balance.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                {balance.type_name}
                            </h3>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">
                                    {balance.remaining_days}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">
                                    days remaining
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-sm">
                                <span className="text-gray-500">Total: {balance.total_days}</span>
                                <span className="text-gray-500">Used: {balance.used_days}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions & Recent Activity placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Requests</h2>
                    <div className="text-gray-500 text-sm">
                        No upcoming time off scheduled.
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approvals</h2>
                    <div className="text-gray-500 text-sm">
                        No requests waiting for your approval.
                    </div>
                </div>
            </div>
        </Layout>
    );
}
