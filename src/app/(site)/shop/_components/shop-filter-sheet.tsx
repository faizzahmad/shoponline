"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ShopFiltersPanel } from "./shop-filters-panel";
import { useCategoryDropdown } from "./hooks/use-category-dropdown";

type ShopFilterSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ShopFilterSheet = ({
    open,
    onOpenChange,
}: ShopFilterSheetProps) => {
    const { hasProductFilters, clearProductFilters } = useCategoryDropdown();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="z-[150] flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
            >
                <SheetHeader className="shrink-0 border-b px-5 py-4 text-left">
                    <div className="flex items-center justify-between gap-3 pe-8">
                        <SheetTitle className="exo text-lg font-[700]">Filters</SheetTitle>
                        {hasProductFilters ? (
                            <button
                                type="button"
                                className="shrink-0 text-xs text-[#1A1A1A] underline underline-offset-2 raleway"
                                onClick={clearProductFilters}
                            >
                                Clear all
                            </button>
                        ) : null}
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    <ShopFiltersPanel showHeading={false} />
                </div>
                <div className="shrink-0 border-t p-4">
                    <Button
                        type="button"
                        className="w-full bg-[#1A1A1A] hover:bg-[#B8956A]"
                        onClick={() => onOpenChange(false)}
                    >
                        Done
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
