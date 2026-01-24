import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const onSubmit = async (data: any) => {
        console.log('onSubmit called with data:', data);
        setLoading(true);
        setError('');
        try {
            console.log('Calling authApi.login...');
            const response = await authApi.login(data.email, data.password);
            console.log('Login response:', response);
            await login(response.access_token);
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(t('login.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {t('login.title')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t('login.subtitle')}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder={t('login.emailPlaceholder')}
                                {...register('email', { required: true })}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder={t('login.passwordPlaceholder')}
                                {...register('password', { required: true })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div id="login-error" className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                t('login.signIn')
                            )}
                        </button>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500">
                        <p>{t('login.demoCredentials')}</p>
                        <p>{t('login.admin')}: admin@company.com / password123</p>
                        <p>{t('login.manager')}: manager@company.com / password123</p>
                        <p>{t('login.employee')}: employee1@company.com / password123</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
