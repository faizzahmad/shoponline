import { FaInstagram } from "react-icons/fa";
import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/najak_clothing";

export const SocialLinks = () => {
    return (
        <div className="overlayimage flex h-[72vh] w-full flex-col items-center justify-center gap-8 px-4 sm:gap-12">
            <h5 className="z-10 text-center text-lg font-[700] leading-snug text-white raleway sm:text-2xl md:text-[2.3rem] md:leading-[2.5rem] lg:text-[3rem] lg:leading-[3.2rem]">
                Get daily outfit inspiration on
                <br />
                Instagram
            </h5>
            <div className="z-10 flex w-full items-center justify-center raleway">
                <Link
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="The Najak on Instagram"
                    className="rounded bg-white p-3 text-[#E4405F] shadow-md transition hover:scale-105 hover:shadow-lg sm:p-4"
                >
                    <FaInstagram className="size-8 sm:size-10 md:size-12" />
                </Link>
            </div>
        </div>
    );
};
