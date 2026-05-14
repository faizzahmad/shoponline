"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchBar } from "../_components/searchbar";

const Search = () => {
    const router = useRouter();

    return (
        <div className="flex min-h-[100dvh] w-full min-w-0 max-w-full flex-col overflow-x-hidden bg-white pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]">
            <header className="sticky top-0 z-20 flex w-full min-w-0 shrink-0 items-center gap-2 border-b border-[#244d7c]/10 bg-white/95 px-3 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90 sm:px-4">
                <Button
                    type="button"
                    variant="icon"
                    className="raleway -ms-1 flex shrink-0 items-center gap-2 text-sm text-[#244d7c] sm:text-base"
                    onClick={() => router.push("/")}
                >
                    <ArrowLeft className="size-7 shrink-0 sm:size-8" aria-hidden />
                    <span className="font-medium">Back</span>
                </Button>
            </header>

            <div className="w-full min-w-0 max-w-full flex-1 px-3 pt-3 sm:px-4 sm:pt-4">
                <SearchBar variant="page" />
            </div>
        </div>
    );
};

export default Search;