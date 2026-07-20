"use client"
import Image from "next/image"
import { Button } from "../ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { useProductInfoModal } from "@/app/(site)/shop/_components/hooks/use-product-modal";
import Link from "next/link";
interface ProductCardProps {
    id: string;
    title: string;
    images: string[];
    price: number;
    discountedPrice?: number;
    description?: string;
    imageContainerClassName: string;
    divCalssName: string;
    /** When set and below 1, Quick Buy / Add to cart are disabled */
    productStock?: number | string;
}

export const ProductCard = ({
    id,
    title,
    images,
    price,
    discountedPrice,
    description,
    imageContainerClassName,
    divCalssName,
    productStock,
}: ProductCardProps) => {
    const { setProductId, setIsOpen, setIsQuickBuy } = useProductInfoModal();
    const stockNum = productStock === undefined ? 1 : Number(productStock);
    const isOutOfStock = !Number.isFinite(stockNum) || stockNum < 1;

    return (
        <div
            className={cn(
                "p-3 rounded-2xl bg-white border border-[#1A1A1A]/15 shadow-[0_8px_24px_rgba(26, 26, 26,0.08)] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(26, 26, 26,0.16)] hover:-translate-y-0.5",
                divCalssName,
                isOutOfStock && "opacity-[0.88] saturate-[0.85]"
            )}
            aria-disabled={isOutOfStock}
        >
            <div className="w-full relative">
                <Carousel
                    plugins={[
                        Autoplay({
                            delay: 3500,
                        }),
                    ]}
                >
                    <CarouselContent>
                       {
                        images.map((item, index) => (
                            <CarouselItem key={index}>
                                <Link
                                    href={`/product-info/${id}`}
                                    className={cn(
                                        "block outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#1A1A1A]",
                                        imageContainerClassName
                                    )}
                                >
                                    <Image
                                        src={item}
                                        alt={title}
                                        className="rounded-xl object-cover object-center"
                                        fill
                                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 280px"
                                    />
                                </Link>
                            </CarouselItem>
                        ))
                       }
                        
                    </CarouselContent>
                    <CarouselPrevious className="left-2 z-20 size-5 text-xs border-[#1A1A1A]/25 bg-white/90 text-[#1A1A1A] hover:bg-white" />
                    <CarouselNext className="right-2 z-20 size-5 text-xs border-[#1A1A1A]/25 bg-white/90 text-[#1A1A1A] hover:bg-white" />
                </Carousel>
                <div className="absolute bottom-3 left-0 z-10 flex w-full justify-center px-2">
                    {isOutOfStock ? (
                        <span className="text-neutral-600 md:py-1 py-[2px] px-6 bg-white/95 border border-neutral-200 rounded-full md:text-xs text-[10px] font-medium raleway">
                            Out of stock
                        </span>
                    ) : (
                        <button
                            type="button"
                            className="text-[#1A1A1A] md:py-1 py-[2px] px-10 bg-white/90 border border-[#1A1A1A]/30 rounded-full md:text-xs text-[10px] font-semibold hover:bg-[#1A1A1A] hover:text-white transition"
                            onClick={() => {
                                setProductId(id);
                                setIsOpen(true);
                                setIsQuickBuy(true);
                            }}
                        >
                            Quick Buy
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-3 flex flex-col gap-y-1">
               <Link  href={`/product-info/${id}`} className="flex flex-col gap-y-1" >
                <h5 className="text-[0.9rem] font-[700] leading-snug text-[#1A1A1A] exo line-clamp-2 sm:text-[1rem] md:text-[1.1rem]">{title}</h5>
                <p className="md:text-sm text-xs font-[500] raleway w-full text-[#B8956A] truncate">
                    {description?.trim() || "Quality products across fashion, home, electronics, and more."}
                </p>
                <div className="flex items-center gap-3">
                    <p className="text-[#1A1A1A] font-[700] md:text-[1rem] text-sm exo my-1">{"\u20B9"} {price}</p>
                    {
                        discountedPrice && (
                            <p className=" line-through text-muted-foreground md:text-[1rem] text-sm">{"\u20B9"} {discountedPrice}</p>
                        )
                    }
                </div>
               </Link>
                <Button
                    variant="cart"
                    className="mt-1 raleway"
                    disabled={isOutOfStock}
                    onClick={() => {
                        if (isOutOfStock) return;
                        setProductId(id);
                        setIsOpen(true);
                    }}
                >
                    {isOutOfStock ? "Out of stock" : "Add to Cart"}
                </Button>
            </div>
        </div>
    )
}