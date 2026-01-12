import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { adminApi, type PublicHoliday, type User } from '../api/admin';
import { Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'holidays' | 'users'>('holidays');
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // Holiday Form
    const { register: registerHoliday, handleSubmit: handleHolidaySubmit, reset: resetHoliday } = useForm();

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getHolidays(2025);
            setHolidays(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'holidays') fetchHolidays();
        else fetchUsers();
    }, [activeTab]);

    const onHolidaySubmit = async (data: any) => {
        try {
            await adminApi.createHoliday(data.date, data.name);
            resetHoliday();
            fetchHolidays();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Layout>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`${activeTab === 'holidays' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Manage Holidays
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Manage Users
                    </button>
                </nav>
            </div>

            {activeTab === 'holidays' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Public Holiday</h3>
                        <form onSubmit={handleHolidaySubmit(onHolidaySubmit)} className="flex gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input {...registerHoliday('name', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" placeholder="e.g. New Year" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" {...registerHoliday('date', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </button>
                        </form>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {loading ? <div className="p-4"><Loader2 className="animate-spin" /></div> : holidays.map(h => (
                                <li key={h.id} className="px-4 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{h.name}</p>
                                        <p className="text-sm text-gray-500">{h.date}</p>
                                    </div>
                                </li>
                            ))}
                            {!loading && holidays.length === 0 && <li className="p-4 text-gray-500">No holidays found.</li>}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Users Directory</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">List of all users in the system.</p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {loading ? <div className="p-4"><Loader2 className="animate-spin" /></div> : users.map(u => (
                            <li key={u.id} className="px-4 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                    {u.role}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Layout>
    );
}
