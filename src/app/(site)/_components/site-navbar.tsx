
import {  UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteNavDropDown } from "./site-nav-dropDown";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@clerk/nextjs/server";
import { getLatestCategories } from "@/actions/category";
import MobileSidebar from "./mobile-sidebar";
import { SearchBar } from "./searchbar";
import { CartCount } from "./cart-count";
import { UserButtonComp } from "./user-button-comp";


type SubCategory = {
    _id: string;
    title: string;
    img: string;
}

export const SiteNavbar = async () => {
    const externalUser = await currentUser();
    const categories = await getLatestCategories(10);


  
    return (
        <header>
            <nav className="relative bg-white/90 backdrop-blur-md py-2 xl:z-[120] xl:px-10 px-5 raleway lg:border-b border-b-[4px] border-[#212121]/30">
                <div className="hidden lg:flex items-center justify-between">
                    <div className="flex xl:gap-16 gap-6 items-center">
                        <Link href={'/'} className="shrink-0">
                            <Image
                              src={'/images/web/logo.png'}
                              alt="ShopOnline"
                              height={40}
                              width={140}
                              className="h-auto w-[130px] xl:w-[140px]"
                              priority
                            />
                        </Link>
                        <ul className="xl:flex xl:gap-x-10 gap-5 font-semibold uppercase text-[#212121] hidden">
                            <li>
                                <Link href={'/shop'}>Shop</Link>
                            </li>
                            <li>
                                <Link href={'/shop?sortBy=top-selling'}>Top-Selling </Link>
                            </li>

                        </ul>
                        <SearchBar />
                    </div>

                    <div className=" flex gap-3 text-[#212121] text-[1rem]">

                    </div>

                    <div className="flex gap-10 items-center">

                        <div className="flex  gap-2 cursor-pointer items-center justify-center">
                            {
                                externalUser ? (
                                    <div className="flex gap-3 items-center">

                                      <UserButtonComp/>
                                        <div>
                                            <Link href={'/account'} className="flex items-center hover:text-[#FBC02D] transition">
                                                Account Page

                                            </Link>
                                        </div>


                                    </div>
                                ) : (
                                    <ul className="flex gap-3">
                                        <li>
                                            <Link href={'/sign-in'} className="flex items-center hover:text-[#FBC02D] transition">

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

                                            <Link href={'/sign-up'} className="flex items-center gap-2 hover:text-[#FBC02D] transition">
                                                <UserPlus className="size-5" />
                                                <span className=" font-semibold">Create an account</span>
                                            </Link>
                                        </li>
                                    </ul>
                                )
                            }
                        </div>
                    
                        <CartCount userEmail={externalUser?.primaryEmailAddress?.emailAddress} />
                    </div>
                </div>
                <div className="lg:hidden">
                    <MobileSidebar />
                </div>
            </nav>
            <div className="relative z-0 hidden h-9 w-full items-center justify-center gap-5 bg-[#212121] text-[1rem] font-[500] text-white raleway lg:flex xl:z-[100] xl:gap-8 xl:text-base">

                {
                    categories.map((category) => (
                        <div className="relative group h-full flex items-center py-1" key={category._id}>
                            <Link href={`/shop?category=${category._id}&subcategory=${category.subCategories.map((sub: SubCategory) => sub._id).join(',')}`}
                            >{category.title}</Link>
                            {
                                category.subCategories.length > 0 && (
                                    <SiteNavDropDown subCategories={category.subCategories} category_id={category._id} />
                                )
                            }


                        </div>
                    ))
                }
            </div>
        </header>
    )
}