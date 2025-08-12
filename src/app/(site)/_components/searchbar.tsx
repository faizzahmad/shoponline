"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchData } from "@/utils/apiCall"
import { ChevronRight, SearchIcon, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearch } from "./hooks/use-search"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

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

export const SearchBar = () => {

    const [searchResults, setSearchResults] = useState<GetProductDataprops[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const { search, setSearch } = useSearch();

    const handelGetProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetchData<GetProductprops>(`products/filterProducts?search=${search}&page=1&limit=10`);
            if (response && response.products) {
                setSearchResults(response.products);

            }

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        if (search.length > 2) {
            const timer = setTimeout(() => {
                handelGetProducts();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [search]);


    useEffect(() => {
        if (search.length > 2) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [search]);
    const router = useRouter();

    return (
        <div className="xl:w-[500px] w-full flex bg-white md:h-12 h-10 items-center rounded-full shadow-sm border relative">
            <Button variant={'icon'} className=" bg-transparent ">
                <SearchIcon className="size-5" />
            </Button>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none rounded-none shadow-none flex-shrink md:text-base text-sm " placeholder="Search Balloons, Party Caps, Candles, Decorations, Gifts..." />

            {
                show && (
                    <div className="w-full absolute left-0 top-[55px] z-[100] flex justify-center">
                        <div className="bg-white rounded md:max-h-[400px] overflow-y-auto md:w-[80%] shadow-sm border">
                            {
                                searchResults.length > 0 && !isLoading && (
                                    <>
                                        <div className="w-full grid grid-cols-1  px-5 py-2">

                                            {
                                                searchResults.map((product) => (
                                                    <Link href={`/product-info/${product._id}`} className="w-full flex gap-5 items-center py-3 border-b border-dashed last:border-b-0" key={product._id} >
                                                        <div className="size-[90px] relative rounded overflow-hidden">
                                                            <Image src={product.images[0]} className="w-full h-full" alt="productImage" fill objectFit="cover" />
                                                        </div>
                                                        <div className="flex-1 raleway">
                                                            <h3 className="md:text-base text-sm font-semibold ">{product.productName}</h3>
                                                            <p className="md:text-sm text-xs text-gray-500 line-clamp-2">{product.shortDescription}</p>


                                                            <span className="md:text-sm text-xs exo font-[500]">{"\u20B9"} {product.originalPrice}</span>
                                                            <Button variant={'link'} className="float-right md:text-xs text-[10px] text-rose-600 mt-3">View Details <ChevronRight /></Button>
                                                        </div>
                                                    </Link>

                                                ))
                                            }


                                        </div>
                                        <Button variant={'cart'} className="w-full sticky bottom-0 mt-3 rounded-none h-[50px]" onClick={() => {
                                            router.push('/shop?search=' + search);
                                            setShow(false);
                                        }}>
                                            View All Results
                                            <ChevronRight className="size-4 ml-2" />
                                        </Button>
                                    </>
                                )
                            }

                            {
                                searchResults.length === 0 && !isLoading && (
                                    <div>
                                        <div className="w-full flex flex-col items-center justify-center text-center p-5">
                                            <ShoppingCart className="size-10" />
                                            <h2 className="text-xl font-semibold exo mt-2">No Products Found</h2>
                                            <p className="text-sm text-gray-500 raleway">Try searching for something else.</p>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                isLoading && (
                                    <div>
                                        <div className="w-full grid grid-cols-1  px-5 py-2">
                                            <div className="w-full flex gap-5 items-center py-3 border-b border-dashed last:border-b-0">
                                                <div className="size-[90px]">
                                                    <Skeleton className="w-full h-full rounded" />
                                                </div>
                                                <div className="flex-1">
                                                    <Skeleton className="w-full h-5 mb-2" />
                                                    <Skeleton className="w-full h-4 mb-2" />
                                                    <Skeleton className="w-1/2 h-4" />
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-5 items-center py-3 border-b border-dashed last:border-b-0">
                                                <div className="size-[90px]">
                                                    <Skeleton className="w-full h-full rounded" />
                                                </div>
                                                <div className="flex-1">
                                                    <Skeleton className="w-full h-5 mb-2" />
                                                    <Skeleton className="w-full h-4 mb-2" />
                                                    <Skeleton className="w-1/2 h-4" />
                                                </div>
                                            </div>
                                            <div className="w-full flex gap-5 items-center py-3 border-b border-dashed last:border-b-0">
                                                <div className="size-[90px]">
                                                    <Skeleton className="w-full h-full rounded" />
                                                </div>
                                                <div className="flex-1">
                                                    <Skeleton className="w-full h-5 mb-2" />
                                                    <Skeleton className="w-full h-4 mb-2" />
                                                    <Skeleton className="w-1/2 h-4" />
                                                </div>
                                            </div>

                                        </div>
                                        <div className="w-full sticky bottom-0 mt-3 rounded-none h-[50px]">
                                            <Skeleton className="w-full h-full rounded" />
                                        </div>
                                    </div>
                                )
                            }
                        </div>

                    </div>

                )
            }
        </div>
    )
}