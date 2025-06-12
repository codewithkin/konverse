"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type StatCardProps = {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'yellow' | 'green';
};

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
    };
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-semibold">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" /><path d="M16.5 9.4 21 12l-4.5 2.6" /><path d="m7.5 9.4-4.5 2.6L7.5 12" /><path d="M12 21 7.5 12 12 3l4.5 9L12 21z" /></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h4" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

function Dashboard() {
    const { data, isPending } = authClient.useSession();
    const user = data?.user;

    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['dashboardData', user?.id],
        queryFn: async () => {
            if (!user?.id) {
                return {
                    totalProducts: 0,
                    totalUnitsInStock: 0,
                    lowStockItems: 0,
                    totalOrders: 0,
                    pendingOrders: 0,
                };
            }
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            return response.json();
        },
        enabled: !!user?.id,
    });

    console.log("User data: ", user);

    if (isLoading || isPending) {
        return (
            <section className="flex justify-center items-center h-64">
                <SpinnerIcon />
            </section>
        );
    }

    if (error) {
        return (
            <section className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
                Error: {error.message}
            </section>
        );
    }

    const { totalProducts, totalUnitsInStock, lowStockItems, totalOrders, pendingOrders } = dashboardData || {};

    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to your Store, {user?.name}!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Products" value={totalProducts} icon={<PackageIcon />} color="blue" />
                <StatCard title="Total Units in Stock" value={totalUnitsInStock} icon={<ArchiveIcon />} color="green" />
                <StatCard title="Low Stock Items" value={lowStockItems} icon={<AlertTriangleIcon />} color="yellow" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Quick Start Guide</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                    <li>Go to the <b className="text-green-600">My Products</b> tab to add your items. Use the "✨ Generate Description" button for help!</li>
                    <li>Visit the <b className="text-green-600">Chat Simulator</b> to ask questions and see how customers will interact with your products.</li>
                    <li>Share your new business WhatsApp number and start selling!</li>
                </ol>
            </div>
        </section>
    );
}

export default Dashboard;
