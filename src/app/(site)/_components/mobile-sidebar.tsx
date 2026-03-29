
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
         <Image src={'/images/web/logo.svg'} alt="Logo" height={30} width={60}></Image>
        </Link>
            <div className="flex gap-4 items-center text-neutral-500">
                                <Link href={'/search'} className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-red-600 transition">
                                    <SearchIcon className="size-5"/>
                                        <span className="text-xs font-semibold">Search</span>
                                </Link>
                               <div className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-red-600 transition">
                                   <CartCount phoneNumber={externalUser?.phoneNumbers?.[0]?.phoneNumber} />
                               </div>
                      
            </div>
      </div>
    </div>
     );
};
 
export default MobileSidebar;