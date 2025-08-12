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
    description?:string;
    imageContainerClassName : string;
    divCalssName : string;
}

export const ProductCard = ({
    id,
    title,
    images,
    price,
    discountedPrice,
    description,
    imageContainerClassName,
    divCalssName
} : ProductCardProps) => {
     const {setProductId,setIsOpen,setIsQuickBuy} = useProductInfoModal();
   

    return (
        <div className={cn("p-4 shadow-sm rounded-xl bg-indigo-50",divCalssName)}>
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
                        images.map((item,index) => (
                             <CarouselItem key={index}>
                            <div className={cn(imageContainerClassName)}>
                                <Image src={item} alt="productImage" className=" rounded-xl w-full h-full object-cover" fill />
                            </div>
                        </CarouselItem>
                        ))
                       }
                        
                    </CarouselContent>
                    <CarouselPrevious className="left-2 size-4 text-xs" />
                    <CarouselNext className="right-2 size-4 text-xs" />
                </Carousel>
                <div className="absolute bottom-3 w-full left-0 flex justify-center">
                    <button className="text-rose-500 md:py-1 py-[2px] px-10 bg-indigo-50 rounded-full md:text-xs text-[10px]" onClick={() => {
                     setProductId(id);
                        setIsOpen(true);
                        setIsQuickBuy(true);
                    }}>
                        Quick Buy
                    </button>
                </div>
            </div>
            <div className="mt-3 flex flex-col gap-y-1">
               <Link  href={`/product-info/${id}`} className="flex flex-col gap-y-1" >
                <h5 className="md:text-[1.2rem] text-[1rem] font-[600] exo">{title}</h5>
                <p className="md:text-sm text-xs font-[500] raleway truncate w-full text-neutral-600">{description} </p>
                <div className="flex items-center gap-3">
                    <p className="text-rose-600 font-[700] md:text-[1rem] text-sm exo my-2">₹ {price}</p>
                    {
                        discountedPrice && (
                            <p className=" line-through text-muted-foreground md:text-[1rem] text-sm">₹ {discountedPrice}</p>
                        )
                    }
                </div>
               </Link>
                <Button variant={'cart'} className="md:mt-3 mt-2 raleway" onClick={() => {
                     setProductId(id);
                        setIsOpen(true);
                }}>
                   Add to Cart
                </Button>
            </div>
        </div>
    )
}