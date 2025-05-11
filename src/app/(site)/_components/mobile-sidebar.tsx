"use client";

import { SearchIcon, ShoppingCart } from "lucide-react";
import Image from "next/image";


const MobileSidebar = () => {
  
    return ( 
    <div>
        <div className="flex justify-between">
         <Image src={'/images/web/logo.svg'} alt="Logo" height={40} width={70}></Image>
            <div className="flex gap-4 items-center text-neutral-500">
                                <div className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-red-600 transition">
                                    <SearchIcon className="size-5"/>
                                        <span className="text-xs font-semibold">Search</span>
                                </div>
                               <div className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-red-600 transition">
                                   <ShoppingCart className="size-5"/>
                                       <span className="text-xs font-semibold">Cart</span>
                               </div>
                      
            </div>
      </div>
    </div>
     );
};
 
export default MobileSidebar;