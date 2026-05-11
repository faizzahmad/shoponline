import Image from "next/image";

export const OfferBanner = () => {
    return (
        <div className="lg:px-10 px-5 rounded-xl overflow-hidden">
            <div className="w-full h-[300px] relative mt-5 rounded-xl overflow-hidden group animate-soft-fade-up">
                <Image
                    src="https://az0ocw5ei9.ufs.sh/f/aoRrknTvWVjeVTaUF8Fx7YAFS2DOJ4bjgsumzNpkBylHKn6U"
                    alt="offerBanner"
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#244d7c]/85 via-[#426b9a]/55 to-transparent" />
                <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 text-white sm:px-6 md:px-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.3em] md:text-sm">
                        Limited time
                    </p>
                    <h3 className="mt-1 max-w-xl text-lg font-bold leading-snug raleway sm:mt-2 sm:text-2xl md:text-4xl">
                        Build your signature wardrobe this season
                    </h3>
                    <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/90 sm:mt-3 sm:text-sm md:text-base">
                        Fresh fits, premium basics, and statement pieces curated for everyday style.
                    </p>
                </div>
            </div>
        </div>
    );
};
