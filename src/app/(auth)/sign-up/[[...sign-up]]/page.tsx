import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUnPage } from "@/app/(auth)/_components/sign-up-page";
import { RedirectLink } from "../../_components/redirect-link";

const SignupPage = async() => {
    const externalUser = await currentUser();
     if(externalUser){
        redirect('/');
     }
    return ( 
        <div className="w-full h-screen flex items-center justify-center exo">
        <div className=" h-full lg:w-[60%] mid:w-[50%] relative signup-bg hidden mid:block">
            <Link href='/' className='absolute left-5 top-5'>
            <Image src={'/images/web/logo.svg'} alt='logo' height={60} width={60} />
            </Link>
        </div> 

        <div className="w-full lg:w-[40%] mid:w-[50%] p-5 flex flex-col mid:gap-10 gap-4 h-full items-center justify-center overflow-y-auto">
            <div className=' flex flex-col gap-4 items-center'>
                  <Link href='/' className=' mid:hidden block'>
                                <Image src={'/images/web/logo.svg'} alt='logo' height={50} width={50} />
                                </Link>
                <h2 className=' mid:text-[2.5rem] text-[1.5rem] font-bold'>Sign Up</h2>
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