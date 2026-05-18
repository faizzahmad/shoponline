
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
        <Link href={'/'}>
         <Image src={'/images/web/logo.png'} alt="Logo" height={90} width={100}></Image>
        </Link>
            <div className="flex gap-4 items-center text-[#244d7c]">
                                <Link href={'/shop'} className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-[#426b9a] transition">
                                    <SearchIcon className="size-5"/>
                                        <span className="text-xs font-semibold">Search</span>
                                </Link>
                               <div className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-[#426b9a] transition">
                                   <CartCount userEmail={externalUser?.primaryEmailAddress?.emailAddress} />
                               </div>
                      
            </div>
      </div>
    </div>
     );
};
 
export default MobileSidebar;