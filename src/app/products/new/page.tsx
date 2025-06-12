"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { UploadButton } from '@uploadthing/react';
import { generateReactHelpers } from "@uploadthing/react";
import { OurFileRouter } from '@/app/api/uploadthing/core';
import { Button } from '@/components/ui/button';

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function NewProductPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const userId = session?.user?.id;

    const initialFormState = {
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addProductMutation = useMutation({
        mutationFn: async (newProductData: Omit<typeof formData, 'price' | 'stock'> & { price: number, stock: number, userId: string }) => {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProductData),
            });
            if (!response.ok) {
                throw new Error('Failed to add product');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            router.push('/dashboard');
        },
        onError: (err) => {
            setError(`Failed to add product: ${err.message}`);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!userId) {
            setError("User not authenticated.");
            router.push('/auth/signin');
            return;
        }

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            userId: userId,
        };

        if (!productData.name || isNaN(productData.price) || isNaN(productData.stock) || productData.stock < 0 || productData.price < 0) {
            setError("Please fill in all required fields (Name, Price, Stock) with valid numbers.");
            return;
        }

        addProductMutation.mutate(productData);
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            setError("Please enter a product name first.");
            return;
        }
        setIsGenerating(true);
        setError(null);

        const prompt = `Write a short, exciting, and creative product description for an e-commerce store in Zimbabwe. The product is named '${formData.name}' and is in the category '${formData.category}'. Keep it to 1-2 sentences.`;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setFormData(prev => ({ ...prev, description: text.trim() }));
            } else {
                console.error("Unexpected API response structure:", result);
                setError("Could not generate description. Unexpected API response.");
            }
        } catch (error: any) {
            console.error("Error generating description:", error);
            setError(`Failed to generate description: ${error.message}. Please try again.`);
        } finally {
            setIsGenerating(false);
        }
    };

    const { startUpload } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res: any) => {
            console.log("Files: ", res);
            if (res && res.length > 0) {
                setFormData(prev => ({ ...prev, imageUrl: res[0].url }));
                alert("Upload Complete!");
            }
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
        },
        onUploadBegin: () => {
            console.log("upload has begun");
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}
            {addProductMutation.isError && !error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {addProductMutation.error?.message || "An unexpected error occurred during product creation."}
                </div>
            )}
            {addProductMutation.isSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                    Product added successfully! Redirecting...
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Electronics, Apparel, Groceries"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        ></textarea>
                        <Button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating}
                            className="mt-2 flex items-center justify-center text-sm font-semibold"
                        >
                            {isGenerating ? <SpinnerIcon /> : "Generate Description with AI"}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">Price (USD) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Or paste image URL here"
                            />
                            <UploadButton<OurFileRouter>
                                endpoint="imageUploader"
                                onClientUploadComplete={(res: any) => {
                                    if (res && res.length > 0) {
                                        setFormData(prev => ({ ...prev, imageUrl: res[0].url }));
                                        alert("Image uploaded successfully!");
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    setError(`Image upload failed: ${error.message}`);
                                }}
                                onUploadBegin={() => {
                                    console.log("Image upload started...");
                                }}
                            />
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-4">
                                <img src={formData.imageUrl} alt="Product preview" className="max-w-xs h-auto rounded-lg shadow-md" />
                            </div>
                        )}
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
                            disabled={addProductMutation.isPending}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {addProductMutation.isPending && <SpinnerIcon />}
                            {addProductMutation.isPending ? 'Adding Product...' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
