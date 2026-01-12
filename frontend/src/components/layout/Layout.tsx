import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    CalendarDays,
    PlusCircle,
    LogOut,
    Users,
    Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'My Requests', href: '/requests', icon: CalendarDays },
        { name: 'New Request', href: '/requests/new', icon: PlusCircle },
        { name: 'Team Calendar', href: '/calendar', icon: Users },
    ];

    if (user?.role === 'manager' || user?.role === 'admin') {
        navigation.push({ name: 'Team Approvals', href: '/approvals', icon: Users });
    }

    if (user?.role === 'admin') {
        navigation.push({ name: 'Admin Settings', href: '/admin', icon: Settings });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col fixed h-full bg-white border-r">
                <div className="flex-1 flex flex-col pt-5 pb-4">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <h1 className="text-xl font-bold text-gray-800">Vacation Manager</h1>
                    </div>
                    <nav className="mt-8 flex-1 px-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    location.pathname === item.href
                                        ? 'bg-gray-100 text-gray-900 icon-blue-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        location.pathname === item.href ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                                        'mr-3 flex-shrink-0 h-6 w-6'
                                    )}
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="inline-block h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="font-medium text-blue-800">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    {user?.name}
                                </p>
                                <button
                                    onClick={logout}
                                    className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                                >
                                    <LogOut className="mr-1 h-3 w-3" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex-1 flex flex-col w-full">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
