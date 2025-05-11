import { SignIn } from '@clerk/nextjs'
import Link from 'next/link';
const Signin = () => {
    return (  
        <div className="w-full h-screen flex items-center justify-center exo">
            <div className=" h-full w-[60%] relative signin-bg">
                {/* <Link href='/' className='absolute left-5 top-5 py-2 px-6 bg-white rounded-lg'>
                <Image src={'/images/web/logo.svg'} alt='logo' height={70} width={100} />
                </Link> */}
            </div> 

            <div className=" w-[40%] p-5 flex flex-col gap-10 h-full items-center justify-center overflow-y-auto">
                <div className=' flex flex-col gap-4 items-center'>
                    <h2 className=' text-[2.5rem] font-bold'>Sign In</h2>
                    <p className=' px-10 text-sm text-center raleway'>Welcome back, busy bee! Log in now to continue your
                    bee-autiful shopping journey with us</p>
                </div>
                <SignIn afterSignUpUrl={'/'}/>
                <div>
                    <p className='text-sm text-center '>Don’t have an account</p>
                   <p className='text-sm raleway font-semibold text-center mt-2'>
                   <Link href={'/sign-up'} className=' underline text-rose-500' >Create an account</Link>
                   </p>
                </div>
            </div>
        </div>
    );
}
 
export default Signin;