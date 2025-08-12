

import { getLatestCategories } from "@/actions/category";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { use } from "react";



export const Footer = async() => { 
        const user = await currentUser();
        const categories = await getLatestCategories(10);
   return (
     <footer >
        <div className="w-full grid lg:grid-cols-4 grid-cols-2 md:gap-16 gap-8 md:p-10 p-5 bg-indigo-200">
            <div className="w-full">
               <div>
                <h4 className="md:text-2xl text-xl font-[700] raleway">
                    {
                        user ? 'Account page' : 'Register with us'
                    }
                </h4>
                {
                    user ? (
                        <ul className=" md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-rose-600">
                        <Link href="/sign-up">
                        Account Page
                        </Link>
                    </li>
                   
                </ul>
                    ) : (
                        <ul className=" md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-rose-600">
                        <Link href="/sign-up">
                        Create an account
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/sign-in">
                        Sign in to your account

                        </Link>
                    </li>
                </ul>
                    )
                }

               </div>

                <div className="mt-10">
                <h4 className="md:text-2xl text-xl font-[700] raleway">Contact Us</h4>
                <ul className="md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-rose-600">
                        <Link href="mailto:connect@beaze.in" target="_blank">
                        demo@gmail.com
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="telto:+919876543210" target="_blank">
                        +91 9876543210
                        </Link>
                    </li>

                     <li className="transition">
                        Lal bagh purnea city near sadar thana, <br /> Purnea,Bihar 854302
                    </li>
                </ul>

               </div>
            </div>

            <div className="w-full">
             <h4 className="md:text-2xl text-xl font-[700] raleway">Shop</h4>
             <ul className=" md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
{
    categories.map((category) => (
                            <li className="transition hover:text-rose-600" key={category._id}>
                        <Link href={`/shop?category=${category._id}`}>
                       {category.title}
                        </Link>
                    </li>
    ))
}
                    
                </ul>
            </div>

             <div className="w-full">
             <h4 className="md:text-2xl text-xl font-[700] raleway">About & Help</h4>
             <ul className="md:mt-5 mt-2 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        About us
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Reviews
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Terms and Conditions
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/">
                      Return & Refund Policy
                        </Link>
                    </li>
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                       Privacy Policy
                        </Link>
                    </li>
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Shipping Policy
                        </Link>
                    </li>
                   
                </ul>
            </div>
             <div className="w-full">
             <h4 className="md:text-2xl text-xl font-[700] raleway">We Offers</h4>
             <ul className="md:mt-5 mt-3 flex gap-2 flex-col exo font-[300] md:text-[1rem] text-sm">
                <li className="transition flex gap-4">
                       <p>
                           <span className="font-semibold">
                            100% ORIGINAL
                            </span> guarantee for all products at partyhub.in
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

        <div className=" bg-rose-600 p-2 w-full text-center">
          <h5 className="md:font-semibold md:text-[1rem] text-sm raleway text-white">© Copyright 2024. GiftBox. All Rights Reserved.</h5>
        </div>
    </footer>
   )
}