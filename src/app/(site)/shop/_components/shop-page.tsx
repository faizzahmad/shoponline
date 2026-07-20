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
import { useEffect, useMemo, useState } from "react";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";
import { fetchData } from "@/utils/apiCall";
import { Filter, ShoppingCart, X } from "lucide-react";
import { Waypoint } from 'react-waypoint';
import { ProductInfoModal } from "./product-info-modal";
import { useSearch } from "../../_components/hooks/use-search";
import { ShopFilterSheet } from "./shop-filter-sheet";
import { Button } from "@/components/ui/button";
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

type FilterChip =
    | { kind: "sub"; id: string; label: string }
    | { kind: "cat"; id: string; label: string }
    | { kind: "price"; label: string }
    | { kind: "inStock"; label: string }
    | { kind: "onSale"; label: string }
    | { kind: "variant"; id: string; label: string };

function buildFilterChips(
    categories: CategoryFilterItem[],
    category: string[],
    subcategory: string[]
): FilterChip[] {
    const chips: FilterChip[] = [];

    for (const catId of category) {
        const cat = categories.find((c) => c.id === catId);
        if (!cat) continue;
        const subsInUrl = (cat.subCategories ?? []).filter((s) => subcategory.includes(s.id));
        if (subsInUrl.length === 0) {
            chips.push({ kind: "cat", id: catId, label: cat.name });
        }
    }

    for (const subId of subcategory) {
        const parent = categories.find((c) => c.subCategories?.some((s) => s.id === subId));
        const sub = parent?.subCategories?.find((s) => s.id === subId);
        const label = parent && sub ? `${parent.name}: ${sub.name}` : subId;
        chips.push({ kind: "sub", id: subId, label });
    }

    return chips;
}

export const ShopPage = ({ categories }: ShopPageProps) => {
    const { isLoading, setLoading } = useLoader((state) => state);
    const {
        category,
        subcategory,
        setCategory,
        setSubcategory,
        sortBy,
        setSortBy,
        page,
        setPage,
        minPrice,
        maxPrice,
        inStock,
        onSale,
        setMinPrice,
        setMaxPrice,
        setInStock,
        setOnSale,
        variantFilterEntries,
        variantFilters,
        toggleVariantFilter,
    } = useCategoryDropdown();
    const [products, setProducts] = useState<GetProductDataprops[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [resetFilter, setResetFilter] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
 
    const { search, setSearch } = useSearch();

    const activeFilterCount = useMemo(() => {
        let count = category.length + subcategory.length + variantFilterEntries.length;
        if (minPrice != null || maxPrice != null) count += 1;
        if (inStock) count += 1;
        if (onSale) count += 1;
        return count;
    }, [
        category.length,
        subcategory.length,
        variantFilterEntries.length,
        minPrice,
        maxPrice,
        inStock,
        onSale,
    ]);

    const mobileFilterChips = useMemo(() => {
        const chips = buildFilterChips(categories, category, subcategory);

        if (minPrice != null || maxPrice != null) {
            const lo = minPrice != null ? `₹${minPrice}` : "Any";
            const hi = maxPrice != null ? `₹${maxPrice}` : "Any";
            chips.push({ kind: "price", label: `Price: ${lo} – ${hi}` });
        }
        if (inStock) chips.push({ kind: "inStock", label: "In stock" });
        if (onSale) chips.push({ kind: "onSale", label: "On sale" });

        for (const [name, values] of Object.entries(variantFilters)) {
            for (const value of values) {
                chips.push({
                    kind: "variant",
                    id: `${name}:${value}`,
                    label: `${name}: ${value}`,
                });
            }
        }

        return chips;
    }, [categories, category, subcategory, minPrice, maxPrice, inStock, onSale, variantFilters]);

    const dismissFilterChip = (chip: FilterChip) => {
        if (chip.kind === "sub") {
            setSubcategory((prev) => prev.filter((id) => id !== chip.id));
        } else if (chip.kind === "cat") {
            setCategory((prev) => prev.filter((id) => id !== chip.id));
            const cat = categories.find((c) => c.id === chip.id);
            const subIds = cat?.subCategories?.map((s) => s.id) ?? [];
            if (subIds.length > 0) {
                setSubcategory((prev) => prev.filter((id) => !subIds.includes(id)));
            }
        } else if (chip.kind === "price") {
            setMinPrice(null);
            setMaxPrice(null);
        } else if (chip.kind === "inStock") {
            setInStock(false);
        } else if (chip.kind === "onSale") {
            setOnSale(false);
        } else if (chip.kind === "variant") {
            const sep = chip.id.indexOf(":");
            if (sep > 0) {
                toggleVariantFilter(
                    chip.id.slice(0, sep),
                    chip.id.slice(sep + 1),
                    false
                );
            }
        }
        setPage(1);
    };

    const handelGetProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                category: category.join(","),
                subcategory: subcategory.join(","),
                sortBy,
                page: String(page),
                search: search ?? "",
            });
            if (minPrice != null) params.set("minPrice", String(minPrice));
            if (maxPrice != null) params.set("maxPrice", String(maxPrice));
            if (inStock) params.set("inStock", "true");
            if (onSale) params.set("onSale", "true");
            for (const entry of variantFilterEntries) {
                params.append("vf", entry);
            }

            const response = await fetchData<GetProductprops>(
                `products/filterProducts?${params.toString()}`
            );
            if (response && response.products) {
                setProducts((prev) =>
                    page <= 1 ? response.products : [...prev, ...response.products]
                );
                setTotalProducts(response.totalProducts);
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
    }, [
        sortBy,
        JSON.stringify(subcategory),
        JSON.stringify(category),
        search,
        minPrice,
        maxPrice,
        inStock,
        onSale,
        variantFilterEntries.join(","),
    ]);

    useEffect(() => {
        if (resetFilter) {
            handelGetProducts();
            setResetFilter(false);
        }
    }, [resetFilter]);



    return (
        <>
            <ProductInfoModal />
            <ShopFilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
            />
            <div className="h-auto w-full">
                <div className="w-full">
                    {mobileFilterChips.length > 0 ? (
                        <div
                            className="mt-2 mb-3"
                            aria-label="Active filters"
                        >
                            <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {mobileFilterChips.map((chip) => (
                                    <button
                                        key={
                                            chip.kind === "sub" ||
                                            chip.kind === "cat" ||
                                            chip.kind === "variant"
                                                ? `${chip.kind}-${chip.id}`
                                                : chip.kind
                                        }
                                        type="button"
                                        className="max-w-[11rem] shrink-0 rounded px-2 py-1 text-left text-xs text-white raleway sm:max-w-[14rem] sm:px-3 sm:py-1.5 sm:text-sm bg-[#1A1A1A] flex items-center gap-2"
                                        onClick={() => dismissFilterChip(chip)}
                                    >
                                        <span className="min-w-0 flex-1 truncate">{chip.label}</span>
                                        <X className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                    <div className="w-full flex flex-wrap items-center gap-2">
                        {
                            search && (
                                <div className="sm:px-4 px-2 py-1 sm:py-2 bg-[#1A1A1A] text-white raleway sm:text-sm text-xs flex items-center gap-2 rounded cursor-pointer" onClick={() => {
                                    setSearch('');
                                    setPage(1);

                                }}>
                                    {search} <X className="size-4" />
                                </div>
                            )
                        }
                        {totalProducts > 0 ? (
                            <p className="text-xs text-neutral-600 exo sm:text-sm">
                                {totalProducts} product{totalProducts === 1 ? "" : "s"}
                            </p>
                        ) : null}
                        <div className="ms-auto flex items-center gap-2 text-neutral-800 exo">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 gap-2 border-gray-500 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                                onClick={() => setFilterSheetOpen(true)}
                            >
                                <Filter className="size-4 shrink-0" />
                                Filter
                                {activeFilterCount > 0 ? (
                                    <span className="rounded-full bg-[#1A1A1A] px-1.5 py-0.5 text-[10px] font-medium text-white">
                                        {activeFilterCount}
                                    </span>
                                ) : null}
                            </Button>
                            <Select value={sortBy} onValueChange={(value) => {
                                setPage(1);
                                setSortBy(value)
                            }}>
                                <SelectTrigger className="h-9 focus:ring-0 border-gray-500 w-44 text-xs sm:h-10 sm:w-56 sm:text-base">
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
                                    productStock={item.productStock}
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
                                <h2 className="mt-5 text-lg font-semibold exo sm:text-xl">No Products Found</h2>
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
        <div className="w-full min-w-0 max-w-[260px] mx-auto p-3 min-[377px]:max-w-full min-[377px]:mx-0 min-[377px]:p-4 shadow-sm rounded-2xl bg-white border border-[#1A1A1A]/15">
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