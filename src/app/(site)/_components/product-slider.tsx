import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/custom/product-card";
import { ArrowRight } from "lucide-react";

interface productsProps {
    id: string;
    title: string;
    images: string[];
    price: number;
    discountedPrice?: number;

}

interface ProductSliderProps {
    carouselTitle: string;
    products: productsProps[];
}

export const ProductSlider = ({ carouselTitle, products }: ProductSliderProps) => {
    return (
        <div className="my-10 w-full lg:px-10 px-5">
            <h5 className=" md:text-[2rem] text-[1.5rem] font-[700] exo mb-5">{carouselTitle}</h5>
            <div className="w-full">

                <Carousel>
                    <CarouselContent>
                        {
                            products.map((item, index) => (
                                <CarouselItem className="md:basis-[300px] basis-[250px] pl-4" key={index}>
                                    <ProductCard
                                        images={item.images}
                                        id={item.id}
                                        title={item.title}
                                        price={item.price}
                                        discountedPrice={item.discountedPrice}
                                        imageContainerClassName="relative md:h-[250px] h-[200px] w-full"
                                    />
                                </CarouselItem>
                            ))

                        }

                        <CarouselItem className="h-auto basis-[300px] pl-4">
                            <div className="w-full p-4 shadow-sm rounded-xl bg-indigo-50 flex gap-2 items-center justify-center h-full text-rose-600 text-2xl font-semibold raleway">
                              
                                View All
                                 <ArrowRight/>
                            </div>
                        </CarouselItem>

                    </CarouselContent>
                </Carousel>

            </div>
        </div>
    )
}