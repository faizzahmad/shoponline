"use client";

import { usePathname } from "next/navigation";
import { SearchBar } from "./searchbar";

export function MobileNavbarSearch() {
    const pathname = usePathname();

    if (pathname === "/search") return null;

    return (
        <div className="mt-2 pb-1 lg:hidden">
            <SearchBar />
        </div>
    );
}
