import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import {
    BRAND_NAME,
    SOCIAL_FACEBOOK_URL,
    SOCIAL_INSTAGRAM_URL,
    SOCIAL_X_URL,
    SOCIAL_YOUTUBE_URL,
} from "@/lib/site-config";

const socials = [
    { name: "Instagram", href: SOCIAL_INSTAGRAM_URL, icon: FaInstagram },
    { name: "Facebook", href: SOCIAL_FACEBOOK_URL, icon: FaFacebookF },
    { name: "YouTube", href: SOCIAL_YOUTUBE_URL, icon: FaYoutube },
    { name: "X", href: SOCIAL_X_URL, icon: FaXTwitter },
] as const;

const shellClass =
    "inline-flex size-10 items-center justify-center rounded-full border border-white/35 text-white/90 transition duration-200 hover:border-[#1B3F66] hover:bg-[#1B3F66]/10 hover:text-[#1B3F66] sm:size-11";

export const SocialLinks = () => {
    return (
        <div className="overlayimage flex min-h-[42vh] w-full flex-col items-center justify-center gap-6 px-4 py-16 sm:min-h-[48vh] sm:gap-8 sm:py-20">
            <div className="z-10 max-w-xl text-center">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 exo sm:text-xs">
                    Stay connected
                </p>
                <h5 className="text-balance text-xl font-semibold leading-snug text-white raleway sm:text-2xl md:text-3xl md:leading-tight">
                    Follow product drops and style updates
                </h5>
            </div>
            <div className="z-10 flex items-center justify-center gap-3 sm:gap-3.5">
                {socials.map(({ name, href, icon: Icon }) => {
                    const content = <Icon className="size-4 sm:size-[1.125rem]" aria-hidden />;

                    if (!href) {
                        return (
                            <span
                                key={name}
                                aria-label={`${BRAND_NAME} on ${name}`}
                                className={shellClass}
                            >
                                {content}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${BRAND_NAME} on ${name}`}
                            className={shellClass}
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
