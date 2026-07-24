"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    CategoryFilterItem,
    CategoryFilterList,
} from "./category-filter-list";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";

type ShopCategorySheetProps = {
    categories: CategoryFilterItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ShopCategorySheet = ({
    categories,
    open,
    onOpenChange,
}: ShopCategorySheetProps) => {
    const { category, subcategory, setCategory, setSubcategory, setPage } =
        useCategoryDropdown();

    const hasCategoryFilters = category.length > 0 || subcategory.length > 0;

    const clearCategoryFilters = () => {
        setCategory([]);
        setSubcategory([]);
        setPage(1);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="z-[150] flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
            >
                <SheetHeader className="shrink-0 border-b px-5 py-4 text-left">
                    <div className="flex items-center justify-between gap-3 pe-8">
                        <SheetTitle className="exo text-lg font-[700]">
                            Categories
                        </SheetTitle>
                        {hasCategoryFilters ? (
                            <button
                                type="button"
                                className="shrink-0 text-xs text-[#0F2744] underline underline-offset-2 raleway"
                                onClick={clearCategoryFilters}
                            >
                                Clear all
                            </button>
                        ) : null}
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    <CategoryFilterList categories={categories} />
                </div>
                <div className="shrink-0 border-t p-4">
                    <Button
                        type="button"
                        className="w-full bg-[#0F2744] hover:bg-[#1B3F66]"
                        onClick={() => onOpenChange(false)}
                    >
                        Done
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
