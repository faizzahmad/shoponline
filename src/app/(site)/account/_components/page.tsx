import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {SignInPage} from '@/app/(auth)/_components/sign-in-page';
import { RedirectLink } from '@/components/custom/redirect-link';
const Signin = async() => {
  const { userId } = await auth();
  
 if(userId){
    redirect('/');
 }

    return (  
        <div className="w-full h-screen flex items-center justify-center exo">
            <div className=" h-full lg:w-[60%] mid:w-[50%] relative signin-bg hidden mid:block">
                {/* <Link href='/' className='absolute left-5 top-5 py-2 px-6 bg-white rounded-lg'>
                <Image src={'/images/web/logo.svg'} alt='logo' height={70} width={100} />
                </Link> */}
            </div> 

            <div className="w-full lg:w-[40%] mid:w-[50%] p-5 flex flex-col gap-10 h-full items-center justify-center overflow-y-auto">
                <div className=' flex flex-col gap-4 items-center'>
                     <Link href='/' className='py-2 px-4 bg-white rounded-lg shadow mid:hidden block'>
                <Image src={'/images/web/logo.svg'} alt='logo' height={50} width={70} />
                </Link>
                    <h2 className=' mid:text-[2.5rem] text-[1.5rem] font-bold'>Sign In</h2>
                    <p className=' px-10 mid:text-sm text-xs text-center raleway'>Welcome back, busy bee! Log in now to continue your
                    bee-autiful shopping journey with us</p>
                </div>
               
                <SignInPage/>
                <div>
                    {/* <p className='mid:text-sm text-xs text-center '>Don’t {"\u00A9"}</p> */}
                   <p className='mid:text-sm text-xs raleway font-semibold text-center mt-2'>
                   <RedirectLink href='sign-up' text='Create an account'/>
                   </p>
                </div>
            </div>
        </div>
    );
}
 
export default Signin;