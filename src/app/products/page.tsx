"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Import Image component for optimized images

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
import { Input } from "@/components/ui/input"; // For search input
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // For filter

// --- Icons ---
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>;
const LoaderIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// Placeholder for product data type
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string | null;
    imageUrl: string | null;
    _count: {
        orders: number;
    };
    // Add other fields as needed, e.g., storeId, description
}

function ProductsPage() {
    const { data, isPending: isSessionLoading } = authClient.useSession();
    const user = data?.user;
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const productsPerPage = 10; // More products per page for a dedicated list

    useEffect(() => {
        if (!user && !isSessionLoading) {
            router.replace("/auth/signin");
        }
    }, [user, router, isSessionLoading]);

    // Fetch product data, potentially with search and filter parameters
    const { data: productsData, isLoading, error } = useQuery<Product[]>({
        queryKey: ['userProducts', user?.id, searchTerm, filterCategory], // Include search and filter in queryKey
        queryFn: async () => {
            if (!user?.id) {
                return [];
            }
            // In a real application, you'd pass searchTerm and filterCategory to your API
            const response = await fetch(`/api/products?userId=${user.id}&search=${searchTerm}&category=${filterCategory || ''}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return response.json();
        },
        enabled: !!user?.id,
        placeholderData: [], // Provide an empty array as placeholder to avoid undefined issues during initial load
    });

    if (isLoading || isSessionLoading) {
        return (
            <section className="flex justify-center items-center h-screen">
                <LoaderIcon /> Loading products...
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

    const filteredProducts = productsData || []; // Use fetched data

    // Calculate pagination values
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Get unique categories for filter dropdown
    const uniqueCategories = Array.from(new Set(filteredProducts.map(p => p.category).filter(Boolean))) as string[];


    return (
        <section className="relative p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Your Products</h2>
                <Button onClick={() => router.push('/products/new')} className="bg-green-600 hover:bg-green-700 text-white flex items-center">
                    <PlusCircleIcon className="mr-2" /> Add New Product
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-2 border rounded-md w-full"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <FilterIcon /> Filter Category {filterCategory ? `(${filterCategory})` : ''}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            setFilterCategory(null);
                            setCurrentPage(1);
                        }}>
                            All Categories
                        </DropdownMenuItem>
                        {uniqueCategories.map(category => (
                            <DropdownMenuItem key={category} onClick={() => {
                                setFilterCategory(category);
                                setCurrentPage(1);
                            }}>
                                {category}
                            </DropdownMenuItem>
                        ))}
                        {uniqueCategories.length === 0 && (
                            <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>


            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                {currentProducts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p className="mb-4">No products found matching your criteria.</p>
                        <Link href="/products/new" passHref>
                            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center mx-auto">
                                <PlusCircleIcon className="mr-2" /> Add Your First Product
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <Table className="min-w-full">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</TableHead>
                                    <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</TableHead>
                                    <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                                    <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</TableHead>
                                    <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</TableHead>
                                    <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</TableHead>
                                    <TableHead className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentProducts.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="py-4 px-4">
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover rounded-md shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 px-4 font-medium text-gray-900">{product.name}</TableCell>
                                        <TableCell className="py-4 px-4 text-gray-700">{product.category || 'N/A'}</TableCell>
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
                                        <TableCell className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Link to product edit page */}
                                                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                    <Link href={`/products/edit/${product.id}`} aria-label={`Edit ${product.name}`}>
                                                        <EditIcon className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {/* Delete button (will implement actual deletion logic later) */}
                                                <Button variant="destructive" size="icon" className="h-8 w-8" aria-label={`Delete ${product.name}`}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(prev => Math.max(1, prev - 1));
                                                }}
                                                aria-disabled={currentPage === 1}
                                                tabIndex={currentPage === 1 ? -1 : undefined}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                                            />
                                        </PaginationItem>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <PaginationItem key={index}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === index + 1}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(index + 1);
                                                    }}
                                                >
                                                    {index + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                                }}
                                                aria-disabled={currentPage === totalPages}
                                                tabIndex={currentPage === totalPages ? -1 : undefined}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default ProductsPage;