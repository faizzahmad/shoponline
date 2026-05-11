"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchBar } from "../_components/searchbar";

const Search = () => {
    const router = useRouter();

    return ( 
        <div className="w-full h-screen fixed  bg-white top-0 left-0 z-10">
           <Button variant={'icon'} className="flex items-center gap-2 text-sm text-black raleway sm:text-base" onClick={() => {
            router.push('/');
           }}>
                <ArrowLeft className="size-8 text-black sm:size-10" />
                 Back to Home
            </Button>

            <div className="w-full p-3 ">
                <SearchBar/>
            </div>
        </div>
     );
}
 
export default Search;