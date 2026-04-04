"use client"
import { CustomModal } from "@/components/custom/custom-modal"
import { DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { useProductInfoModal } from "./hooks/use-product-modal";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Loader, Minus, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchData } from "@/utils/apiCall";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsChanged } from "@/store/use-ischnaged";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaFacebook, FaWhatsapp } from "react-icons/fa";



type Products = {
    _id: string;
    productName: string;
    images: string[];
    productId: string;
    productStock: string;
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    discountPrice: string;
    originalPrice: string;
    shortDescription: string;
    longDescription: string;
    varients: any[];
    createdAt: string;
    updatedAt: string;
}

export const ProductInfoModal = () => {
    const { productId, close, isOpen, isQuickBuy } = useProductInfoModal();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Products | null>(null);
    const [seletedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedQunatity, setSelectedQuantity] = useState(1);
    const [cartLoader, setCartLoader] = useState(false);
    const { setIsChanged, isChanged } = useIsChanged((state) => state);
   
    const handelGetProductInfo = async () => {
        setIsLoading(true);
        try {
            const response = await fetchData<Products>(`products/${productId}`);
            if (response) {
                setData(response);
            } else {
                console.error("No product data found for the given ID.");
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        if (productId) {
            handelGetProductInfo();
        }
    }, [productId]);

    useEffect(() => {
        if (!data) return;
        const s = Number(data.productStock);
        if (Number.isFinite(s) && s >= 1) {
            setSelectedQuantity((q) => Math.min(q, Math.min(10, s)));
        }
    }, [data?._id, data?.productStock]);

    const { isSignedIn, isLoaded, user } = useUser();
    const router = useRouter();


    const message = `
${data?.productName}

Price: {"\u20B9"}${data?.originalPrice}

Description: ${data?.shortDescription}

View Product: ${process.env.NEXT_PUBLIC_API_URL}/product-info/${data?._id}
`;

const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_API_URL + '/product-info/' + data?._id)}`;

    const stock = data ? Number(data.productStock) : 0;
    const isOutOfStock = !Number.isFinite(stock) || stock < 1;
    const maxSelectableQty = isOutOfStock ? 1 : Math.min(10, stock);

    return (
        <>
            {
                isLoading ? (<FixedLoader />) : (<CustomModal open={isOpen} onOpenChange={() => {
                    close();
                    setData(null);
                    setSelectedImageIndex(0);
                }} className="lg:max-w-[1100px] sm:max-w-[80vw]  max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
                    <DialogHeader className="hidden">
                        <DialogTitle asChild>
                            <h5>Product Info</h5>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full lg:flex gap-10">

                        <div className="lg:w-[400px] grid grid-cols-1 gap-y-5">
                            <div className="w-full aspect-square max-w-[400px] lg:block hidden overflow-hidden relative rounded-xl">
                                {data?.images?.[seletedImageIndex] && (
                                    <Image
                                        src={data.images[seletedImageIndex]}
                                        alt="productImage"
                                        className="rounded-xl object-cover object-center"
                                        fill
                                        sizes="400px"
                                    />
                                )}
                            </div>

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
                                            data?.images?.map((image, index) => (
                                                <CarouselItem className="lg:basis-[100px] basis-[80px]" key={index} onClick={() => setSelectedImageIndex(index)}>
                                                    <div className={"lg:size-[100px] size-[70px] overflow-hidden relative rounded-xl"}>
                                                        <Image src={image} alt="productImage" className="rounded-xl object-cover object-center" fill sizes="100px" />
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
                        <div className="flex-1 flex flex-col gap-y-5 justify-between mt-5 lg:mt-0">
                            <div>
                                <p className="sm:text-sm text-xs exo font-[300] capitalize">{data?.productCategory} / {data?.productSubCategory}</p>
                                
                                <div className="flex  justify-between items-center">
                                      <h4 className="raleway lg:text-2xl sm:text-xl text-lg font-semibold mt-4">{data?.productName}</h4>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger className=" bg-white shadow-sm border rounded px-4 py-1 text-sm exo flex gap-2 items-center">Share  <Share2 className="size-4" /></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel className="exo md:text-base text-sm">
                                            Share this Products
                                            <br />
                                            <span className="raleway text-xs text-muted-foreground font-[300]">
                                                 Share this product with your friends and family via social media or messaging apps.
                                            </span>
                                        </DropdownMenuLabel>
                                     
                                    
                                       
                                        <DropdownMenuItem className="w-full flex justify-center">
                                            <Link target="_blank"
                                            href={whatsappUrl}
                                            className="size-12 flex items-center justify-center text-white bg-green-500 text-3xl rounded">
                                             <FaWhatsapp/>
                                            </Link>

                                             <Link target="_blank" href={facebookUrl} className="size-12 flex items-center justify-center text-white bg-blue-500 text-3xl rounded">
                                             <FaFacebook/>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                                <h5 className="lg:text-xl sm:text-lg text-base font-semibold text-rose-600 flex gap-4 mt-3">{"\u20B9"} {data?.originalPrice}  <span className="line-through text-muted-foreground !font-[300]">{"\u20B9"} {data?.discountPrice}</span></h5>
                                <p className=" text-sm text-green-600 mb-4 exo mt-2">inclusive of all taxes</p>

                                <p  className="raleway text-base mb-1">Product Quantity</p>
                                {isOutOfStock ? (
                                    <p className="text-sm font-medium text-rose-700 raleway rounded-md border border-rose-200 bg-rose-50 px-3 py-2 mb-2">
                                        This product is out of stock.
                                    </p>
                                ) : null}
                                <div className="w-[140px] grid grid-cols-3 bg-white border border-neutral-300 rounded-md h-[40px] raleway shadow-sm">
                                    <button disabled={selectedQunatity === 1 || isOutOfStock} className="w-full h-full flex items-center justify-center border-r border-neutral-300" onClick={() => setSelectedQuantity((prev) => prev > 1 ? prev - 1 : prev)}>
                                        <Minus className="size-4 cursor-pointer" />
                                    </button>

                                    <div className="w-full h-full flex items-center justify-center border-r border-neutral-300 text-lg exo">
                                        {selectedQunatity}
                                    </div>

                                    <button disabled={isOutOfStock} className="w-full h-full flex items-center justify-center border-neutral-300" onClick={() => {
                                        if (selectedQunatity < maxSelectableQty) {
                                            setSelectedQuantity((prev) => prev + 1);
                                        } else {
                                            toast.error(
                                                maxSelectableQty >= 10
                                                    ? "Maximum quantity is 10"
                                                    : `Only ${stock} in stock.`
                                            );
                                        }
                                    }}>
                                        <Plus className="size-4 cursor-pointer" />
                                    </button>
                                </div>

                                <div className="my-4">

                                    {data?.varients?.some((variantGroup) => variantGroup.products.length > 0) && (
                                        <h5 className="text-lg mb-4 exo font-semibold">Variants</h5>
                                    )}
                                    <div className="w-full flex flex-wrap gap-4">
                                        {data?.varients?.map((variantGroup: { products: any[] }) =>
                                            variantGroup.products.map((product: { productId: string; image: string; pname: string }) => (
                                                <div key={product.productId} className="flex flex-col items-center">
                                                    <Link href={`/product-info/${product.productId}`} target="_blank">
                                                        <div className="w-[60px]">
                                                            <div className="w-full h-[60px] relative border-2 border-rose-600 rounded-sm border-opacity-0 lg:hover:border-opacity-[100%] transition">
                                                                <Image
                                                                    src={product.image}
                                                                    alt={product.pname}
                                                                    className="object-cover object-center rounded-sm"
                                                                    fill
                                                                    sizes="60px"
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
                                <p className="raleway mb-6 lg:text-base sm:text-sm text-xs">
                                    {data?.shortDescription}
                                </p>

                               
                            </div>

                            <div className="flex flex-col">
                                <Button variant={'cart'} disabled={cartLoader || isOutOfStock} className="rounded-sm h-10 flex w-full items-center gap-2 raleway" onClick={async () => {
                                    if (isOutOfStock) {
                                        toast.error(`${data?.productName ?? "This product"} is out of stock.`);
                                        return;
                                    }
                                    const productItem = {
                                        productId: data!._id!,
                                        quantity: selectedQunatity,
                                        originalPrice: selectedQunatity * parseFloat(data!.originalPrice),
                                        discountPrice: selectedQunatity * parseFloat(data!.discountPrice),
                                        productName: data!.productName!,
                                        images: data?.images || [],
                                        productCategory: data!.productCategory!,
                                        productCategoryId: data!.productCategoryId!,
                                        productSubCategory: data!.productSubCategory!,
                                        productSubCategoryId: data!.productSubCategoryId!,
                                        shortDescription: data?.shortDescription || "",
                                        longDescription: data?.longDescription || "",
                                    };

                                    if (isSignedIn && isLoaded) {
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
                                                 if (isQuickBuy) {
                                                    setIsChanged(!isChanged)
                                                    setSelectedQuantity(1);
                                                    router.push(`/cart?type=buy-now&productId=${productItem.productId}`);
                                                  
                                                }else{
                                                 close();
                                                setData(null);
                                                setSelectedQuantity(1);
                                                setSelectedImageIndex(0);
                                                setIsChanged(!isChanged)
                                                }
                                                
                                               
                                            } else {
                                                throw new Error(data.error);

                                            }
                                        } catch (err) {
                                            const msg =
                                                err instanceof Error
                                                    ? err.message
                                                    : "Failed to add product to cart. Please try again.";
                                            toast.error(msg);
                                            console.error("Failed to add to cart:", err);
                                        } finally {
                                            setCartLoader(false);
                                        }
                                    } else {
                                        const fullPathWithQuery = window.location.pathname + window.location.search;
                                        router.push(`/sign-in?redirect_url=${encodeURIComponent(fullPathWithQuery)}`)
                                    }
                                }}>
                                    {
                                        isOutOfStock
                                            ? "Out of stock"
                                            : isQuickBuy
                                              ? "Checkout"
                                              : "Add to Cart"
                                    }
                                    {
                                        cartLoader && <Loader className="size-4 animate-spin" />
                                    }
                                </Button>
                                <Button variant={'outline'} className="rounded-sm mt-3 h-10 raleway"
                                    onClick={() => {
                                        close();
                                        setData(null);
                                        setSelectedImageIndex(0);
                                    }}
                                >Cancel</Button>
                            </div>
                        </div>

                    </div>
                </CustomModal>)
            }
        </>
    )
}


