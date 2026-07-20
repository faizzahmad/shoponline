import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/site-metadata";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {SignInPage} from '@/app/(auth)/_components/sign-in-page';
import { RedirectLink } from '../../_components/redirect-link';
import { BrandLogo } from '@/components/custom/brand-logo';

export const metadata: Metadata = {
    title: "Sign in",
    description: "Sign in to your ShopOnline account to track orders and check out faster.",
    ...NOINDEX_METADATA,
};

const Signin = async() => {
  const { userId } = await auth();
  
 if(userId){
    redirect('/');
 }

    return (  
        <div className="w-full h-screen flex items-center justify-center exo">
            <div className=" h-full lg:w-[60%] mid:w-[50%] relative signin-bg hidden mid:block">
                <Link href='/' className='absolute left-5 top-5 bg-white rounded-[4px] p-2'>
                <BrandLogo width={160} className="w-[140px] mid:w-[160px]" />
                </Link>
            </div> 

            <div className="w-full lg:w-[40%] mid:w-[50%] p-5 flex flex-col gap-10 h-full items-center justify-center overflow-y-auto">
                <div className=' flex flex-col gap-4 items-center'>
                     <Link href='/' className='mid:hidden block bg-white rounded-[4px] p-2'>
                <BrandLogo width={140} className="w-[130px]" />
                </Link>
                    <h2 className='text-xl font-bold sm:text-2xl mid:text-[2.5rem]'>Sign In</h2>
                    <p className='px-6 text-center text-xs raleway mid:px-10 mid:text-sm sm:text-sm'>Welcome back, busy bee! Log in now to continue your
                    bee-autiful shopping journey with us</p>
                </div>
               
                <SignInPage/>
                <div>
                    <p className='mid:text-sm text-xs text-center '>Don’t have an account</p>
                   <p className='mid:text-sm text-xs raleway font-semibold text-center mt-2'>
                   <RedirectLink href='sign-up' text='Create an account'/>
                   </p>
                </div>
            </div>
        </div>
    );
}
 
export default Signin;