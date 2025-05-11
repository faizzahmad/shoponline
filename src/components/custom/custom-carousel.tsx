import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image";
import Link from "next/link";

interface Banner {
    img: string;
    urlLink: string;
  }
  
  interface CustomCarouselProps {
    data: Banner[];
  }

export const CustomCarousel = ({ data }: CustomCarouselProps) => {
    return (
        <div className=" relative w-full overflow-x-hidden">
            <Carousel>
                <CarouselContent className="h-[70vh]">
                   {
                    data.map((item,index) => (
                        <CarouselItem className="h-full" key={index}>
                       <Link href={'/'}>
                       <div className=" w-full relative h-full">
                             <Image src={item.img} alt={`carouselItem${index+1}`} fill className=" object-cover absolute"/>
                        </div> </Link>
                    </CarouselItem>
                    ))
                   }
                 
                </CarouselContent>
                <CarouselPrevious className="absolute left-3" />
                <CarouselNext className=" absolute right-3 " />
            </Carousel>

        </div>
    )
}