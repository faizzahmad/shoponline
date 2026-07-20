import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { NOINDEX_METADATA } from "@/lib/site-metadata";

export const metadata: Metadata = {
    title: "Create account",
    description: "Create a ShopOnline account for order history and a faster checkout.",
    ...NOINDEX_METADATA,
};
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUnPage } from "@/app/(auth)/_components/sign-up-page";
import { RedirectLink } from "../../_components/redirect-link";
import { BrandLogo } from "@/components/custom/brand-logo";

const SignupPage = async() => {
    const externalUser = await currentUser();
     if(externalUser){
        redirect('/');
     }
    return ( 
        <div className="w-full h-screen flex items-center justify-center exo">
        <div className=" h-full lg:w-[60%] mid:w-[50%] relative signup-bg hidden mid:block">
            <Link href='/' className='absolute left-5 top-5 bg-white rounded-[4px] p-2'>
            <BrandLogo width={160} className="w-[140px] mid:w-[160px]" />
            </Link>
        </div> 

        <div className="w-full lg:w-[40%] mid:w-[50%] p-5 flex flex-col mid:gap-10 gap-4 h-full items-center justify-center overflow-y-auto">
            <div className=' flex flex-col gap-4 items-center'>
                  <Link href='/' className='mid:hidden block bg-white rounded-[4px] p-2'>
                                <BrandLogo width={140} className="w-[130px]" />
                                </Link>
                <h2 className='text-xl font-bold sm:text-2xl mid:text-[2.5rem]'>Sign Up</h2>
            </div>
         
           <SignUnPage/>
            <div>
                <p className='mid:text-sm text-xs text-center '>
                    Already have an account ? 
                </p>
                <p className='mid:text-sm text-xs raleway font-semibold text-center mt-1'>
                  <RedirectLink href='sign-in' text='Login'/>
                   </p>
               
            </div>
        </div>
    </div>
     );
}
 
export default SignupPage;