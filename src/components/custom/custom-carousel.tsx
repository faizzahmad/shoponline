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
  urlLink: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
}

interface CustomCarouselProps {
  data: BannerSlide[];
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

  return (
    <div className="relative w-full max-w-none overflow-x-hidden">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent className="-ml-0 h-[min(70vh,920px)] min-h-[260px] w-full sm:min-h-[320px] sm:h-[min(78vh,920px)]">
          {data.map((item, index) => (
            <CarouselItem
              key={index}
              className="h-full min-w-full shrink-0 grow-0 basis-full pl-0"
            >
              <Link
                href={item.urlLink}
                aria-label={`${item.title} — ${item.ctaLabel}`}
                className="group relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-none bg-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {/* object-cover keeps the image pinned to 100% slide width; height may crop */}
                <div className="relative h-full min-h-0 w-full min-w-0 flex-1">
                  <Image
                    src={item.img}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="h-full w-full object-cover object-center transition-transform duration-[1100ms] ease-out group-hover:scale-[1.02]"
                  />
                </div>

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
                  aria-hidden
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-4 pb-8 pt-16 text-white sm:px-6 sm:pb-10 sm:pt-24 md:px-14 md:pb-16">
                  {selected === index && (
                    <div
                      key={`slide-copy-${selected}`}
                      className="raleway max-w-xl space-y-2 sm:space-y-4"
                    >
                      <p className="animate-carousel-hero-rise text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/75 sm:text-xs sm:tracking-[0.35em]">
                        Featured
                      </p>
                      <h2 className="animate-carousel-hero-rise-delay-1 text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl lg:text-5xl">
                        {item.title}
                      </h2>
                      {item.subtitle && (
                        <p className="animate-carousel-hero-rise-delay-1 max-w-md text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                          {item.subtitle}
                        </p>
                      )}
                      <div className="pointer-events-auto pt-1 animate-carousel-hero-rise-delay-2 sm:pt-2">
                        <span className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/18 sm:px-7 sm:py-2.5 sm:text-sm">
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
                  )}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/45 hover:text-white" />
        <CarouselNext className="right-3 border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/45 hover:text-white" />
      </Carousel>
    </div>
  );
};
