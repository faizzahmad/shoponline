
import Link from "next/link";



export const Footer = () => { 
   return (
     <footer >
        <div className="w-full grid grid-cols-4 gap-16 p-10 bg-indigo-200">
            <div className="w-full">
               <div>
                <h4 className="text-2xl font-[700] raleway">Register with us</h4>
                <ul className=" mt-5 flex gap-2 flex-col exo font-[300]">
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

               </div>

                <div className="mt-10">
                <h4 className="text-2xl font-[700] raleway">Contact Us</h4>
                <ul className=" mt-5 flex gap-2 flex-col exo font-[300]">
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
             <h4 className="text-2xl font-[700] raleway">Shop</h4>
             <ul className=" mt-5 flex gap-2 flex-col exo font-[300]">
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Baloons
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Cake
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Cap
                        </Link>
                    </li>
                     <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Candels
                        </Link>
                    </li>
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Chocolates
                        </Link>
                    </li>
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Flowers
                        </Link>
                    </li>
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Gifts
                        </Link>
                    </li>
                    <li className="transition hover:text-rose-600">
                        <Link href="/">
                        Party Items
                        </Link>
                    </li>
                </ul>
            </div>

             <div className="w-full">
             <h4 className="text-2xl font-[700] raleway">About & Help</h4>
             <ul className=" mt-5 flex gap-2 flex-col exo font-[300]">
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
             <h4 className="text-2xl font-[700] raleway">We Offers</h4>
             <ul className=" mt-5 flex gap-2 flex-col exo font-[300]">
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
                    <li className="transition flex gap-4 mt-5">
                    <img src="/images/web/icons/acceptcard.svg" alt="acceptcard" className="size-auto" />
                       
                    </li>
                </ul>
            </div>
        </div>
        <div className=" bg-rose-600 p-2 w-full text-center">
          <h5 className="font-semibold raleway text-white">© Copyright 2024. GiftBox. All Rights Reserved.</h5>
        </div>
    </footer>
   )
}