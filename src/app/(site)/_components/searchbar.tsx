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
import { cn } from "@/lib/utils"

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

type SearchBarProps = {
    /** Full-width search page: dropdown spans viewport and uses taller panel */
    variant?: "navbar" | "page";
};

const SEARCH_SKELETON_ROWS = 4;

export const SearchBar = ({ variant = "navbar" }: SearchBarProps) => {

    const [searchResults, setSearchResults] = useState<GetProductDataprops[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const { search, setSearch } = useSearch();

    const handelGetProducts = async () => {
        setIsLoading(true);
        try {
            const q = encodeURIComponent(search.trim());
            const response = await fetchData<GetProductprops>(
                `products/filterProducts?search=${q}&page=1&limit=10`
            );
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
        if (search.trim().length >= 2) {
            const timer = setTimeout(() => {
                handelGetProducts();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [search]);


    useEffect(() => {
        if (search.trim().length >= 2) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [search]);
    const router = useRouter();

    const isPage = variant === "page";

    /** Typed query: Cinzel (.raleway). Placeholder: Cormorant Garamond (.exo) for softer hint text. */
    const searchInputClassName = cn(
        "min-w-0 flex-1 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 md:text-base",
        "raleway",
        "placeholder:font-['Cormorant_Garamond',serif] placeholder:font-normal placeholder:tracking-wide placeholder:text-neutral-500",
        "md:placeholder:text-base"
    );

    const resultsPanel = (
        <div
            className={cn(
                "w-full min-w-0 overflow-x-hidden rounded-xl border border-[#244d7c]/12 bg-white shadow-lg",
                isPage
                    ? "max-h-[min(calc(100dvh-11rem),36rem)] overflow-y-auto sm:max-h-[min(calc(100dvh-10rem),40rem)]"
                    : "max-h-[min(70dvh,24rem)] overflow-y-auto sm:max-h-[min(75dvh,26rem)] md:max-h-[400px]"
            )}
        >
            {searchResults.length > 0 && !isLoading && (
                <>
                    <div className="grid w-full grid-cols-1 px-3 py-2 sm:px-4">
                        {searchResults.map((product) => (
                            <Link
                                href={`/product-info/${product._id}`}
                                className="flex w-full min-w-0 items-start gap-3 border-b border-dashed border-neutral-200 py-3 last:border-b-0 sm:gap-4"
                                key={product._id}
                            >
                                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg sm:size-20 md:size-[88px]">
                                    <Image
                                        src={product.images[0]}
                                        className="object-cover object-center"
                                        alt={product.productName}
                                        fill
                                        sizes="(max-width:640px) 64px, 88px"
                                    />
                                </div>
                                <div className="min-w-0 flex-1 raleway">
                                    <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 sm:text-base">
                                        {product.productName}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500 sm:text-sm">
                                        {product.shortDescription}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                        <span className="exo text-sm font-semibold text-[#244d7c] sm:text-base">
                                            {"\u20B9"} {product.originalPrice}
                                        </span>
                                        <span className="inline-flex shrink-0 items-center text-xs font-medium text-[#244d7c] sm:text-sm">
                                            View{" "}
                                            <ChevronRight className="ms-0.5 inline size-3.5" aria-hidden />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Button
                        variant="cart"
                        type="button"
                        className="h-12 w-full shrink-0 rounded-none rounded-b-xl border-t border-[#244d7c]/10"
                        onClick={() => {
                            router.push("/shop?search=" + encodeURIComponent(search));
                            setShow(false);
                        }}
                    >
                        View all results
                        <ChevronRight className="ms-2 size-4" aria-hidden />
                    </Button>
                </>
            )}

            {searchResults.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                    <ShoppingCart className="size-10 text-neutral-400" aria-hidden />
                    <h2 className="exo mt-3 text-lg font-semibold text-neutral-800 sm:text-xl">
                        No products found
                    </h2>
                    <p className="raleway mt-1 max-w-xs text-sm text-neutral-500">
                        Try another keyword or browse the shop.
                    </p>
                </div>
            )}

            {isLoading && (
                <div>
                    <ul className="divide-y divide-dashed divide-neutral-200 px-3 py-2 sm:px-4">
                        {Array.from({ length: SEARCH_SKELETON_ROWS }).map((_, i) => (
                            <li
                                key={i}
                                className="flex w-full min-w-0 items-start gap-3 py-3 sm:gap-4"
                            >
                                <Skeleton className="size-16 shrink-0 rounded-lg sm:size-20 md:size-[88px]" />
                                <div className="min-w-0 flex-1 space-y-2.5 pt-0.5">
                                    <Skeleton className="h-4 w-[92%] rounded sm:h-5" />
                                    <Skeleton className="h-3 w-full rounded sm:h-3.5" />
                                    <Skeleton className="h-3 w-[80%] rounded sm:h-3.5" />
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Skeleton className="h-4 w-16 rounded sm:h-5 sm:w-20" />
                                        <Skeleton className="h-4 w-14 rounded sm:h-5 sm:w-16" />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Skeleton className="h-12 w-full rounded-none rounded-b-xl" />
                </div>
            )}
        </div>
    );

    return (
        <div
            className={cn(
                "relative w-full min-w-0 max-w-full",
                isPage
                    ? "flex flex-col gap-2 sm:gap-3"
                    : "flex h-11 items-center rounded-full border border-[#244d7c]/15 bg-white shadow-sm sm:h-12 md:h-12 xl:w-[500px]"
            )}
        >
            {isPage ? (
                <div className="flex h-11 w-full min-w-0 shrink-0 items-center rounded-full border border-[#244d7c]/15 bg-white px-0 shadow-sm sm:h-12 md:h-12">
                    <Button type="button" variant="icon" className="shrink-0 bg-transparent">
                        <SearchIcon className="size-5 text-[#244d7c]" aria-hidden />
                    </Button>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={searchInputClassName}
                        placeholder="Search shirts, jeans, ethnic wear…"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>
            ) : (
                <>
                    <Button type="button" variant="icon" className="shrink-0 bg-transparent">
                        <SearchIcon className="size-5 text-[#244d7c]" aria-hidden />
                    </Button>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={searchInputClassName}
                        placeholder="Search shirts, jeans, ethnic wear…"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </>
            )}

            {show && (
                <div
                    className={cn(
                        "min-w-0",
                        isPage ? "w-full shrink-0" : "absolute left-0 right-0 top-full z-[120] mt-2 w-full xl:z-[130]"
                    )}
                >
                    {resultsPanel}
                </div>
            )}
        </div>
    );
};