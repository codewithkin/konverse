"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import Link from "next/link";

// Shadcn UI components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Icons ---
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" /><path d="M16.5 9.4 21 12l-4.5 2.6" /><path d="m7.5 9.4-4.5 2.6L7.5 12" /><path d="M12 21 7.5 12 12 3l4.5 9L12 21z" /></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h4" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>;
const LoaderIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M2 12h20" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;

// --- StatCard Component ---
type StatCardProps = {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'yellow' | 'green' | 'purple';
};

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
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

// --- Dashboard Component ---
function Dashboard() {
    const { data, isPending: isSessionLoading } = authClient.useSession();
    const user = data?.user;
    const router = useRouter();

    useEffect(() => {
        if (!user && !isSessionLoading) {
            router.replace("/auth/signin");
        }
    }, [user, router, isSessionLoading]);

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
                    userStores: [],
                    productsWithOrders: [],
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

    if (isLoading || isSessionLoading) {
        return (
            <section className="flex justify-center items-center h-64">
                <LoaderIcon /> Loading dashboard...
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

    const {
        totalProducts,
        totalUnitsInStock,
        lowStockItems,
        totalOrders,
        pendingOrders,
        userStores,
        productsWithOrders,
    } = dashboardData || {};

    const hasStores = userStores && userStores.length > 0;
    const hasProducts = productsWithOrders && productsWithOrders.length > 0;

    return (
        <section className="relative p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to your Dashboard, {user?.name}!</h2>

            {/* Always show Stat Cards if data is available */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Stores" value={userStores?.length || 0} icon={<StoreIcon />} color="purple" />
                <StatCard title="Total Products" value={totalProducts || 0} icon={<PackageIcon />} color="blue" />
                <StatCard title="Total Orders" value={totalOrders || 0} icon={<ShoppingCartIcon />} color="green" />
                <StatCard title="Low Stock Items" value={lowStockItems || 0} icon={<AlertTriangleIcon />} color="yellow" />
            </div>

            {/* Conditional Quick Start Guide or Product Table */}
            {!hasStores && (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center mb-8">
                    <h3 className="text-xl font-bold mb-4">Welcome! Let's Get Started!</h3>
                    <p className="text-gray-600 mb-4">It looks like you haven't created any stores yet. Your business journey begins here!</p>
                    <Button onClick={() => router.push('/stores/new')} className="bg-green-600 hover:bg-green-700 text-white flex items-center mx-auto">
                        <PlusCircleIcon className="mr-2" /> Create Your First Store
                    </Button>
                </div>
            )}

            {hasStores && !hasProducts && (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center mb-8">
                    <h3 className="text-xl font-bold mb-4">Your Store Awaits Products!</h3>
                    <p className="text-gray-600 mb-4">You have a store, but no products yet. Let's add some items to sell!</p>
                    <Button onClick={() => router.push('/products/new')} className="bg-green-600 hover:bg-green-700 text-white flex items-center mx-auto">
                        <PlusCircleIcon className="mr-2" /> Add Your First Product
                    </Button>
                </div>
            )}

            {hasStores && hasProducts && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h3 className="text-xl font-bold mb-4">Your Products</h3>
                    <Table className="min-w-full">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</TableHead>
                                <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</TableHead>
                                <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</TableHead>
                                <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</TableHead>
                                <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                                <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productsWithOrders.map((product: any) => (
                                <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="py-4 px-4 font-medium text-gray-900">{product.name}</TableCell>
                                    <TableCell className="py-4 px-4 text-gray-700">${product.price.toFixed(2)}</TableCell>
                                    <TableCell className="py-4 px-4">
                                        <Badge
                                            className={`
                                                ${product.stock < 5 ? 'bg-red-100 text-red-700 border-red-200' :
                                                product.stock < 10 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-green-100 text-green-700 border-green-200'}
                                                px-2.5 py-1 text-xs font-semibold rounded-full
                                            `}
                                        >
                                            {product.stock} in Stock
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 px-4 text-gray-700">{product._count.orders}</TableCell>
                                    <TableCell className="py-4 px-4 text-gray-700">{product.category || 'N/A'}</TableCell>
                                    <TableCell className="py-4 px-4">
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded-md shadow-sm"
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-6 text-center">
                        <Link href="/products/new" passHref>
                            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center mx-auto">
                                <PlusCircleIcon className="mr-2" /> Add New Product
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Start Guide: Only show if user does NOT have both stores AND products */}
            {(!hasStores || !hasProducts) && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h3 className="text-xl font-bold mb-4">Quick Start Guide</h3>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                        <li>Go to the <b className="text-green-600">My Products</b> tab to add your items. Use the "✨ Generate Description" button for help!</li>
                        <li>Visit the <b className="text-green-600">Chat Simulator</b> to ask questions and see how customers will interact with your products.</li>
                        <li>Share your new business WhatsApp number and start selling!</li>
                    </ol>
                </div>
            )}

            {/* Floating Add New Product Button */}
            <Button
                onClick={() => router.push('/products/new')}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 z-50 flex items-center justify-center"
                aria-label="Add New Product"
                title="Add New Product"
            >
                <PlusCircleIcon />
            </Button>
        </section>
    );
}

export default Dashboard;
