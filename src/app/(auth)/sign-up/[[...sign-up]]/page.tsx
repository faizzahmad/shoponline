import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

const SignupPage = () => {
    return ( 
        <div className="w-full h-screen flex items-center justify-center exo">
        <div className=" h-full w-[60%] relative signup-bg">
            {/* <Link href='/' className='absolute left-5 top-5 py-2 px-6 bg-white rounded-lg'>
            <Image src={'/images/web/logo.svg'} alt='logo' height={70} width={100} />
            </Link> */}
        </div> 

        <div className=" w-[40%] p-5 flex flex-col gap-10 h-full items-center justify-center overflow-y-auto">
            <div className=' flex flex-col gap-4 items-center'>
                <h2 className=' text-[2.5rem] font-bold'>Sign Up</h2>
               
            </div>
            <SignUp afterSignUpUrl={'/'}/>
            <div>
                <p className='text-sm text-center '>
                    Already have an account ? 
                </p>
                <p className='text-sm raleway font-semibold text-center mt-1'>
                   <Link href={'/sign-in'} className=' underline text-rose-500' >Log-in</Link>
                   </p>
               
            </div>
        </div>
    </div>
     );
}
 
export default SignupPage;