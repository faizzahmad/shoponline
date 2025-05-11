import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, ShoppingCart, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteNavDropDown } from "./site-nav-dropDown";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getLatestCategories } from "@/actions/category";
import MobileSidebar from "./mobile-sidebar";

 export const SiteNavbar = async() => {
    const externalUser = await currentUser(); 
    const categories = await getLatestCategories(10);
    const userButtonAppearance = {
        elements: {
          userButtonAvatarBox: "w-10 h-10", 
          
        },
      };
    return (
        <>
         <nav className=" bg-indigo-50 py-4 xl:px-10 px-5  raleway lg:border-b-0  border-b-[5px] border-rose-600">
            <div className="hidden lg:flex items-center justify-between">
                <div className="flex xl:gap-16 gap-6 items-center">
            <Image src={'/images/web/logo.svg'} alt="Logo" height={40} width={100}></Image>
            <ul className=" xl:flex xl:gap-x-10 gap-5 font-semibold uppercase text-rose-600 hidden">
                <li>
                    <Link href={'/'}>Offres</Link>
                </li>
                <li>
                    <Link href={'/'}>Best-Sellers </Link>
                </li>
               
            </ul>
            <form className="xl:w-[500px] w-[400px] flex bg-white h-12 items-center rounded-full shadow-sm border">
            <Button variant={'icon'} className=" bg-transparent ">
                    <SearchIcon className="size-5"/>
                </Button>
                <Input className="bg-transparent border-none rounded-none shadow-none flex-shrink " placeholder="Search Balloons, Party Caps, Candles, Decorations, Gifts..."/>
               
            </form>
            </div>

            <div className=" flex gap-3 text-rose-600 text-[1rem]">
                
            </div>

            <div className="flex gap-10 items-center">
          
            <div className="flex  gap-2 cursor-pointer items-center justify-center">
               {
                 externalUser ? (
                        <div className="flex gap-3 items-center">
                            
                            <UserButton  appearance={userButtonAppearance}/>

                            <div>
                            <Link href={'/account'} className="flex items-center hover:text-red-600 transition">
                            Account Page
                           
                             </Link>
                            </div>
                            

                        </div>
                 )  : (
                    <ul className="flex gap-3">
                    <li>
                    <Link href={'/sign-in'} className="flex items-center hover:text-red-600 transition">
                 
                    <span className=" font-semibold">Sign-in</span>
                    </Link>
                    </li>
                    <li>
                    <Separator
                        orientation="vertical"
                        className="h-6 w-[2px] bg-neutral-600"
                        />
                    </li>
                    <li>
                        
                    <Link href={'/sign-up'} className="flex items-center gap-2 hover:text-red-600 transition">
                    <UserPlus className="size-5"/>
                    <span className=" font-semibold">Create an account</span>
                    </Link>
                    </li>
                </ul>
                 )
               }
            </div>

            <div className="flex flex-col gap-1 cursor-pointer items-center justify-center hover:text-red-600 transition">
                <ShoppingCart className="size-5"/>
                    <span className="text-xs font-semibold">Cart</span>
            </div>
            </div>
            </div>
            <div className="lg:hidden">
                <MobileSidebar/>
            </div>
         </nav>
         <div className="w-full h-8 bg-rose-600 xl:text-lg text-[1rem] hidden lg:flex items-center justify-center xl:gap-8 gap-5 text-white font-[500] raleway">
                  
        {
            categories.map((category) => (
                <div className="relative group" key={category._id}>
                        <Link href={'/'}>{category.title}</Link>
                     {
                        category.subCategories.length > 0 && (
                               <SiteNavDropDown subCategories={category.subCategories}/>
                        )
                     }


                </div>
            ))
        }
         </div>
         </>
    )
 }