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
            <h5 className="exo text-2xl font-[700]">Categories</h5>
            <CategoryFilterList categories={categories} className="mt-10" />
        </div>
    );
};
