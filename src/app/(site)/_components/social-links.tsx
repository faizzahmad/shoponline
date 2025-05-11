import { FaInstagram ,FaFacebook,FaYoutube} from "react-icons/fa";

import Link from "next/link"

export const SocialLinks = () => {
    return(
        <div className=" w-full overlayimage h-[80vh] flex flex-col items-center justify-center gap-12">
                <h5 className="text-white text-[3rem] font-[700] leading-[3.2rem] raleway text-center z-10"> Connect with us on
                    <br />
                     social media
                </h5>
                <div className=" w-full flex gap-8 items-center raleway  z-10 justify-center">
                    <Link href={'/'} target="_blank" className=' p-2 rounded bg-white text-orange-400'>
                     <FaInstagram className="size-10" />
                    </Link>
                     <Link href={'/'} target="_blank" className=' p-2 rounded bg-white text-blue-500'>
                     <FaFacebook className="size-10"/>
                    </Link>
                    <Link href={'/'} target="_blank" className=' p-2 rounded bg-white text-red-500'>
                     <FaYoutube className="size-10"/>
                    </Link>

                </div>
        </div>
    )
}