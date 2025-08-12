"use client"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsChanged } from "@/store/use-ischnaged"
import { useUser } from "@clerk/nextjs"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import Autoplay from "embla-carousel-autoplay"
import { Loader, Minus, Plus, Share2, ShoppingBag, ShoppingBasket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaFacebook, FaWhatsapp } from "react-icons/fa"
import { toast } from "sonner";


type Variant = {
    type: string;
    products: any[];
    _id: string;
};

type ProductInfo = {
    _id: string;
    productName: string;
    images: string[];
    productId: string;
    productStock: number;
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    discountPrice: number;
    originalPrice: number;
    shortDescription: string;
    longDescription: string;
    varients: Variant[];
    __v: number;
    createdAt: string;
    updatedAt: string;
};

interface ProductDataProps {
    slug?: string;
}

export const ProductData = ({ slug }: ProductDataProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedQunatity, setSelectedQunatity] = useState(1);
    const [productInfo, setProductInfo] = useState<ProductInfo>({} as ProductInfo);
    const [loader, setLoader] = useState<boolean>(true);
    const [cartLoader, setCartLoader] = useState<boolean>(false);
    const router = useRouter();
    const { isSignedIn, isLoaded, user } = useUser();
    const { setIsChanged, isChanged } = useIsChanged((state) => state);
    const handelFetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${slug}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

            });
            if (!response.ok) {
                throw new Error("Failed to fetch product data");
            }
            const data = await response.json();
            setProductInfo(data);
            setLoader(false);
        } catch (error) {
            console.log("Error fetching product data:", error);
            toast.error("Failed to load product data");
            setLoader(false);

        }
    }


    useEffect(() => {
        if (slug) {
            handelFetchProduct();
        }
    }, [slug]);

    const message = `
${productInfo?.productName}

Price: ₹${productInfo?.originalPrice}

Description: ${productInfo?.shortDescription}

View Product: ${process.env.NEXT_PUBLIC_API_URL}/product-info/${productInfo?._id}
`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_API_URL + '/product-info/' + productInfo?._id)}`;



    const handelAddToCart = async () => {

           const productItem = {
                                        productId: productInfo!._id!,
                                        quantity: selectedQunatity,
                                        originalPrice: selectedQunatity * productInfo.originalPrice,
                                        discountPrice: selectedQunatity * productInfo.discountPrice,
                                        productName: productInfo!.productName!,
                                        images: productInfo?.images || [],
                                        productCategory: productInfo!.productCategory!,
                                        productCategoryId: productInfo!.productCategoryId!,
                                        productSubCategory: productInfo!.productSubCategory!,
                                        productSubCategoryId: productInfo!.productSubCategoryId!,
                                        shortDescription: productInfo?.shortDescription || "",
                                        longDescription: productInfo?.longDescription || "",
                                    };
        setCartLoader(true);
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: user?.phoneNumbers[0].phoneNumber, items: productItem }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Product added to cart successfully!");
                setIsChanged(!isChanged);
                
            } else {
                throw new Error(data.error);

            }
        } catch (err) {
            toast.error("Failed to add product to cart. Please try again.");
            console.error("Failed to add to cart:", err);
        } finally {
            setCartLoader(false);
        }
    }
    return (
        <>
            {
                loader && (
                    <div className="w-full  xl:px-36 lg:px-28 md:px-16 sm:px-10 px-10 md:py-16 py-8">
                        <div className="w-full lg:flex items-center gap-8">
                            <div className="sm:w-[500px] w-[300px]">
                                <div className="sm:size-[500px] size-[300px]">
                                    <Skeleton className="w-full h-full" />
                                </div>

                                <div className="mt-4 flex flex-wrap w-full gap-3">
                                    <div className="lg:size-[90px] size-[60px]">
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                    <div className="lg:size-[90px] size-[60px]">
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                    <div className="lg:size-[90px] size-[60px]">
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                    <div className="lg:size-[90px] size-[60px]">
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                    <div className="lg:size-[90px] size-[60px] sm:hidden">
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 mt-5 lg:mt-0">
                                <Skeleton className="w-56 h-4 mb-4" />
                                <Skeleton className="w-[80%] h-8 mb-4" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-2" />
                                <Skeleton className="w-full h-2 mb-4" />
                                <div className="mb-4 flex gap-4 items-center">
                                    <Skeleton className=" w-32 h-10" />
                                    <Skeleton className="flex-1 h-10" />
                                </div>
                                <Skeleton className="w-full h-10 mb-4" />
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="w-full xl:px-36 lg:px-28 md:px-16 sm:px-10 px-10 md:py-16 py-8">

                <div className="w-full lg:flex gap-10 items-center ">
                    <div className="sm:w-[500px] w-[300px]">
                        {
                            productInfo.images && productInfo.images.length > 0 && (
                                <div className="sm:size-[500px] size-[300px] relative rounded-lg overflow-hidden">
                                    <Image src={productInfo?.images[selectedImageIndex]} alt="productImage" className="w-full h-full object-cover" fill />
                                </div>
                            )
                        }

                        <div className="mt-4">
                            <div className="w-full">
                                <Carousel
                                    plugins={[
                                        Autoplay({
                                            delay: 3500,
                                        }),
                                    ]}
                                >
                                    <CarouselContent >
                                        {
                                            productInfo.images && productInfo.images.length > 0 && productInfo?.images.map((image, index) => (
                                                <CarouselItem className="lg:basis-[100px] basis-[80px]" key={index} onClick={() => setSelectedImageIndex(index)}>
                                                    <div className={"lg:size-[90px] size-[70px] overflow-hidden relative"}>
                                                        <Image src={image} alt="productImage" className=" rounded-lg w-full h-full object-cover" fill />
                                                    </div>
                                                </CarouselItem>
                                            ))
                                        }


                                    </CarouselContent>
                                    <CarouselPrevious className="left-0 size-4 text-xs" />
                                    <CarouselNext className="right-0 size-4 text-xs" />
                                </Carousel>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 mt-5 lg:mt-0">
                        <h6 className="uppercase text-sm font-[700] text-rose-600 raleway">
                            {productInfo.productCategory} / {productInfo.productSubCategory}
                        </h6>
                        <div className="flex mt-4  justify-between items-center">
                            <h4 className=" md:text-3xl text-xl font-[700] exo">

                                {productInfo.productName}
                            </h4>
                            <DropdownMenu>
                                <DropdownMenuTrigger className=" bg-rose-600 text-white shadow-sm border rounded px-4 py-1 md:text-sm text-xs exo flex gap-2 items-center">Share  <Share2 className="size-4" /></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel className="exo text-base">
                                        Share this Products
                                        <br />
                                        <span className="raleway text-xs text-muted-foreground font-[300]">
                                            Share this product with your friends and family via social media or messaging apps.
                                        </span>
                                    </DropdownMenuLabel>



                                    <DropdownMenuItem className="w-full flex justify-center gap-3">
                                        <Link target="_blank"
                                            href={whatsappUrl}
                                            className="size-12 flex items-center justify-center text-white bg-green-500 text-3xl rounded">
                                            <FaWhatsapp />
                                        </Link>

                                        <Link target="_blank" href={facebookUrl} className="size-12 flex items-center justify-center text-white bg-blue-500 text-3xl rounded">
                                            <FaFacebook />
                                        </Link>
                                    </DropdownMenuItem>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <p className="raleway md:text-base text-sm text-neutral-700 font-[300] mt-4">
                            {
                                productInfo.longDescription
                            }
                        </p>


                        <div className="my-4">

                            {productInfo?.varients?.some((variantGroup) => variantGroup.products.length > 0) && (
                                <h5 className="text-lg mb-4 exo font-semibold">Variants</h5>
                            )}
                            <div className="w-full flex flex-wrap gap-4">
                                {productInfo?.varients?.map((variantGroup: { products: any[] }) =>
                                    variantGroup.products.map((product: { productId: string; image: string; pname: string }) => (
                                        <div key={product.productId} className="flex flex-col items-center">
                                            <Link href={`/product-info/${product.productId}`} target="_blank">
                                                <div className="w-[60px]">
                                                    <div className="w-full h-[60px] relative border-2 border-rose-600 rounded-sm border-opacity-0 lg:hover:border-opacity-[100%] transition">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.pname}
                                                            className="w-full h-full object-cover rounded-sm"
                                                            fill
                                                        />
                                                    </div>
                                                </div>
                                            </Link>

                                            <p className="mt-2 text-sm raleway text-neutral-700">{product.pname}</p>
                                        </div>
                                    ))
                                )}


                            </div>
                        </div>


                        <div className="mt-4">
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-rose-600 font-[600] text-lg exo">₹
                                    {
                                        productInfo.originalPrice
                                    }
                                </p>
                                <p className="text-neutral-500 font-[300] text-base exo line-through">₹
                                    {
                                        productInfo.discountPrice
                                    }
                                </p>
                                <p className="text text-rose-400 font-[300] text-base raleway">
                                    {
                                        Math.round(((productInfo.discountPrice - productInfo.originalPrice) / productInfo.discountPrice) * 100)
                                    }
                                    % off</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-4 items-center">

                            <div className="flex mt-1">
                                <button className="size-10 flex  items-center justify-center bg-indigo-50 border cursor-pointer text-rose-600 rounded-tl rounded-bl"
                                    disabled={selectedQunatity <= 1}
                                    onClick={() => setSelectedQunatity(selectedQunatity > 1 ? selectedQunatity - 1 : 1)}
                                >
                                    <Minus className="size-5" />
                                </button>
                                <div className="size-10 text-lg flex  items-center justify-center bg-indigo-50 border-y ">
                                    {selectedQunatity}
                                </div>
                                <button className="size-10 text-sm flex  items-center justify-center bg-indigo-50 border cursor-pointer text-rose-600 rounded-tr rounded-br"
                                    onClick={() => {
                                        if (selectedQunatity < 10) {
                                            setSelectedQunatity(selectedQunatity + 1)
                                        } else {
                                            toast.error("You can only add up to 10 items at a time.")
                                        }
                                    }}
                                >
                                    <Plus className="size-5" />
                                </button>
                            </div>

                            <div className="flex-1">
                                <Button variant={'cart'} className="h-[42px] rounded-md w-full raleway uppercase"
                                    disabled={!isLoaded || cartLoader}
                                    onClick={() => {
                                        if (!isSignedIn) {
                                            const fullPathWithQuery = window.location.pathname + window.location.search;
                                            router.push(`/sign-in?redirect_url=${encodeURIComponent(fullPathWithQuery)}`)
                                        }else{
                                            handelAddToCart();
                                        }
                                    }}
                                >
                                    Add to Cart


                              {
                                cartLoader && (
                                      <Loader className=" animate-spin"/>
                                )
                              }
                                    <ShoppingBag />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                disabled={!isLoaded || cartLoader}
                                className="w-full h-[42px] rounded-md raleway uppercase bg-indigo-200 text-black hover:bg-indigo-300 "
                                onClick={() => {
                                    if (!isSignedIn) {
                                        const fullPathWithQuery = window.location.pathname + window.location.search;
                                        router.push(`/sign-in?redirect_url=${encodeURIComponent(fullPathWithQuery)}`)
                                    }else{
                                        handelAddToCart();
                                        router.push(`/cart?type=buy-now&productId=${productInfo._id}`);
                                    }
                                }}
                            >
                                Buy Now

                              {
                                cartLoader && (
                                      <Loader className=" animate-spin"/>
                                )
                              }
                                <ShoppingBasket />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}