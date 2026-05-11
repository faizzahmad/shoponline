"use client";

import {
    CategoryFilterItem,
    CategoryFilterList,
} from "./category-filter-list";

type ShopSidebarProps = {
    categories: CategoryFilterItem[];
};

export const ShopSidebar = ({ categories }: ShopSidebarProps) => {
    return (
        <div className="w-full">
            <h5 className="exo text-lg font-[700] sm:text-2xl">Categories</h5>
            <CategoryFilterList categories={categories} className="mt-10" />
        </div>
    );
};
