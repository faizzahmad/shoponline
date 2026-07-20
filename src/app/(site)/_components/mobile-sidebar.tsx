
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import { CartCount } from "./cart-count";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";


const MobileSidebar = async() => {
 const externalUser = await currentUser();
    return ( 
    <div>
        <div className="flex justify-between">
        <Link href={'/'} className="shrink-0">
         <Image
           src={'/images/web/logo.png'}
           alt="ShopOnline"
           height={36}
           width={130}
           className="h-auto w-[120px] sm:w-[130px]"
           priority
         />
        </Link>
            <div className="flex gap-4 items-center text-[#212121]">
                                <Link href={'/shop'} className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-[#FBC02D] transition">
                                    <SearchIcon className="size-5"/>
                                        <span className="text-xs font-semibold">Search</span>
                                </Link>
                               <div className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-[#FBC02D] transition">
                                   <CartCount userEmail={externalUser?.primaryEmailAddress?.emailAddress} />
                               </div>
                      
            </div>
      </div>
    </div>
     );
};
 
export default MobileSidebar;