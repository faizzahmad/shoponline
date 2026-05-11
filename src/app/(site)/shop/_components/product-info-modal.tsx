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
import { useGuestCart } from "@/store/use-guest-cart";
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
    variantCombinations?: Array<{
        variantId: string;
        attributes: Array<{ name: string; value: string }>;
        image?: string;
        productStock: number;
        originalPrice: number;
        discountPrice: number;
        isDefault?: boolean;
    }>;
    createdAt: string;
    updatedAt: string;
}

export const ProductInfoModal = () => {
    const { productId, close, isOpen, isQuickBuy } = useProductInfoModal();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Products | null>(null);
    const [seletedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [selectedQunatity, setSelectedQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [cartLoader, setCartLoader] = useState(false);
    const { setIsChanged, isChanged } = useIsChanged((state) => state);
    const addGuestItem = useGuestCart((s) => s.addItem);
   
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

    const variantCombinations = data?.variantCombinations ?? [];
    const hasNewVariants = variantCombinations.length > 0;
    const selectedVariant = hasNewVariants
        ? variantCombinations.find((combo) =>
              combo.attributes.every((attr) => selectedAttributes[attr.name] === attr.value)
          ) ?? null
        : null;

    useEffect(() => {
        if (!data) return;
        const s = Number(selectedVariant?.productStock ?? data.productStock);
        if (Number.isFinite(s) && s >= 1) {
            setSelectedQuantity((q) => Math.min(q, Math.min(10, s)));
        }
    }, [data?._id, data?.productStock, selectedVariant?.productStock]);

    useEffect(() => {
        if (!data) return;
        if (!hasNewVariants) {
            setSelectedAttributes((prev) =>
                Object.keys(prev).length === 0 ? prev : {}
            );
            return;
        }
        const defaultVariant =
            variantCombinations.find((v) => v.isDefault) ?? variantCombinations[0];
        if (!defaultVariant) return;
        const initial: Record<string, string> = {};
        for (const attr of defaultVariant.attributes ?? []) {
            initial[attr.name] = attr.value;
        }
        setSelectedAttributes((prev) => {
            const sameSize = Object.keys(prev).length === Object.keys(initial).length;
            if (sameSize && Object.keys(initial).every((k) => prev[k] === initial[k])) {
                return prev;
            }
            return initial;
        });
    }, [data?._id, hasNewVariants]);

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
    const activeStock = Number(selectedVariant?.productStock ?? stock);
    const activeOriginalPrice = Number(
        selectedVariant?.originalPrice ?? Number(data?.originalPrice ?? 0)
    );
    const activeDiscountPrice = Number(
        selectedVariant?.discountPrice ?? Number(data?.discountPrice ?? 0)
    );
    const isSelectedOutOfStock = !Number.isFinite(activeStock) || activeStock < 1;
    const maxSelectableQty = isSelectedOutOfStock ? 1 : Math.min(10, activeStock);

    const attributeNames = hasNewVariants
        ? Array.from(
              new Set(
                  variantCombinations.flatMap((combo) =>
                      (combo.attributes ?? []).map((attr) => attr.name)
                  )
              )
          )
        : [];
    const optionsByAttribute = attributeNames.map((name) => {
        const seen = new Set<string>();
        const options: { value: string; image?: string }[] = [];
        for (const combo of variantCombinations) {
            const attr = combo.attributes.find((a) => a.name === name);
            if (!attr || seen.has(attr.value)) continue;
            seen.add(attr.value);
            const image = variantCombinations.find(
                (c) =>
                    c.image &&
                    c.attributes.some((a) => a.name === name && a.value === attr.value)
            )?.image;
            options.push({ value: attr.value, image });
        }
        return { name, options };
    });

    return (
        <>
            {
                isLoading ? (<FixedLoader />) : (<CustomModal open={isOpen} onOpenChange={() => {
                    close();
                    setData(null);
                    setSelectedImageIndex(null);
                }} className="lg:max-w-[1100px] sm:max-w-[80vw]  max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
                    <DialogHeader className="hidden">
                        <DialogTitle asChild>
                            <h5>Product Info</h5>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full lg:flex lg:items-start gap-10">

                        <div className="lg:w-[400px] grid grid-cols-1 gap-y-2 content-start shrink-0">
                            <div className="w-full aspect-square max-w-[400px] lg:block hidden overflow-hidden relative rounded-xl">
                                {(() => {
                                    const heroSrc =
                                        (seletedImageIndex !== null
                                            ? data?.images?.[seletedImageIndex]
                                            : undefined) ||
                                        selectedVariant?.image ||
                                        data?.images?.[0];
                                    if (!heroSrc) return null;
                                    return (
                                        <Image
                                            src={heroSrc}
                                            alt="productImage"
                                            className="rounded-xl object-cover object-center"
                                            fill
                                            sizes="400px"
                                        />
                                    );
                                })()}
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
                                                <CarouselItem className="lg:basis-[116px] basis-[88px]" key={index}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImageIndex(index)}
                                                        className={`lg:size-[100px] size-[70px] overflow-hidden relative rounded-xl cursor-pointer border-2 ${
                                                            seletedImageIndex === index
                                                                ? "border-[#244d7c]"
                                                                : "border-transparent"
                                                        }`}
                                                    >
                                                        <Image src={image} alt="productImage" className="rounded-xl object-cover object-center" fill sizes="100px" />
                                                    </button>
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
                                      <h4 className="raleway mt-4 text-base font-semibold sm:text-lg md:text-xl lg:text-2xl">{data?.productName}</h4>
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

                                             <Link target="_blank" href={facebookUrl} className="size-12 flex items-center justify-center text-white bg-[#244d7c] text-3xl rounded">
                                             <FaFacebook/>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                                <h5 className="mt-3 flex gap-3 text-base font-semibold text-[#244d7c] sm:gap-4 sm:text-lg lg:text-xl">{"\u20B9"} {activeOriginalPrice}  <span className="line-through text-muted-foreground !font-[300]">{"\u20B9"} {activeDiscountPrice}</span></h5>
                                <p className=" text-sm text-green-600 mb-4 exo mt-2">inclusive of all taxes</p>

                                {isSelectedOutOfStock ? (
                                    <p className="text-sm font-medium text-[#244d7c] raleway rounded-md border border-[#244d7c]/20 bg-[#eef4fb] px-3 py-2 mb-2">
                                        This product is out of stock.
                                    </p>
                                ) : null}
                                {hasNewVariants &&
                                    optionsByAttribute.map((group) => (
                                        <div key={group.name} className="mb-3">
                                            <p className="text-sm font-semibold exo mb-2 capitalize">{group.name}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.options.map((option) => {
                                                    const isSelected = selectedAttributes[group.name] === option.value;
                                                    const isColorAttr =
                                                        ["color", "colour"].includes(
                                                            group.name.trim().toLowerCase()
                                                        );
                                                    if (isColorAttr && option.image) {
                                                        return (
                                                            <button
                                                                key={`${group.name}-${option.value}`}
                                                                type="button"
                                                                className={`flex flex-col items-center gap-1 rounded-md border p-1 transition ${
                                                                    isSelected
                                                                        ? "border-[#244d7c] bg-[#eef4fb]"
                                                                        : "border-neutral-300"
                                                                }`}
                                                                onClick={() => {
                                                                    setSelectedAttributes((prev) => ({
                                                                        ...prev,
                                                                        [group.name]: option.value,
                                                                    }));
                                                                    setSelectedImageIndex(null);
                                                                }}
                                                            >
                                                                <div className="relative size-14 overflow-hidden rounded">
                                                                    <Image
                                                                        src={option.image}
                                                                        alt={option.value}
                                                                        fill
                                                                        sizes="56px"
                                                                        className="object-cover object-center"
                                                                    />
                                                                </div>
                                                                <span
                                                                    className={`text-xs capitalize ${
                                                                        isSelected ? "text-[#244d7c]" : "text-neutral-700"
                                                                    }`}
                                                                >
                                                                    {option.value}
                                                                </span>
                                                            </button>
                                                        );
                                                    }
                                                    return (
                                                        <button
                                                            key={`${group.name}-${option.value}`}
                                                            type="button"
                                                            className={`px-3 py-1.5 rounded border text-sm ${
                                                                isSelected
                                                                    ? "border-[#244d7c] text-[#244d7c] bg-[#eef4fb]"
                                                                    : "border-neutral-300 text-neutral-700"
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedAttributes((prev) => ({
                                                                    ...prev,
                                                                    [group.name]: option.value,
                                                                }));
                                                                setSelectedImageIndex(null);
                                                            }}
                                                        >
                                                            {option.value}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                <p className="raleway text-base mb-1 mt-2">Product Quantity</p>
                                <div className="w-[140px] grid grid-cols-3 bg-white border border-neutral-300 rounded-md h-[40px] raleway shadow-sm">
                                    <button disabled={selectedQunatity === 1 || isSelectedOutOfStock} className="w-full h-full flex items-center justify-center border-r border-neutral-300" onClick={() => setSelectedQuantity((prev) => prev > 1 ? prev - 1 : prev)}>
                                        <Minus className="size-4 cursor-pointer" />
                                    </button>

                                    <div className="w-full h-full flex items-center justify-center border-r border-neutral-300 text-lg exo">
                                        {selectedQunatity}
                                    </div>

                                    <button disabled={isSelectedOutOfStock} className="w-full h-full flex items-center justify-center border-neutral-300" onClick={() => {
                                        if (selectedQunatity < maxSelectableQty) {
                                            setSelectedQuantity((prev) => prev + 1);
                                        } else {
                                            toast.error(
                                                maxSelectableQty >= 10
                                                    ? "Maximum quantity is 10"
                                                    : `Only ${activeStock} in stock.`
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
                                                            <div className="w-full h-[60px] relative border-2 border-[#244d7c] rounded-sm border-opacity-0 lg:hover:border-opacity-[100%] transition">
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
                                <p className="raleway lg:text-base sm:text-sm text-xs">
                                    {data?.shortDescription}
                                </p>

                               
                            </div>

                            <div className="flex flex-col">
                                <Button variant={'cart'} disabled={cartLoader || isSelectedOutOfStock} className="rounded-sm h-10 flex w-full items-center gap-2 raleway" onClick={async () => {
                                    if (isSelectedOutOfStock) {
                                        toast.error(`${data?.productName ?? "This product"} is out of stock.`);
                                        return;
                                    }
                                    const productItem = {
                                        productId: data!._id!,
                                        variantId: selectedVariant?.variantId ?? "",
                                        variantAttributes: selectedVariant?.attributes ?? [],
                                        variantImage: selectedVariant?.image ?? "",
                                        quantity: selectedQunatity,
                                        originalPrice: selectedQunatity * activeOriginalPrice,
                                        discountPrice: selectedQunatity * activeDiscountPrice,
                                        productName: data!.productName!,
                                        images: data?.images || [],
                                        productCategory: data!.productCategory!,
                                        productCategoryId: data!.productCategoryId!,
                                        productSubCategory: data!.productSubCategory!,
                                        productSubCategoryId: data!.productSubCategoryId!,
                                        shortDescription: data?.shortDescription || "",
                                        longDescription: data?.longDescription || "",
                                    };

                                    const finishAdded = () => {
                                        if (isQuickBuy) {
                                            setIsChanged(!isChanged);
                                            setSelectedQuantity(1);
                                            router.push(`/cart?type=buy-now&productId=${productItem.productId}`);
                                        } else {
                                            close();
                                            setData(null);
                                            setSelectedQuantity(1);
                                            setSelectedImageIndex(null);
                                            setIsChanged(!isChanged);
                                        }
                                    };

                                    if (isSignedIn && isLoaded) {
                                        setCartLoader(true);
                                        try {
                                            const res = await fetch("/api/cart", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    email: user?.primaryEmailAddress?.emailAddress ?? "",
                                                    items: productItem,
                                                }),
                                            });
                                            const respData = await res.json();
                                            if (res.ok) {
                                                toast.success("Product added to cart successfully!");
                                                finishAdded();
                                            } else {
                                                throw new Error(respData.error);
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
                                        addGuestItem({
                                            productId: productItem.productId,
                                            variantId: productItem.variantId,
                                            variantAttributes: productItem.variantAttributes,
                                            variantImage: productItem.variantImage,
                                            quantity: productItem.quantity,
                                            originalPrice: activeOriginalPrice,
                                            discountPrice: activeDiscountPrice,
                                            productName: productItem.productName,
                                            images: productItem.images,
                                            productCategory: productItem.productCategory,
                                            productCategoryId: productItem.productCategoryId,
                                            productSubCategory: productItem.productSubCategory,
                                            productSubCategoryId: productItem.productSubCategoryId,
                                            shortDescription: productItem.shortDescription,
                                            longDescription: productItem.longDescription,
                                            availableStock: activeStock,
                                        });
                                        toast.success("Added to cart");
                                        finishAdded();
                                    }
                                }}>
                                    {
                                        isSelectedOutOfStock
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
                                        setSelectedImageIndex(null);
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


