import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/custom/product-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface productsProps {
    id: string;
    title: string;
    images: string[];
    price: number;
    discountedPrice?: number;
    productStock?: number;
    description?: string;
}

interface ProductSliderProps {
    carouselTitle: string;
    products: productsProps[];
}

export const ProductSlider = ({ carouselTitle, products }: ProductSliderProps) => {
    return (
        <div className="my-8 w-full px-5 sm:my-12 lg:px-10">
            <h5 className="mb-4 text-lg font-[700] text-[#1A1A1A] exo sm:mb-5 sm:text-xl md:text-[2rem]">{carouselTitle}</h5>
            <div className="w-full">
                <Carousel>
                    <CarouselContent>
                        {products.map((item, index) => (
                            <CarouselItem className="md:basis-[300px] basis-[250px] pl-4" key={index}>
                                <ProductCard
                                    images={item.images}
                                    id={item.id}
                                    title={item.title}
                                    price={item.price}
                                    discountedPrice={item.discountedPrice}
                                    productStock={item.productStock}
                                    description={item.description}
                                    divCalssName="sm:w-full w-full"
                                    imageContainerClassName="relative w-full aspect-[4/5] overflow-hidden rounded-xl"
                                />
                            </CarouselItem>
                        ))}

                        <CarouselItem className="h-auto basis-[300px] pl-4">
                            <Link
                                href={
                                    carouselTitle === "New Arrivals"
                                        ? "/shop?sortBy=new"
                                        : "/shop?sortBy=top-selling"
                                }
                            >
                                <div className="flex h-full w-full items-center justify-center gap-2 rounded-xl border border-[#1A1A1A]/20 bg-[#FAFAF9] p-3 text-base font-semibold text-[#1A1A1A] shadow-sm transition hover:bg-[#dbe7f4] raleway sm:p-4 sm:text-2xl">
                                    View All
                                    <ArrowRight />
                                </div>
                            </Link>
                        </CarouselItem>
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
};
