"use client";
import { ProductCard } from "@/components/custom/product-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton";
import { sortItems } from "@/lib/staticData";
import { useLoader } from "@/store/use-loader";
import { useEffect, useState } from "react";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";
import { fetchData } from "@/utils/apiCall";
import { ShoppingCart, X } from "lucide-react";
import { Waypoint } from 'react-waypoint';
import { ProductInfoModal } from "./product-info-modal";
import { useSearch } from "../../_components/hooks/use-search";
import { ShopMobileCategoryFilter } from "./shop-mobile-category-filter";
import type { CategoryFilterItem } from "./category-filter-list";


type GetProductprops = {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    products: GetProductDataprops[];
}
type GetProductDataprops = {
    _id: string;
    productId: string;
    productName: string;
    images: string[];
    productStock: string;
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    discountPrice: string;
    originalPrice: string;
    shortDescription: string;
    longDescription: string;
    varients: any[];
};

type ShopPageProps = {
    categories: CategoryFilterItem[];
};

export const ShopPage = ({ categories }: ShopPageProps) => {
    const { isLoading, setLoading } = useLoader((state) => state);
    const { category, subcategory, sortBy, setSortBy, page, setPage } = useCategoryDropdown();
    const [products, setProducts] = useState<GetProductDataprops[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [resetFilter, setResetFilter] = useState(false);
 
    const { search, setSearch } = useSearch();


    const handelGetProducts = async () => {
        setLoading(true);
        try {
            const response = await fetchData<GetProductprops>(`products/filterProducts?category=${category.join(',')}&subcategory=${subcategory.join(',')}&sortBy=${sortBy}&page=${page}&search=${search}`);
            if (response && response.products) {
                setProducts((prev) => [...prev, ...response.products]);
                setHasMore(page < response.totalPages);


            }

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setResetFilter(true);
    }, [sortBy, JSON.stringify(subcategory), search]);

    useEffect(() => {
        if (resetFilter) {
            handelGetProducts();
            setResetFilter(false);
        }
    }, [resetFilter]);



    return (
        <>
            <ProductInfoModal />
            <div className="h-auto w-full">
                <div className="w-full">
                    <ShopMobileCategoryFilter categories={categories} />
                    <div className="w-full flex flex-wrap items-center gap-2">
                        {
                            search && (
                                <div className="sm:px-4 px-2 py-1 sm:py-2 bg-rose-600 text-white raleway sm:text-sm text-xs flex items-center gap-2 rounded cursor-pointer" onClick={() => {
                                    setSearch('');
                                    setPage(1);

                                }}>
                                    {search} <X className="size-4" />
                                </div>
                            )
                        }
                        <div className=" ms-auto text-neutral-800 exo">
                            <Select value={sortBy} onValueChange={(value) => {
                                setPage(1); // Reset to first page on sort change
                                setSortBy(value)
                            }}>
                                <SelectTrigger className="focus:ring-0 border-gray-500 sm:w-56 w-44 sm:text-base text-xs">
                                    <SelectValue placeholder="Sort by : Recommended" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recommended">Sort by : Recommended</SelectItem>
                                    {
                                        sortItems.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>Sort by : {item.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 justify-items-center gap-y-4 min-[377px]:justify-items-stretch min-[377px]:grid-cols-2 min-[377px]:gap-x-3 min-[377px]:gap-y-5 sm:gap-x-5 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">

                        {
                            products.map((item, index) => (
                                <ProductCard
                                    key={index}
                                    images={item.images}
                                    id={item._id}
                                    title={item.productName}
                                    price={Number(item.originalPrice)}
                                    discountedPrice={Number(item.discountPrice)}
                                    description={item.shortDescription}
                                    divCalssName="w-full min-w-0 max-w-[260px] mx-auto p-3 min-[377px]:max-w-full min-[377px]:mx-0 min-[377px]:p-4"
                                    imageContainerClassName="relative w-full aspect-[3/4] min-[377px]:aspect-[4/5] overflow-hidden rounded-xl"
                                />
                            ))

                        }



                        {
                            isLoading && Array.from({ length: 10 }).map((_, index) => (
                                <ProductCardSkeleton key={index} />
                            ))
                        }

                    </div>

                    {
                        products.length === 0 && !isLoading && (
                            <div className=" mt-10 w-full flex flex-col items-center text-center text-neutral-600  justify-center">
                                <ShoppingCart className="size-10" />
                                <h2 className="text-xl font-semibold exo mt-5">No Products Found</h2>
                                <p className="mt-2 raleway">Try changing the filters or sorting options.</p>
                            </div>
                        )
                    }
                </div>

                {hasMore && (
                    <Waypoint
                        onEnter={() => {
                            if (!isLoading) {
                                setPage((prev) => prev + 1);
                                setResetFilter(true); // Trigger reset to fetch next page
                            }
                        }}
                    >
                        <div className="w-full flex justify-center mt-5 raleway">
                            Loading...
                        </div>
                    </Waypoint>
                )}
            </div>
        </>
    );
}

const ProductCardSkeleton = () => {
    return (
        <div className="w-full min-w-0 max-w-[260px] mx-auto p-3 min-[377px]:max-w-full min-[377px]:mx-0 min-[377px]:p-4 shadow-sm rounded-xl bg-indigo-50">
            <div className="w-full aspect-[3/4] min-[377px]:aspect-[4/5] rounded-xl overflow-hidden">
                <Skeleton className='w-full h-full' />
            </div>
            <div className="mt-3 flex flex-col gap-y-4">
                <Skeleton className=" h-5 w-[50%]" />
                <Skeleton className="h-3 w-[90%]" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                </div>
                <div className="md:mt-3 mt-2">
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        </div>
    )
}