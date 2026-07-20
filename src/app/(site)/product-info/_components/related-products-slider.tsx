"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/custom/product-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type RelatedItem = {
    id: string;
    title: string;
    images: string[];
    price: number;
    discountedPrice?: number;
    productStock?: number;
    description?: string;
};

export function RelatedProductsSlider({
    excludeId,
    categoryId,
    subCategoryId,
}: {
    excludeId: string;
    categoryId: string;
    subCategoryId: string;
}) {
    const [items, setItems] = useState<RelatedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!excludeId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    excludeId,
                    categoryId: categoryId || "",
                    subCategoryId: subCategoryId || "",
                });
                const res = await fetch(`/api/related-products?${params.toString()}`);
                const data = await res.json();
                if (!cancelled && res.ok && Array.isArray(data)) {
                    const seen = new Set<string>();
                    const unique: RelatedItem[] = [];
                    for (const item of data as RelatedItem[]) {
                        if (!item?.id || seen.has(item.id)) continue;
                        seen.add(item.id);
                        unique.push(item);
                    }
                    setItems(unique);
                }
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [excludeId, categoryId, subCategoryId]);

    if (loading) {
        return (
            <section className="mt-14 border-t border-neutral-200 pt-10">
                <h2 className="mb-4 text-lg font-bold tracking-tight text-neutral-900 exo sm:mb-6 sm:text-2xl">
                    You may also like
                </h2>
                <div className="flex items-center justify-center gap-2 py-12 text-neutral-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Loading…
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="mt-14 border-t border-neutral-200 pt-10">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#212121]">Similar picks</p>
                    <h2 className="text-lg font-bold tracking-tight text-neutral-900 exo sm:text-2xl">You may also like</h2>
                    <p className="mt-1 text-sm text-neutral-600 raleway">
                        More from the same category and subcategory.
                    </p>
                </div>
                <Link
                    href={`/shop?category=${encodeURIComponent(categoryId)}`}
                    className="text-sm font-semibold text-[#212121] hover:text-[#FBC02D]"
                >
                    View category
                    <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
            </div>
            <Carousel>
                <CarouselContent className="-ml-2 md:-ml-4">
                    {items.map((item) => (
                        <CarouselItem
                            key={item.id}
                            className="basis-[260px] pl-2 md:basis-[300px] md:pl-4 sm:basis-[280px]"
                        >
                            <ProductCard
                                images={item.images}
                                id={item.id}
                                title={item.title}
                                price={item.price}
                                discountedPrice={item.discountedPrice}
                                productStock={item.productStock}
                                description={item.description}
                                divCalssName="w-full"
                                imageContainerClassName="relative w-full aspect-[4/5] overflow-hidden rounded-xl"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
