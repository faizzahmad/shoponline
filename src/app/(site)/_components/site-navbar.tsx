
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
            <nav className=" bg-indigo-50 py-4 xl:px-10 px-5  raleway lg:border-b-0  border-b-[5px] border-rose-600">
                <div className="hidden lg:flex items-center justify-between">
                    <div className="flex xl:gap-16 gap-6 items-center">
                        <Link href={'/'}>
                            <Image src={'/images/web/logo.svg'} alt="Logo" height={40} width={80}></Image></Link>
                        <ul className=" xl:flex xl:gap-x-10 gap-5 font-semibold uppercase text-rose-600 hidden">
                            <li>
                                <Link href={'/shop'}>Shop</Link>
                            </li>
                            <li>
                                <Link href={'/shop?sortBy=top-selling'}>Top-Selling </Link>
                            </li>

                        </ul>
                        <SearchBar />
                    </div>

                    <div className=" flex gap-3 text-rose-600 text-[1rem]">

                    </div>

                    <div className="flex gap-10 items-center">

                        <div className="flex  gap-2 cursor-pointer items-center justify-center">
                            {
                                externalUser ? (
                                    <div className="flex gap-3 items-center">

                                      <UserButtonComp/>
                                        <div>
                                            <Link href={'/account'} className="flex items-center hover:text-red-600 transition">
                                                Account Page

                                            </Link>
                                        </div>


                                    </div>
                                ) : (
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
                                                <UserPlus className="size-5" />
                                                <span className=" font-semibold">Create an account</span>
                                            </Link>
                                        </li>
                                    </ul>
                                )
                            }
                        </div>
                    
                        <CartCount phoneNumber={externalUser?.phoneNumbers?.[0]?.phoneNumber} />
                    </div>
                </div>
                <div className="lg:hidden">
                    <MobileSidebar />
                </div>
            </nav>
            <div className="w-full h-8 bg-rose-600 xl:text-lg text-[1rem] hidden lg:flex items-center justify-center xl:gap-8 gap-5 text-white font-[500] raleway">

                {
                    categories.map((category) => (
                        <div className="relative group" key={category._id}>
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