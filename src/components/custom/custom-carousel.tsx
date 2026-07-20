"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

export interface BannerSlide {
  img: string;
  mobileImg?: string;
  urlLink: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
}

interface CustomCarouselProps {
  data: BannerSlide[];
}

function SlideCopy({
  item,
  animate,
  className,
}: {
  item: BannerSlide;
  animate: boolean;
  className?: string;
}) {
  return (
    <div
      className={`raleway max-w-xl space-y-2 sm:space-y-3 ${className ?? ""}`}
    >
      <p
        className={
          animate
            ? "animate-carousel-hero-rise text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-xs sm:tracking-[0.35em]"
            : "text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-xs sm:tracking-[0.35em]"
        }
      >
        Featured
      </p>
      <h2
        className={
          animate
            ? "animate-carousel-hero-rise-delay-1 text-lg font-semibold leading-snug tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl lg:text-5xl"
            : "text-lg font-semibold leading-snug tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl lg:text-5xl"
        }
      >
        {item.title}
      </h2>
      {item.subtitle ? (
        <p
          className={
            animate
              ? "animate-carousel-hero-rise-delay-1 line-clamp-3 max-w-md text-xs leading-relaxed text-white/90 sm:line-clamp-none sm:text-base md:text-lg"
              : "line-clamp-3 max-w-md text-xs leading-relaxed text-white/90 sm:line-clamp-none sm:text-base md:text-lg"
          }
        >
          {item.subtitle}
        </p>
      ) : null}
      <div
        className={
          animate
            ? "pointer-events-auto pt-0.5 animate-carousel-hero-rise-delay-2 sm:pt-2"
            : "pointer-events-auto pt-0.5 sm:pt-2"
        }
      >
        <span className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/18 sm:px-7 sm:py-2.5 sm:text-sm">
          {item.ctaLabel}
          <span
            className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </span>
      </div>
    </div>
  );
}

export const CustomCarousel = ({ data }: CustomCarouselProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (!data?.length) return null;

  return (
    <div className="relative w-full max-w-none overflow-x-hidden bg-zinc-950 [&_.overflow-hidden]:h-auto md:[&_.overflow-hidden]:h-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent className="-ml-0 w-full !h-auto">
          {data.map((item, index) => {
            const mobileSrc = item.mobileImg || item.img;
            const isActive = selected === index;

            return (
              <CarouselItem
                key={index}
                className="min-w-full shrink-0 grow-0 basis-full pl-0"
              >
                <Link
                  href={item.urlLink}
                  aria-label={`${item.title} — ${item.ctaLabel}`}
                  className="group relative block w-full overflow-hidden bg-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {/* Mobile: min 75vh hero; tablet+ uses desktop banner below */}
                  <div className="relative min-h-[75dvh] w-full md:hidden">
                    <Image
                      src={mobileSrc}
                      alt={item.title}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center transition-transform duration-[1100ms] ease-out group-hover:scale-[1.02]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
                      aria-hidden
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] pt-20">
                      <SlideCopy item={item} animate={isActive} />
                    </div>
                  </div>

                  {/* Desktop: full-width banner */}
                  <div className="relative hidden w-full md:block">
                    <Image
                      src={item.img}
                      alt={item.title}
                      width={1920}
                      height={800}
                      priority={index === 0}
                      sizes="100vw"
                      className="h-auto w-full transition-transform duration-[1100ms] ease-out group-hover:scale-[1.01]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                      aria-hidden
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-14 pb-24 pt-16 lg:pb-28">
                      <SlideCopy item={item} animate={isActive} />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 border-white/25 bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white sm:left-3 sm:h-8 sm:w-8" />
        <CarouselNext className="right-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 border-white/25 bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white sm:right-3 sm:h-8 sm:w-8" />
      </Carousel>
    </div>
  );
};
