import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const SignupPage = () => {
    return ( 
        <div className="w-full h-screen flex items-center justify-center exo">
        <div className=" h-full lg:w-[60%] mid:w-[50%] relative signup-bg hidden mid:block">
            {/* <Link href='/' className='absolute left-5 top-5 py-2 px-6 bg-white rounded-lg'>
            <Image src={'/images/web/logo.svg'} alt='logo' height={70} width={100} />
            </Link> */}
        </div> 

        <div className="w-full lg:w-[40%] mid:w-[50%] p-5 flex flex-col mid:gap-10 gap-4 h-full items-center justify-center overflow-y-auto">
            <div className=' flex flex-col gap-4 items-center'>
                  <Link href='/' className='py-2 px-6 bg-white rounded-lg shadow mid:hidden block'>
                                <Image src={'/images/web/logo.svg'} alt='logo' height={50} width={70} />
                                </Link>
                <h2 className=' mid:text-[2.5rem] text-[1.5rem] font-bold'>Sign Up</h2>
            </div>
            <SignUp afterSignUpUrl={'/'}/>
            <div>
                <p className='mid:text-sm text-xs text-center '>
                    Already have an account ? 
                </p>
                <p className='mid:text-sm text-xs raleway font-semibold text-center mt-1'>
                   <Link href={'/sign-in'} className=' underline text-rose-500' >Log-in</Link>
                   </p>
               
            </div>
        </div>
    </div>
     );
}
 
export default SignupPage;