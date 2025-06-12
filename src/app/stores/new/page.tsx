"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function NewStorePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const userId = session?.user?.id;

    const [storeName, setStoreName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createStoreMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create store');
            }
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userStores', userId] });
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
            alert(`Store "${data.name}" created successfully!`);
            router.push('/dashboard');
        },
        onError: (err) => {
            setError(`Error creating store: ${err.message}`);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!userId) {
            setError("User not authenticated. Please sign in.");
            router.push('/auth/signin');
            return;
        }

        if (!storeName.trim()) {
            setError("Store name cannot be empty.");
            return;
        }

        createStoreMutation.mutate(storeName.trim());
    };

    if (isSessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <SpinnerIcon /> Loading session...
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl text-red-600">You must be logged in to create a store.</p>
                <Button onClick={() => router.push('/auth/signin')} className="ml-4 bg-green-600 hover:bg-green-700 text-white">Sign In</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Store</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}
                {createStoreMutation.isError && !error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                        {createStoreMutation.error?.message || "An unexpected error occurred during store creation."}
                    </div>
                )}
                {createStoreMutation.isSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                        Store created successfully! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="storeName" className="block text-sm font-bold text-gray-700 mb-2">Store Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="storeName"
                            name="storeName"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                            placeholder="e.g., My Awesome Shop"
                        />
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createStoreMutation.isPending || !storeName.trim()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {createStoreMutation.isPending && <Loader2 className='animate-spin' />}
                            {createStoreMutation.isPending ? 'Creating Store...' : 'Create Store'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
