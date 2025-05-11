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
interface ProductCardProps {
    id: string;
    title: string;
    images: string[];
    price: number;
    discountedPrice?: number;
}

export const ProductCard = ({
    title,
    images,
    price,
    discountedPrice,
} : ProductCardProps) => {
    return (
        <div className="w-full p-4 shadow-sm rounded-xl bg-indigo-50">
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
                            <div className="relative h-[250px] w-full">
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
                    <button className="text-rose-500 py-1 px-10 bg-indigo-50 rounded-full text-xs">
                        Quick Buy
                    </button>
                </div>
            </div>
            <div className="mt-3 flex flex-col gap-y-1">
                <h5 className="text-[1.2rem] font-[600] exo">{title}</h5>
                <p className="text-sm font-[500] raleway truncate w-full text-neutral-600">Lorem ipsum dolor sit amet consectetur </p>
                <div className="flex items-center gap-3">
                    <p className="text-rose-600 font-[700] text-[1rem] exo my-2">₹ {price}</p>
                    {
                        discountedPrice && (
                            <p className=" line-through text-muted-foreground">₹ {discountedPrice}</p>
                        )
                    }
                </div>
                <Button variant={'cart'} className="mt-3 raleway">
                    Add to Cart
                </Button>
            </div>
        </div>
    )
}