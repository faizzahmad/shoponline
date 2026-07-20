

import { getLatestCategories } from "@/actions/category";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
    BRAND_DOMAIN,
    BRAND_NAME,
    CONTACT_ADDRESS,
    CONTACT_EMAIL,
    CONTACT_NAME,
    CONTACT_PHONE,
    CONTACT_PHONE_TEL,
} from "@/lib/site-config";




export const Footer = async() => { 
        const user = await currentUser();
        const categories = await getLatestCategories(10);
   return (
     <footer >
        <div className="w-full grid lg:grid-cols-4 grid-cols-2 md:gap-16 gap-8 md:p-10 p-5 bg-[#FAFAFA] text-[#212121]">
            <div className="w-full">
               <div>
                <h4 className="text-lg font-[700] raleway sm:text-xl md:text-2xl">
                    {
                        user ? 'Account page' : 'Register with us'
                    }
                </h4>
                {
                    user ? (
                        <ul className=" md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href="/sign-up">
                        Account Page
                        </Link>
                    </li>
                   
                </ul>
                    ) : (
                        <ul className=" md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href="/sign-up">
                        Create an account
                        </Link>
                    </li>
                     <li className="transition hover:text-[#FBC02D]">
                        <Link href="/sign-in">
                        Sign in to your account

                        </Link>
                    </li>
                </ul>
                    )
                }

               </div>

                <div className="mt-10">
                <h4 className="text-lg font-[700] raleway sm:text-xl md:text-2xl">Contact Us</h4>
                <ul className="md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="font-semibold">{CONTACT_NAME}</li>
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href={`mailto:${CONTACT_EMAIL}`} target="_blank">
                       {CONTACT_EMAIL}
                        </Link>
                    </li>
                     <li className="transition hover:text-[#FBC02D]">
                        <Link href={`tel:${CONTACT_PHONE_TEL}`} target="_blank" rel="noopener noreferrer">
                       {CONTACT_PHONE}
                        </Link>
                    </li>

                     <li className="transition whitespace-pre-line">
                        {CONTACT_ADDRESS}
                    </li>
                </ul>

               </div>
            </div>

            <div className="w-full">
             <h4 className="text-lg font-[700] raleway sm:text-xl md:text-2xl">Shop</h4>
             <ul className=" md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href="/shop">
                            Shop {BRAND_NAME} online
                        </Link>
                    </li>
{
    categories.map((category) => (
                            <li className="transition hover:text-[#FBC02D]" key={category._id}>
                        <Link href={`/shop?category=${category._id}`}>
                       {category.title}
                        </Link>
                    </li>
    ))
}
                    
                </ul>
            </div>

             <div className="w-full">
             <h4 className="text-lg font-[700] raleway sm:text-xl md:text-2xl">About & Help</h4>
             <ul className="md:mt-5 mt-2 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href="/about">
                        About us
                        </Link>
                    </li>
                     <li className="transition hover:text-[#FBC02D]">
                        <Link href="/about#reviews-heading">
                        Reviews
                        </Link>
                    </li>
                     <li className="transition hover:text-[#FBC02D]">
                        <Link href="/terms">
                        Terms and Conditions
                        </Link>
                    </li>
                     <li className="transition hover:text-[#FBC02D]">
                        <Link href="/policies#return-refund-policy">
                      Return & Refund Policy
                        </Link>
                    </li>
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href="/policies#privacy-policy">
                       Privacy Policy
                        </Link>
                    </li>
                    <li className="transition hover:text-[#FBC02D]">
                        <Link href="/policies#shipping-policy">
                        Shipping Policy
                        </Link>
                    </li>
                   
                </ul>
            </div>
             <div className="w-full">
             <h4 className="text-lg font-[700] raleway sm:text-xl md:text-2xl">We Offers</h4>
             <ul className="md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                <li className="transition flex gap-4">
                       <p>
                           <span className="font-semibold">
                            100% ORIGINAL
                            </span> guarantee for all products at {BRAND_DOMAIN}
                        </p>
                        
                    </li>
                    <li className="transition flex gap-4">
                        <p>
                           <span className="font-semibold">
                             Return within 14days
                            </span> of receiving your order
                        </p>
                       
                    </li>
                    <li className="transition md:flex gap-4 mt-5 hidden">
                    <img src="/images/web/icons/acceptcard.svg" alt="acceptcard" className="size-auto" />
                       
                    </li>
                </ul>
            </div>
        </div>

        <div className=" bg-[#212121] p-2 w-full text-center">
          <h5 className="md:font-semibold md:text-[1rem] text-sm raleway text-white">{"\u00A9"} Copyright 2026. {BRAND_NAME}. All Rights Reserved.</h5>
        </div>
    </footer>
   )
}
