import Image from "next/image";
import Link from "next/link";

export type OfferBannerData = {
  image: string;
  mobileImage?: string;
  title: string;
  subtitle?: string;
  link?: string;
  ctaLabel?: string;
};

type OfferBannerProps = {
  banner?: OfferBannerData | null;
};

const FALLBACK: OfferBannerData = {
  image:
    "https://az0ocw5ei9.ufs.sh/f/aoRrknTvWVjeVTaUF8Fx7YAFS2DOJ4bjgsumzNpkBylHKn6U",
  title: "Explore every aisle of our marketplace",
  subtitle:
    "Fashion, footwear, furniture, electronics, and more — curated deals across every category.",
  link: "/shop",
  ctaLabel: "Shop now",
};

export const OfferBanner = ({ banner }: OfferBannerProps) => {
  const data = banner?.image ? { ...FALLBACK, ...banner } : FALLBACK;
  const mobileSrc = data.mobileImage || data.image;

  return (
    <div className="lg:px-10 px-5 rounded-xl overflow-hidden">
      <Link
        href={data.link || "/shop"}
        className="block w-full h-[300px] relative mt-5 rounded-xl overflow-hidden group animate-soft-fade-up"
      >
        <Image
          src={data.image}
          alt={data.title}
          fill
          className="hidden object-cover transition-transform duration-700 group-hover:scale-105 md:block"
        />
        <Image
          src={mobileSrc}
          alt={data.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 md:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/85 via-[#B8956A]/55 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 text-white sm:px-6 md:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.3em] md:text-sm">
            Limited time
          </p>
          <h3 className="mt-1 max-w-xl text-lg font-bold leading-snug raleway sm:mt-2 sm:text-2xl md:text-4xl">
            {data.title}
          </h3>
          {data.subtitle ? (
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/90 sm:mt-3 sm:text-sm md:text-base">
              {data.subtitle}
            </p>
          ) : null}
          {data.ctaLabel ? (
            <span className="mt-4 inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur-sm sm:text-sm">
              {data.ctaLabel}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  );
};
