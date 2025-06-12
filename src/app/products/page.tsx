"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dropdown-menu";

// --- Icons ---
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-up"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>;
const LoaderIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

type SortOrder = 'most_sales' | 'least_sales' | 'none';

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
    description?: string;
}

function ProductsPage() {
    const { data, isPending: isSessionLoading } = authClient.useSession();
    const user = data?.user;
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('none');
    const productsPerPage = 10;

    useEffect(() => {
        if (!user && !isSessionLoading) {
            router.replace("/auth/signin");
        }
    }, [user, router, isSessionLoading]);

    const { data: productsData, isLoading, error } = useQuery<Product[]>({
        queryKey: ['userProducts', user?.id],
        queryFn: async () => {
            if (!user?.id) {
                return [];
            }
            const response = await fetch(`/api/products?userId=${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return response.json();
        },
        enabled: !!user?.id,
        placeholderData: [],
    });

    const processedProducts = useMemo(() => {
        let tempProducts = productsData || [];

        // 1. Apply Search Filter
        if (searchTerm) {
            tempProducts = tempProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Apply Category Filter
        if (filterCategory) {
            tempProducts = tempProducts.filter(product => product.category === filterCategory);
        }

        // 3. Apply Sales Sorting
        if (sortOrder === 'most_sales') {
            tempProducts = [...tempProducts].sort((a, b) => b._count.orders - a._count.orders);
        } else if (sortOrder === 'least_sales') {
            tempProducts = [...tempProducts].sort((a, b) => a._count.orders - b._count.orders);
        }

        return tempProducts;
    }, [productsData, searchTerm, filterCategory, sortOrder]);

    const totalPages = Math.ceil(processedProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = processedProducts.slice(startIndex, endIndex);

    const uniqueCategories = useMemo(() => {
        return Array.from(new Set(productsData?.map(p => p.category).filter(Boolean) || [])) as string[];
    }, [productsData]);

    if (isLoading || isSessionLoading) {
        return (
            <section className="flex justify-center items-center h-screen">
                <LoaderIcon /> Loading products...
            </section>
        );
    }

    if (error) {
        return (
            <section className="text-center p-4 bg-red-100 text-red-700 rounded-lg max-w-2xl mx-auto mt-10">
                Error: {error.message}
            </section>
        );
    }

    return (
        <section className="relative p-4 sm:p-6 md:p-8 flex justify-center">
            <div className="w-full max-w-6xl">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-gray-800 text-center sm:text-left">Your Products</h2>
                    <Button onClick={() => router.push('/products/new')} className="bg-green-600 hover:bg-green-700 text-white flex items-center shrink-0">
                        <PlusCircleIcon className="mr-2 h-5 w-5" /> Add New Product
                    </Button>
                </div>

                {/* Search, Category Filter, and Sales Sort */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-center">
                    <div className="relative flex-grow">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto shrink-0">
                                <FilterIcon className="h-5 w-5" /> Category: {filterCategory || 'All'}
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
                                <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto shrink-0">
                                <SortIcon className="h-5 w-5" /> Sort: {sortOrder === 'most_sales' ? 'Most Sales' : sortOrder === 'least_sales' ? 'Least Sales' : 'Default (Newest)'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Sort by Sales</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                setSortOrder('none');
                                setCurrentPage(1);
                            }}>
                                Default (Newest)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setSortOrder('most_sales');
                                setCurrentPage(1);
                            }}>
                                Most Sales
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setSortOrder('least_sales');
                                setCurrentPage(1);
                            }}>
                                Least Sales
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 overflow-x-auto">
                    {currentProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <p className="mb-4 text-lg">No products found matching your criteria.</p>
                            {!searchTerm && !filterCategory && sortOrder === 'none' && (
                                <Link href="/products/new" passHref>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center mx-auto transition-colors duration-200">
                                        <PlusCircleIcon className="mr-2 h-5 w-5" /> Add Your First Product
                                    </Button>
                                </Link>
                            )}
                            {(searchTerm || filterCategory || sortOrder !== 'none') && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterCategory(null);
                                        setSortOrder('none');
                                        setCurrentPage(1);
                                    }}
                                    className="mt-4"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <Table className="min-w-full divide-y divide-gray-200">
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Image</TableHead>
                                        <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</TableHead>
                                        <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                                        <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</TableHead>
                                        <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</TableHead>
                                        <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</TableHead>
                                        <TableHead className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-200">
                                    {currentProducts.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <TableCell className="py-4 px-4">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover rounded-md shadow-sm border border-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-gray-200">No Img</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 px-4 font-medium text-gray-900">{product.name}</TableCell>
                                            <TableCell className="py-4 px-4 text-gray-700">{product.category || 'N/A'}</TableCell>
                                            <TableCell className="py-4 px-4 text-gray-700 font-semibold">${product.price.toFixed(2)}</TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge
                                                    className={`
                                                        ${product.stock < 5 ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        product.stock < 10 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                        'bg-green-50 text-green-700 border border-green-200'}
                                                        px-2.5 py-1 text-xs font-semibold rounded-full min-w-[70px] text-center
                                                    `}
                                                >
                                                    {product.stock} in Stock
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4 text-gray-700 font-medium">{product._count.orders}</TableCell>
                                            <TableCell className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-150" asChild>
                                                        <Link href={`/products/edit/${product.id}`} aria-label={`Edit ${product.name}`}>
                                                            <EditIcon className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white transition-colors duration-150" aria-label={`Delete ${product.name}`}>
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
                                        <PaginationContent className="flex flex-wrap gap-2">
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
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                                <PaginationItem key={pageNumber}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={currentPage === pageNumber}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(pageNumber);
                                                        }}
                                                    >
                                                        {pageNumber}
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
            </div>
        </section>
    );
}

export default ProductsPage;
