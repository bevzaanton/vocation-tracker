import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import { adminApi, type PublicHoliday, type User, type UserBalance } from '../api/admin';
import { Loader2, Plus, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface HolidayFormData {
    date: string;
    name: string;
}

interface UserFormData {
    name: string;
    email: string;
    password?: string;
    role: string;
    manager_id?: string | number | null;
    start_date?: string | null;
    approver_ids?: string[];
    is_active?: boolean;
}

interface BalanceFormData {
    total_days: string | number;
    used_days: string | number;
    reason?: string;
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'holidays' | 'users' | 'balances'>('holidays');
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const { register: registerHoliday, handleSubmit: handleHolidaySubmit, reset: resetHoliday } = useForm<HolidayFormData>();
    const { register: registerUser, handleSubmit: handleUserSubmit, reset: resetUser, setValue } = useForm<UserFormData>();
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Balance adjustment state
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
    const [balanceYear, setBalanceYear] = useState<number>(2025);
    const { register: registerBalance, handleSubmit: handleBalanceSubmit, reset: resetBalance, setValue: setBalanceValue } = useForm<BalanceFormData>();
    const [adjustingBalance, setAdjustingBalance] = useState<UserBalance | null>(null);

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

    const fetchUserBalance = useCallback(async (userId: number) => {
        setLoading(true);
        try {
            const data = await adminApi.getUserBalance(userId, balanceYear);
            setUserBalances(data);
        } catch (e) {
            console.error(e);
            setUserBalances([]);
        } finally {
            setLoading(false);
        }
    }, [balanceYear]);

    useEffect(() => {
        if (activeTab === 'holidays') fetchHolidays();
        else if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'balances') {
            fetchUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedUserId) {
            fetchUserBalance(selectedUserId);
        }
    }, [selectedUserId, fetchUserBalance]);

    const onHolidaySubmit = async (data: HolidayFormData) => {
        try {
            await adminApi.createHoliday(data.date, data.name);
            resetHoliday();
            fetchHolidays();
        } catch (e) {
            console.error(e);
        }
    };

    const onUserSubmit = async (data: UserFormData) => {
        try {
            const managerId = data.manager_id ? parseInt(String(data.manager_id)) : null;
            const approverIds = data.approver_ids
                ? (Array.isArray(data.approver_ids) ? data.approver_ids.map((id: string) => parseInt(id)) : [parseInt(data.approver_ids[0])])
                : [];

            if (editingUser) {
                const updatePayload = {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    is_active: data.is_active,
                    manager_id: managerId,
                    start_date: data.start_date || undefined,
                    approver_ids: approverIds,
                    ...(data.password ? { password: data.password } : {})
                };
                await adminApi.updateUser(editingUser.id, updatePayload);
                alert(t('admin.users.updateSuccess'));
                setEditingUser(null);
            } else {
                const createPayload = {
                    name: data.name,
                    email: data.email,
                    password: data.password || '',
                    role: data.role,
                    manager_id: managerId,
                    start_date: data.start_date || undefined,
                    approver_ids: approverIds
                };
                await adminApi.createUser(createPayload);
                alert(t('admin.users.createSuccess'));
            }
            resetUser();
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert(t('admin.users.saveError'));
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setValue('name', user.name);
        setValue('email', user.email);
        setValue('role', user.role);
        setValue('manager_id', user.manager_id ? String(user.manager_id) : undefined);
        setValue('start_date', user.start_date ?? undefined);
        setValue('is_active', user.is_active);

        if (user.approvers) {
            setValue('approver_ids', user.approvers.map(u => u.id.toString()));
        }
    };

    const handleDelete = async (user: User) => {
        if (window.confirm(t('admin.users.deleteConfirm', { name: user.name }))) {
            try {
                await adminApi.deleteUser(user.id);
                fetchUsers();
            } catch (e) {
                console.error(e);
                alert(t('admin.users.saveError'));
            }
        }
    };

    const cancelEdit = () => {
        setEditingUser(null);
        resetUser();
    };

    const handleSelectUserForBalance = (userId: number) => {
        setSelectedUserId(userId);
        setAdjustingBalance(null);
        resetBalance();
    };

    const handleEditBalance = (balance: UserBalance) => {
        setAdjustingBalance(balance);
        setBalanceValue('total_days', String(balance.total_days));
        setBalanceValue('used_days', String(balance.used_days));
        setBalanceValue('reason', '');
    };

    const cancelBalanceEdit = () => {
        setAdjustingBalance(null);
        resetBalance();
    };

    const onBalanceSubmit = async (data: BalanceFormData) => {
        if (!selectedUserId || !adjustingBalance) return;

        try {
            await adminApi.adjustUserBalance(selectedUserId, {
                type_id: adjustingBalance.type_id,
                year: balanceYear,
                total_days: parseInt(String(data.total_days)),
                used_days: parseInt(String(data.used_days)),
                reason: data.reason || undefined
            });
            alert(t('admin.balances.adjustSuccess'));
            setAdjustingBalance(null);
            resetBalance();
            fetchUserBalance(selectedUserId);
        } catch (e) {
            console.error(e);
            alert(t('admin.balances.adjustError'));
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
                        {t('admin.holidays.tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {t('admin.users.tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('balances')}
                        className={`${activeTab === 'balances' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {t('admin.balances.tab')}
                    </button>
                </nav>
            </div>

            {activeTab === 'holidays' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.holidays.addTitle')}</h3>
                        <form onSubmit={handleHolidaySubmit(onHolidaySubmit)} className="flex gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('admin.holidays.name')}</label>
                                <input {...registerHoliday('name', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" placeholder={t('admin.holidays.namePlaceholder')} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('admin.holidays.date')}</label>
                                <input type="date" {...registerHoliday('date', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>
                            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-1" /> {t('common.add')}
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
                            {!loading && holidays.length === 0 && <li className="p-4 text-gray-500">{t('admin.holidays.noHolidays')}</li>}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{editingUser ? t('admin.users.editTitle') : t('admin.users.addTitle')}</h3>
                            {editingUser && (
                                <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                                    <X className="h-4 w-4 mr-1" /> {t('admin.users.cancelEdit')}
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleUserSubmit(onUserSubmit)} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.name')}</label>
                                <input {...registerUser('name', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.email')}</label>
                                <input type="email" {...registerUser('email', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.password')} {editingUser && t('admin.users.passwordHint')}</label>
                                <input type="password" {...registerUser('password', { required: !editingUser })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.role')}</label>
                                <select {...registerUser('role', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                                    <option value="employee">{t('admin.users.roleEmployee')}</option>
                                    <option value="manager">{t('admin.users.roleManager')}</option>
                                    <option value="admin">{t('admin.users.roleAdmin')}</option>
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.startWorkingDate')}</label>
                                <input type="date" {...registerUser('start_date')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                <p className="mt-1 text-xs text-gray-500">{t('admin.users.startDateHint')}</p>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.managerId')}</label>
                                <input type="number" {...registerUser('manager_id')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" placeholder={t('admin.users.managerIdPlaceholder')} />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">{t('admin.users.approvers')}</label>
                                <select multiple {...registerUser('approver_ids')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm h-32">
                                    {users.filter(u => u.id !== editingUser?.id).map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">{t('admin.users.approversHint')}</p>
                            </div>

                            {editingUser && (
                                <div className="sm:col-span-3 flex items-center">
                                    <input type="checkbox" {...registerUser('is_active')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <label className="ml-2 block text-sm text-gray-900">{t('admin.users.isActive')}</label>
                                </div>
                            )}

                            <div className="sm:col-span-6 flex justify-end">
                                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                    {editingUser ? <Pencil className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />} {editingUser ? t('admin.users.updateUser') : t('admin.users.createUser')}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('admin.users.directoryTitle')}</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('admin.users.directoryDescription')}</p>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {loading ? <div className="p-4"><Loader2 className="animate-spin" /></div> : users.map(u => (
                                <li key={u.id} className="px-4 py-4 flex items-center justify-between">
                                    <div className={u.is_active ? '' : 'opacity-50 line-through'}>
                                        <p className="text-sm font-medium text-gray-900">{u.name} {!u.is_active && `(${t('admin.users.inactive')})`}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                        {u.approvers && u.approvers.length > 0 && (
                                            <p className="text-xs text-gray-400">{t('admin.users.approvers')}: {u.approvers.map(a => a.name).join(', ')}</p>
                                        )}
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {u.role}
                                    </span>
                                    <div className="flex space-x-2 ml-4">
                                        <button onClick={() => handleEdit(u)} className="text-gray-400 hover:text-blue-500">
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(u)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'balances' && (
                <div className="space-y-6">
                    {/* User and Year Selection */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.balances.title')}</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('admin.balances.selectUser')}</label>
                                <select
                                    value={selectedUserId || ''}
                                    onChange={(e) => handleSelectUserForBalance(parseInt(e.target.value))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                >
                                    <option value="">{t('admin.balances.selectUserPlaceholder')}</option>
                                    {users.filter(u => u.is_active).map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('admin.balances.year')}</label>
                                <select
                                    value={balanceYear}
                                    onChange={(e) => setBalanceYear(parseInt(e.target.value))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                >
                                    <option value={2024}>2024</option>
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                </select>
                            </div>
                            {selectedUserId && (
                                <div className="flex items-end">
                                    <button
                                        onClick={() => fetchUserBalance(selectedUserId)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" /> {t('admin.balances.refresh')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Balance Display and Adjustment */}
                    {selectedUserId && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {t('admin.balances.balanceFor', { name: users.find(u => u.id === selectedUserId)?.name })}
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">{t('admin.balances.balanceDescription')}</p>
                            </div>

                            {loading ? (
                                <div className="p-4"><Loader2 className="animate-spin" /></div>
                            ) : userBalances.length === 0 ? (
                                <div className="p-4 text-gray-500">{t('admin.balances.noBalances')}</div>
                            ) : (
                                <div className="border-t border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.balances.leaveType')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.balances.totalDays')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.balances.usedDays')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.balances.remainingDays')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.edit')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {userBalances.map(balance => (
                                                <tr key={balance.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{balance.type_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{balance.total_days}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{balance.used_days}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`font-semibold ${balance.remaining_days < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {balance.remaining_days}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button onClick={() => handleEditBalance(balance)} className="text-blue-600 hover:text-blue-800">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Balance Adjustment Form */}
                    {adjustingBalance && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {t('admin.balances.adjustTitle', { type: adjustingBalance.type_name })}
                                </h3>
                                <button onClick={cancelBalanceEdit} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                                    <X className="h-4 w-4 mr-1" /> {t('common.cancel')}
                                </button>
                            </div>
                            <form onSubmit={handleBalanceSubmit(onBalanceSubmit)} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">{t('admin.balances.totalDays')}</label>
                                    <input
                                        type="number"
                                        {...registerBalance('total_days', { required: true, min: 0 })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">{t('admin.balances.usedDays')}</label>
                                    <input
                                        type="number"
                                        {...registerBalance('used_days', { required: true, min: 0 })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">{t('admin.balances.reason')}</label>
                                    <input
                                        type="text"
                                        {...registerBalance('reason')}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                                        placeholder={t('admin.balances.reasonPlaceholder')}
                                    />
                                </div>
                                <div className="sm:col-span-6 flex justify-end">
                                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                        <RefreshCw className="h-4 w-4 mr-1" /> {t('admin.balances.adjustButton')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
