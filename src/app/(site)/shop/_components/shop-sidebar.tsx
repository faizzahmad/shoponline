"use client"
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";

interface ShopSidebarProps {
    categories: {
        id: string;
        name: string;
        img: string;
        subCategories?: {
            id: string;
            name: string;
            image: string;
        }[];
    }[];
}


export const ShopSidebar = ({ categories }: ShopSidebarProps) => {
    const { category, subcategory, setCategory, setSubcategory } = useCategoryDropdown();
    return (
        <div className="w-full">
            <h5 className="exo text-2xl font-[700]">
                Categories
            </h5>
            <div className=" mt-10 grid grid-cols-1 items-center justify-center gap-5">
                {
                    categories.map((items) => (
                        <div key={items.id} className={cn("block", !items.subCategories?.length && 'hidden')}>
                            <div className=" w-full flex gap-5 raleway font-[300] text-neutral-700 items-center cursor-pointer hover:text-rose-600 transition"
                                onClick={() => {
                                    if (category.includes(items.id)) {
                                        setCategory(category.filter(id => id !== items.id));
                                    } else {
                                        setCategory([...category, items.id]);
                                    }
                                }
                                }

                            >
                                <span className="text-lg">{items.name}</span>
                                <ChevronDown className={cn("size-5 transition", category.includes(items.id) ? 'rotate-180' : 'rotate-0')} />
                            </div>

                            <div className={cn("mt-4", category.includes(items.id) ? 'flex flex-col gap-2' : 'hidden')}>
                                <div className="flex gap-4 items-center">
                                    <Checkbox
                                        className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                        onCheckedChange={(checked) => {
                                            const subCategoryIds = items.subCategories?.map((sub) => sub.id) || [];

                                            if (checked) {
                                                setSubcategory((prev) => [...new Set([...prev, ...subCategoryIds])]);
                                            } else {
                                                setSubcategory((prev) => prev.filter((id) => !subCategoryIds.includes(id)));
                                            }
                                        }}
                                        checked={
                                            items.subCategories?.every((sub) => subcategory.includes(sub.id)) || false
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

                                {
                                    items?.subCategories?.map((subItems) => (
                                        <div className=" flex gap-4 items-center" key={subItems.id}>
                                            <Checkbox id={subItems.id} className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                                checked={subcategory.includes(subItems.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSubcategory([...subcategory, subItems.id]);
                                                    } else {
                                                        setSubcategory(subcategory.filter(id => id !== subItems.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={subItems.id} className="capitalize">{subItems.name}</label>

                                        </div>
                                    ))
                                }

                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}