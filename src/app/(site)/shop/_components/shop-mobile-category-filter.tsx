"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    CategoryFilterItem,
    CategoryFilterList,
} from "./category-filter-list";

type ShopMobileCategoryFilterProps = {
    categories: CategoryFilterItem[];
};

export const ShopMobileCategoryFilter = ({
    categories,
}: ShopMobileCategoryFilterProps) => {
    return (
        <div className="md:hidden w-full mb-4">
            <Drawer>
                <DrawerTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between gap-2 border-gray-500 raleway font-normal"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="size-4 shrink-0" />
                            Categories & subcategories
                        </span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="exo text-lg font-[700] sm:text-xl">
                            Categories
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="overflow-y-auto px-4 pb-6 max-h-[70vh]">
                        <CategoryFilterList categories={categories} />
                    </div>
                    <div className="border-t p-4">
                        <DrawerClose asChild>
                            <Button className="w-full bg-[#244d7c] hover:bg-[#426b9a]">
                                Done
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};
