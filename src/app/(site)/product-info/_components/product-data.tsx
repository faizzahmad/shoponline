"use client"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsChanged } from "@/store/use-ischnaged"
import { useGuestCart } from "@/store/use-guest-cart"
import { useUser } from "@clerk/nextjs"
import Autoplay from "embla-carousel-autoplay"
import { Loader, Minus, Plus, ShoppingBag, ShoppingBasket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type MouseEvent } from "react"
import { ShareProductMenu } from "@/components/custom/share-product-menu"
import { toast } from "sonner";
import { ProductReviewsSection } from "./product-reviews-section";
import { RelatedProductsSlider } from "./related-products-slider";
import { sanitizeRichText } from "@/utils/sanitize-rich-text";


type Variant = {
    type: string;
    products: any[];
    _id: string;
};

type VariantCombination = {
    variantId: string;
    attributes: Array<{ name: string; value: string }>;
    image?: string;
    productStock: number;
    originalPrice: number;
    discountPrice: number;
    isDefault?: boolean;
};

type VariantAttribute = {
    name: string;
    options?: string[];
    displayMode?: "image" | "text";
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
    variantDisplayMode?: "image" | "text";
    variantAttributes?: VariantAttribute[];
    variantCombinations?: VariantCombination[];
    __v: number;
    createdAt: string;
    updatedAt: string;
};

interface ProductDataProps {
    slug?: string;
}

export const ProductData = ({ slug }: ProductDataProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [selectedQunatity, setSelectedQunatity] = useState(1);
    const [productInfo, setProductInfo] = useState<ProductInfo>({} as ProductInfo);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [loader, setLoader] = useState<boolean>(true);
    const [cartLoader, setCartLoader] = useState<boolean>(false);
    const [isHeroZoomed, setIsHeroZoomed] = useState(false);
    const [heroZoomOrigin, setHeroZoomOrigin] = useState({ x: 50, y: 50 });
    const router = useRouter();
    const { isSignedIn, user } = useUser();
    const { setIsChanged, isChanged } = useIsChanged((state) => state);
    const addGuestItem = useGuestCart((s) => s.addItem);
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

    const variantCombinations = productInfo?.variantCombinations ?? [];
    const hasNewVariants = variantCombinations.length > 0;

    const selectedVariant = hasNewVariants
        ? variantCombinations.find((combo) =>
              combo.attributes.every((attr) => selectedAttributes[attr.name] === attr.value)
          ) ?? null
        : null;

    useEffect(() => {
        const s = Number(selectedVariant?.productStock ?? productInfo?.productStock ?? 0);
        if (s >= 1) {
            const cap = Math.min(10, s);
            setSelectedQunatity((q) => Math.min(q, cap));
        }
    }, [selectedVariant?.productStock, productInfo?.productStock, productInfo?._id]);

    useEffect(() => {
        if (!productInfo?._id) return;
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
    }, [productInfo?._id, hasNewVariants]);

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
        const meta = (productInfo.variantAttributes ?? []).find(
            (a) => a.name === name
        );
        const displayMode: "image" | "text" =
            meta?.displayMode === "image" ? "image" : "text";
        return { name, options, displayMode };
    });

    const stock = Number(productInfo?.productStock ?? 0);
    const activeStock = Number(selectedVariant?.productStock ?? stock);
    const activeOriginalPrice = Number(
        selectedVariant?.originalPrice ?? productInfo?.originalPrice ?? 0
    );
    const activeDiscountPrice = Number(
        selectedVariant?.discountPrice ?? productInfo?.discountPrice ?? 0
    );
    const isSelectedOutOfStock = activeStock < 1;
    const maxSelectableQty = isSelectedOutOfStock ? 1 : Math.min(10, activeStock);
    const sanitizedLongDescription = useMemo(
        () => sanitizeRichText(productInfo?.longDescription ?? ""),
        [productInfo?.longDescription]
    );

    const heroImageSrc = useMemo(() => {
        return (
            (selectedImageIndex !== null
                ? productInfo?.images?.[selectedImageIndex]
                : undefined) ||
            selectedVariant?.image ||
            productInfo?.images?.[0]
        );
    }, [selectedImageIndex, selectedVariant?.image, productInfo?.images]);

    const handleHeroMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setHeroZoomOrigin({ x, y });
    };

    const handelAddToCart = async () => {
        if (isSelectedOutOfStock) {
            toast.error(`${productInfo?.productName ?? "This product"} is out of stock.`);
            return;
        }

        const productItem = {
            productId: productInfo!._id!,
            variantId: selectedVariant?.variantId ?? "",
            variantAttributes: selectedVariant?.attributes ?? [],
            variantImage: selectedVariant?.image ?? "",
            quantity: selectedQunatity,
            originalPrice: selectedQunatity * activeOriginalPrice,
            discountPrice: selectedQunatity * activeDiscountPrice,
            productName: productInfo!.productName!,
            images: productInfo?.images || [],
            productCategory: productInfo!.productCategory!,
            productCategoryId: productInfo!.productCategoryId!,
            productSubCategory: productInfo!.productSubCategory!,
            productSubCategoryId: productInfo!.productSubCategoryId!,
            shortDescription: productInfo?.shortDescription || "",
            longDescription: productInfo?.longDescription || "",
        };

        if (!isSignedIn) {
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
            setIsChanged(!isChanged);
            return;
        }

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
            const data = await res.json();
            if (res.ok) {
                toast.success("Product added to cart successfully!");
                setIsChanged(!isChanged);

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
    }
    return (
        <>
            {
                loader && (
                    <div className="w-full  xl:px-36 lg:px-28 md:px-16 sm:px-10 px-10 md:py-16 py-8">
                        <div className="w-full lg:flex items-center gap-8">
                            <div className="w-full max-w-[500px]">
                                <div className="w-full aspect-square max-w-[500px] rounded-lg overflow-hidden">
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
            <div className="w-full xl:px-28 lg:px-16 md:px-10 sm:px-8 px-5 md:py-14 py-8 bg-[#f7fafd]">

                <div className="w-full lg:flex gap-8 items-start rounded-2xl border border-[#0F2744]/15 bg-white p-4 md:p-5 shadow-sm">
                    <div className="w-full max-w-[560px] shrink-0 lg:sticky lg:top-24 self-start">
                        {
                            heroImageSrc && (
                                <div
                                    className="relative w-full aspect-square rounded-xl overflow-hidden cursor-zoom-in"
                                    onMouseEnter={() => setIsHeroZoomed(true)}
                                    onMouseLeave={() => {
                                        setIsHeroZoomed(false);
                                        setHeroZoomOrigin({ x: 50, y: 50 });
                                    }}
                                    onMouseMove={handleHeroMouseMove}
                                >
                                    <div
                                        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
                                        style={{
                                            transform: isHeroZoomed ? "scale(2)" : "scale(1)",
                                            transformOrigin: `${heroZoomOrigin.x}% ${heroZoomOrigin.y}%`,
                                        }}
                                    >
                                        <Image
                                            src={heroImageSrc}
                                            alt={productInfo.productName || "productImage"}
                                            className="object-cover object-center"
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 500px"
                                            priority
                                        />
                                    </div>
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
                                                <CarouselItem className="lg:basis-[100px] basis-[80px]" key={index}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImageIndex(index)}
                                                        className={`lg:size-[90px] size-[70px] overflow-hidden relative rounded-lg border-2 ${
                                                            selectedImageIndex === index
                                                                ? "border-[#0F2744]"
                                                                : "border-transparent"
                                                        }`}
                                                    >
                                                        <Image src={image} alt="productImage" className="rounded-lg object-cover object-center" fill sizes="90px" />
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
                    </div>

                    <div className="flex-1 mt-5 lg:mt-0 min-w-0 lg:border-l lg:border-[#0F2744]/10 lg:pl-7">
                        <h6 className="uppercase text-[10px] font-[700] tracking-[0.16em] text-[#1B3F66] raleway sm:text-xs sm:tracking-[0.2em]">
                            {productInfo.productCategory} / {productInfo.productSubCategory}
                        </h6>
                        <div className="flex mt-4  justify-between items-center">
                            <h4 className="text-xl font-[700] leading-snug text-[#0F2744] exo sm:text-2xl md:text-4xl">

                                {productInfo.productName}
                            </h4>
                            <ShareProductMenu
                                productId={productInfo._id}
                                productName={productInfo.productName}
                                productImage={
                                    selectedVariant?.image ||
                                    productInfo.images?.[selectedImageIndex ?? 0] ||
                                    productInfo.images?.[0]
                                }
                                price={activeOriginalPrice}
                                shortDescription={productInfo.shortDescription}
                                triggerVariant="brand"
                            />
                        </div>

                        <div className="mt-4 rounded-xl bg-[#F6F7F9] p-4 border border-[#0F2744]/10">
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[#0F2744] font-[700] text-xl exo sm:text-2xl">{"\u20B9"}
                                    {activeOriginalPrice}
                                </p>
                                <p className="text-neutral-500 font-[400] text-sm exo line-through sm:text-base">{"\u20B9"}
                                    {activeDiscountPrice}
                                </p>
                                <p className="text-[#1B3F66] font-[600] text-sm raleway">
                                    {activeDiscountPrice > 0
                                        ? Math.round(
                                              ((activeDiscountPrice - activeOriginalPrice) /
                                                  activeDiscountPrice) *
                                                  100
                                          )
                                        : 0}
                                    % off
                                </p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-2 raleway">Inclusive of all taxes</p>
                        </div>

                        <div className="my-6 border-t border-[#0F2744]/10 pt-5">
                            {hasNewVariants &&
                                optionsByAttribute.map((group) => (
                                    <div key={group.name} className="mb-3">
                                <p className="text-sm font-semibold exo mb-2 capitalize text-[#0F2744]">{group.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.options.map((option) => {
                                                const isSelected = selectedAttributes[group.name] === option.value;
                                                const showAsImage =
                                                    group.displayMode === "image" &&
                                                    Boolean(option.image);
                                                if (showAsImage && option.image) {
                                                    return (
                                                        <button
                                                            key={`${group.name}-${option.value}`}
                                                            type="button"
                                                            className={`flex flex-col items-center gap-1 rounded-md border p-1.5 transition ${
                                                                isSelected
                                                                    ? "border-[#0F2744] bg-[#F6F7F9] shadow-sm"
                                                                    : "border-neutral-300 hover:border-neutral-400"
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedAttributes((prev) => ({
                                                                    ...prev,
                                                                    [group.name]: option.value,
                                                                }));
                                                                setSelectedImageIndex(null);
                                                            }}
                                                        >
                                                            <div className="relative size-14 overflow-hidden rounded sm:size-16">
                                                                <Image
                                                                    src={option.image}
                                                                    alt={option.value}
                                                                    fill
                                                                    sizes="64px"
                                                                    className="object-cover object-center"
                                                                />
                                                            </div>
                                                            <span
                                                                className={`text-xs capitalize ${
                                                                    isSelected ? "text-[#0F2744]" : "text-neutral-700"
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
                                                        className={`min-w-[2.75rem] rounded-md border px-3.5 py-2 text-sm capitalize transition ${
                                                            isSelected
                                                                ? "border-[#0F2744] bg-[#0F2744] text-white"
                                                                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
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

                            {productInfo?.varients?.some((variantGroup) => variantGroup.products.length > 0) && (
                                <h5 className="text-lg mb-4 exo font-semibold text-[#0F2744]">More Colors / Styles</h5>
                            )}
                            <div className="w-full flex flex-wrap gap-4">
                                {productInfo?.varients?.map((variantGroup: { products: any[] }) =>
                                    variantGroup.products.map((product: { productId: string; image: string; pname: string }) => (
                                        <div key={product.productId} className="flex flex-col items-center">
                                            <Link href={`/product-info/${product.productId}`} target="_blank">
                                                <div className="w-[60px]">
                                                    <div className="w-full h-[60px] relative border-2 border-[#0F2744] rounded-sm border-opacity-0 lg:hover:border-opacity-[100%] transition">
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


                        {isSelectedOutOfStock ? (
                            <p className="mt-4 text-sm font-medium text-[#0F2744] raleway rounded-md border border-[#0F2744]/20 bg-[#F6F7F9] px-3 py-2">
                                This product is out of stock.
                            </p>
                        ) : null}

                        <div className="mt-5 flex gap-4 items-center">

                            <div className="flex mt-1">
                                <button className="size-10 flex items-center justify-center bg-white border border-[#0F2744]/20 cursor-pointer text-[#0F2744] rounded-tl rounded-bl"
                                    disabled={selectedQunatity <= 1 || isSelectedOutOfStock}
                                    onClick={() => setSelectedQunatity(selectedQunatity > 1 ? selectedQunatity - 1 : 1)}
                                >
                                    <Minus className="size-5" />
                                </button>
                                <div className="size-10 text-lg flex items-center justify-center bg-white border-y border-[#0F2744]/20 ">
                                    {selectedQunatity}
                                </div>
                                <button className="size-10 text-sm flex items-center justify-center bg-white border border-[#0F2744]/20 cursor-pointer text-[#0F2744] rounded-tr rounded-br"
                                    disabled={isSelectedOutOfStock}
                                    onClick={() => {
                                        if (selectedQunatity < maxSelectableQty) {
                                            setSelectedQunatity(selectedQunatity + 1)
                                        } else {
                                            toast.error(
                                                maxSelectableQty >= 10
                                                    ? "You can only add up to 10 items at a time."
                                                    : `Only ${activeStock} in stock.`
                                            )
                                        }
                                    }}
                                >
                                    <Plus className="size-5" />
                                </button>
                            </div>

                            <div className="flex-1">
                                <Button variant={'cart'} className="h-[42px] rounded-md w-full raleway uppercase"
                                    disabled={cartLoader || isSelectedOutOfStock}
                                    onClick={() => {
                                        handelAddToCart();
                                    }}
                                >
                                    {isSelectedOutOfStock ? "Out of stock" : "Add to Cart"}


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
                                disabled={cartLoader || isSelectedOutOfStock}
                                className="w-full h-[42px] rounded-md raleway uppercase bg-[#E0E0E0] text-[#0F2744] hover:bg-[#9E9E9E] "
                                onClick={async () => {
                                    await handelAddToCart();
                                    router.push(`/cart?type=buy-now&productId=${productInfo._id}`);
                                }}
                            >
                                {isSelectedOutOfStock ? "Out of stock" : "Buy Now"}

                              {
                                cartLoader && (
                                      <Loader className=" animate-spin"/>
                                )
                              }
                                <ShoppingBasket />
                            </Button>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-lg border border-[#0F2744]/15 bg-[#F6F7F9] p-2 text-center">
                                <p className="text-xs font-semibold text-[#0F2744]">100% Original</p>
                            </div>
                            <div className="rounded-lg border border-[#0F2744]/15 bg-[#F6F7F9] p-2 text-center">
                                <p className="text-xs font-semibold text-[#0F2744]">Easy Returns</p>
                            </div>
                            <div className="rounded-lg border border-[#0F2744]/15 bg-[#F6F7F9] p-2 text-center">
                                <p className="text-xs font-semibold text-[#0F2744]">Fast Delivery</p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="mt-8 rounded-2xl border border-[#0F2744]/15 bg-white p-5 md:p-7 shadow-sm">
                    <h5 className="mb-4 text-lg font-semibold text-[#0F2744] raleway sm:text-xl">Product Details</h5>
                    <div
                        className="rich-long-desc max-w-none text-sm leading-relaxed text-neutral-700 md:text-[15px] [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl [&_a]:text-[#0F2744] [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: sanitizedLongDescription }}
                    />
                </section>

                {!loader && productInfo._id && (
                    <>
                        <ProductReviewsSection key={`reviews-${slug}`} productId={productInfo._id} />
                        <RelatedProductsSlider
                            key={`related-${slug}`}
                            excludeId={productInfo._id}
                            categoryId={productInfo.productCategoryId}
                            subCategoryId={productInfo.productSubCategoryId}
                        />
                    </>
                )}
            </div>
        </>
    )
}