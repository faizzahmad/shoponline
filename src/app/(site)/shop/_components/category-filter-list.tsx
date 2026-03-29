"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";

export type CategoryFilterItem = {
    id: string;
    name: string;
    img: string;
    subCategories?: {
        id: string;
        name: string;
        img: string;
    }[];
};

type CategoryFilterListProps = {
    categories: CategoryFilterItem[];
    className?: string;
};

export const CategoryFilterList = ({
    categories,
    className,
}: CategoryFilterListProps) => {
    const { category, subcategory, setSubcategory } = useCategoryDropdown();
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>(
        [],
    );

    useEffect(() => {
        if (category.length === 0) return;
        setExpandedCategoryIds((prev) =>
            Array.from(new Set([...prev, ...category])),
        );
    }, [category.join(",")]);

    return (
        <div
            className={cn(
                "grid grid-cols-1 items-center justify-center gap-5",
                className,
            )}
        >
            {categories.map((items) => (
                <div
                    key={items.id}
                    className={cn(
                        "block",
                        !items.subCategories?.length && "hidden",
                    )}
                >
                    <div
                        className="flex w-full cursor-pointer items-center gap-5 font-[300] text-neutral-700 transition hover:text-rose-600 raleway"
                        onClick={() => {
                            setExpandedCategoryIds((prev) =>
                                prev.includes(items.id)
                                    ? prev.filter((id) => id !== items.id)
                                    : [...prev, items.id],
                            );
                        }}
                    >
                        <span className="text-lg">{items.name}</span>
                        <ChevronDown
                            className={cn(
                                "size-5 transition",
                                expandedCategoryIds.includes(items.id)
                                    ? "rotate-180"
                                    : "rotate-0",
                            )}
                        />
                    </div>

                    <div
                        className={cn(
                            "mt-4",
                            expandedCategoryIds.includes(items.id)
                                ? "flex flex-col gap-2"
                                : "hidden",
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <Checkbox
                                className="data-[state=checked]:border-rose-600 data-[state=checked]:bg-rose-600"
                                onCheckedChange={(checked) => {
                                    const subCategoryIds =
                                        items.subCategories?.map((sub) => sub.id) ||
                                        [];

                                    if (checked) {
                                        setSubcategory((prev) => [
                                            ...new Set([...prev, ...subCategoryIds]),
                                        ]);
                                    } else {
                                        setSubcategory((prev) =>
                                            prev.filter(
                                                (id) => !subCategoryIds.includes(id),
                                            ),
                                        );
                                    }
                                }}
                                checked={
                                    items.subCategories?.every((sub) =>
                                        subcategory.includes(sub.id),
                                    ) || false
                                }
                                id={`view-all-${items.id}`}
                            />
                            <label
                                className="capitalize"
                                htmlFor={`view-all-${items.id}`}
                            >
                                View All
                            </label>
                        </div>

                        {items?.subCategories?.map((subItems) => (
                            <div
                                className="flex items-center gap-4"
                                key={subItems.id}
                            >
                                <Checkbox
                                    id={subItems.id}
                                    className="data-[state=checked]:border-rose-600 data-[state=checked]:bg-rose-600"
                                    checked={subcategory.includes(subItems.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSubcategory([
                                                ...subcategory,
                                                subItems.id,
                                            ]);
                                        } else {
                                            setSubcategory(
                                                subcategory.filter(
                                                    (id) => id !== subItems.id,
                                                ),
                                            );
                                        }
                                    }}
                                />
                                <label
                                    htmlFor={subItems.id}
                                    className="capitalize"
                                >
                                    {subItems.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
