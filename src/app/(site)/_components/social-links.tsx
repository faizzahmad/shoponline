import { FaInstagram ,FaFacebook,FaYoutube} from "react-icons/fa";

import Link from "next/link"

export const SocialLinks = () => {
    return(
        <div className=" w-full overlayimage h-[80vh] flex flex-col items-center justify-center gap-12">
                <h5 className="text-white lg:text-[3rem] md:text-[2.3rem] text-2xl font-[700] lg:leading-[3.2rem] md:leading-[2.5rem] raleway text-center z-10"> Connect with us on
                    <br />
                     social media
                </h5>
                <div className=" w-full flex md:gap-8 gap-4 items-center raleway  z-10 justify-center">
                    <Link href={'/'} target="_blank" className=' p-2 rounded bg-white text-orange-400'>
                     <FaInstagram className="lg:size-10 md:size-8 size-6" />
                    </Link>
                     <Link href={'/'} target="_blank" className=' p-2 rounded bg-white text-blue-500'>
                     <FaFacebook className="lg:size-10 md:size-8 size-6"/>
                    </Link>
                    <Link href={'/'} target="_blank" className=' p-2 rounded bg-white text-red-500'>
                     <FaYoutube className="lg:size-10 md:size-8 size-6"/>
                    </Link>

                </div>
        </div>
    )
}