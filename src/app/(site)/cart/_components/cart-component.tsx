"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsChanged } from "@/store/use-ischnaged";
import { useUser } from "@clerk/nextjs";
import { Loader, MapPin, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCoupon } from "./hooks/use-coupon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PaymentComponent } from "../../_components/payenment-comp";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { validateDeliveryAddressParts } from "@/lib/delivery-address";
import type { CartSyncWarning } from "@/actions/cart-sync";

type OrderFormData = {
    shippingAddress: string;
    city: string;
    state: string;
    zipCode: string;
    paymentMode: "onlinePayment" | "cod";
};
type productItem = {
    productId: string;
    quantity: number;
    originalPrice: number;
    discountPrice: number;
    productName: string;
    images: string[];
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    shortDescription: string;
    longDescription: string;
    /** Present when loaded from GET /api/cart */
    availableStock?: number;
}

type couponDiscount = {
    discountPercentage: number;
    message: string;
}

export const CartComponent = () => {
    const params = useSearchParams();
    const [cartdata, setCartData] = useState<productItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { isSignedIn, isLoaded, user } = useUser();
    const { isChanged, setIsChanged } = useIsChanged((state) => state);
      const { couponCode, setCouponCode, resetCouponCode } = useCoupon();
    const [isAlertDialogOpen, setIsOpenAlert] = useState(false);
    const [cartSyncWarnings, setCartSyncWarnings] = useState<CartSyncWarning[]>([]);
    const [showCartSyncDialog, setShowCartSyncDialog] = useState(false);
    /** While true, empty refetches must not clear sync warnings (avoids dialog flashing closed). */
    const syncDialogHoldRef = useRef(false);
    const [productIdToDelete, setProductIdToDelete] = useState({
        image: "",
        productId: "",
        productName: "",

    })
    const [couponLodaer, setCouponLoader] = useState(false);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [orderId, setOrderId] = useState<string | null>(null);
  
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [couponError, setCouponError] = useState("");
    const router = useRouter();
    const [showpaymentComponent, setShowPaymentComponent] = useState(false);
    const [completingOrderRedirect, setCompletingOrderRedirect] = useState(false);
    
    // const [buyNowproductId, setBuyNowProductId] = useState<string | null>(params.get('productId') || null);
   const buyNowproductId = params.get('productId') || null;

    const [orderData, setOrderData] = useState<OrderFormData>({
        shippingAddress: "",
        city: "",
        state: "",
        zipCode: "",
        paymentMode: "onlinePayment",
    });

    const validateDeliveryDetails = (): boolean => {
        const err = validateDeliveryAddressParts({
            streetAddress: orderData.shippingAddress,
            city: orderData.city,
            state: orderData.state,
            zipCode: orderData.zipCode,
        });
        if (err) {
            toast.error(err);
            return false;
        }
        return true;
    };

    const dismissCartSyncDialog = () => {
        syncDialogHoldRef.current = false;
        setShowCartSyncDialog(false);
        setCartSyncWarnings([]);
    };

    const handelFetchCart = async () => {
        setLoading(true);
        const res = await fetch(`/api/cart?phone=${encodeURIComponent(user?.primaryPhoneNumber?.phoneNumber || "")}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (res.ok) {
            const data = await res.json();
            const warnings: CartSyncWarning[] = Array.isArray(data.warnings)
                ? data.warnings
                : [];
            if (warnings.length > 0) {
                syncDialogHoldRef.current = true;
                setCartSyncWarnings(warnings);
                setShowCartSyncDialog(true);
            } else if (!syncDialogHoldRef.current) {
                setCartSyncWarnings([]);
                setShowCartSyncDialog(false);
            }
            const rows: productItem[] = data.items ?? [];
            if (buyNowproductId && rows.length > 0) {
                const findProduct = rows.find(
                    (item: productItem) => item.productId === buyNowproductId
                );
                if (findProduct) {
                    setCartData([findProduct]);
                } else {
                    setCartData([]);
                }
            } else {
                setCartData(rows);
            }
        } else {
            console.log("Failed to fetch cart data");
        }
        setLoading(false);
    }

    useEffect(() => {
        if (isSignedIn && isLoaded && user) {
            handelFetchCart();
        }

    }, [isSignedIn, isLoaded, user]);



    const handelRemoveItem = async () => {
        setLoading(true);
        
        const res = await fetch(`/api/cart`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone: user?.primaryPhoneNumber?.phoneNumber,
                productId: productIdToDelete.productId,
            }),
        });
        if (res.ok) {
            toast.success("Item removed from cart successfully");
            syncDialogHoldRef.current = false;
            handelFetchCart();
            setIsChanged(!isChanged);
            setIsOpenAlert(false);
            setProductIdToDelete({
                image: "",
                productId: "",
                productName: "",
            });
            
        } else {
            toast.error("Failed to remove item from cart");
            console.log("Failed to remove item from cart");
        }
        setLoading(false);
    }

    const removeCartLineById = async (productId: string) => {
        if (!user?.primaryPhoneNumber?.phoneNumber) {
            toast.error("Sign in to manage your cart.");
            return;
        }
        setLoading(true);
        const res = await fetch(`/api/cart`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: user.primaryPhoneNumber.phoneNumber,
                productId,
            }),
        });
        if (res.ok) {
            toast.success("Item removed from your cart");
            syncDialogHoldRef.current = false;
            setIsChanged(!isChanged);
            await handelFetchCart();
        } else {
            const err = await res.json().catch(() => ({}));
            toast.error(typeof err?.error === "string" ? err.error : "Could not remove item");
        }
        setLoading(false);
    };

    const handelApplyCoupon = async () => {
        if (!couponCode) {
            toast.error("Please enter a coupon code");
            return;
        }else if (cartdata.length <= 0) {
            return;
        }
        else {
            setCouponLoader(true);
            const res = await fetch(`/api/coupon/use-coupon`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: couponCode,
                }),
            });

            if (res.ok) {
                const data: couponDiscount = await res.json();
                setDiscountPercentage(data.discountPercentage);
                setCouponLoader(false);
                setCouponError("");
                toast.success(data.message);
            } else {
                const errorData = await res.json();
                setCouponLoader(false);
                setCouponError(errorData.error || "Failed to apply coupon");
                toast.error(errorData.error || "Failed to apply coupon");
            }

        }

    }

    useEffect(() => {
        if (couponCode !== "" && cartdata.length > 0) {
            handelApplyCoupon();

        }
    }, [cartdata])

   
    // useEffect(() => {
    //     if (buyNowproductId && cartdata.length > 0) {
    //         const findProduct = cartdata.find(item => item.productId === buyNowproductId);
    //         if (findProduct) {
    //             setCartData(prev => prev.map(item => {
    //                 if (item.productId === buyNowproductId) {
    //                     return {
    //                         ...item,
                          
    //                     };
    //                 }
    //                 return item;
    //             }
    //             ));
    //         }
    //     }
    // },[buyNowproductId, cartdata]);

    const hasCheckoutBlocker = cartdata.some((item) => item.availableStock === 0);

    const totalPrice = cartdata
        .reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);

    const totalDiscountPrice = parseFloat((totalPrice * (discountPercentage / 100)).toFixed(2));

    const subtotal = parseFloat((totalPrice - totalDiscountPrice).toFixed(2));

    const handelPlaceOrder = async () => {
        if (hasCheckoutBlocker) {
            toast.error("Remove out-of-stock items from your cart before placing an order.");
            return;
        }
        if (cartdata.length <= 0) {
            toast.error("Your cart is empty. Please add some products to proceed.");
            return;
        }
        if (!validateDeliveryDetails()) {
            return;
        }
        if (!orderData.paymentMode) {
            toast.error("Please select a payment mode.");
            return;
        }

        setLoading(true);
        const res = await fetch(`/api/order`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userPhone: user?.primaryPhoneNumber?.phoneNumber,
                username : user?.fullName,
                items: cartdata.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    originalPrice: item.originalPrice,
                    discountPrice: item.discountPrice,
                    productName: item.productName,
                    images: item.images,
                    productCategory: item.productCategory,
                    productCategoryId: item.productCategoryId,
                    productSubCategory: item.productSubCategory,
                    productSubCategoryId: item.productSubCategoryId,
                    shortDescription: item.shortDescription,
                    longDescription: item.longDescription
                })),
                totalAmount: Math.round(subtotal),
                orderDateTime: new Date(),
                couponCode: couponCode || null,
                streetAddress: orderData.shippingAddress,
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zipCode,
                paymentMethod: orderData.paymentMode,
            }),
        });

        if (res.ok) {
            const data = await res.json();
        router.push(`/invoice/${data.orderId}`); 
        
         
            // Redirect to invoice page with order ID
       
        } else {
            const errorData = await res.json();
            toast.error(errorData.error || "Failed to place order");
            console.error("Failed to place order:", errorData);
        }
        setLoading(false);
        // Optionally, you can redirect the user to a different page after placing the order
        // router.push('/order-confirmation');
    }


      const handelPlaceOrderWithrazorpay = async () => {
        if (hasCheckoutBlocker) {
            toast.error("Remove out-of-stock items from your cart before paying.");
            return;
        }
           if (cartdata.length <= 0) {
            toast.error("Your cart is empty. Please add some products to proceed.");
            return;
        }
        if (!validateDeliveryDetails()) {
            return;
        }
        if (!orderData.paymentMode) {
            toast.error("Please select a payment mode.");
            return;
        }

        setLoading(true);
        const res = await fetch(`/api/order`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userPhone: user?.primaryPhoneNumber?.phoneNumber,
                username : user?.fullName,
                items: cartdata.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    originalPrice: item.originalPrice,
                    discountPrice: item.discountPrice,
                    productName: item.productName,
                    images: item.images,
                    productCategory: item.productCategory,
                    productCategoryId: item.productCategoryId,
                    productSubCategory: item.productSubCategory,
                    productSubCategoryId: item.productSubCategoryId,
                    shortDescription: item.shortDescription,
                    longDescription: item.longDescription
                })),
                totalAmount: Math.round(subtotal),
                orderDateTime: new Date(),
                couponCode: couponCode || null,
                streetAddress: orderData.shippingAddress,
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zipCode,
                paymentMethod: orderData.paymentMode,
            }),
        });

        if (res.ok) {
            const data = await res.json();
             setLoading(false);
             setShowPaymentComponent(true);
             setOrderId(data.orderId);
            return data.orderId;
        // Redirect to invoice page with order ID
       
        } else {
            const errorData = await res.json();
            toast.error(errorData.error || "Failed to place order");
            console.error("Failed to place order:", errorData);
        }
        setLoading(false);
        // Optionally, you can redirect the user to a different page after placing the order
        // router.push('/order-confirmation');
    }

    return (
        <>
        {completingOrderRedirect && <FixedLoader />}
        {
            showpaymentComponent && (
                 <PaymentComponent
                 amount={Math.round(subtotal)}
                 orderId={orderId ? orderId : ""}
                 onPaymentRedirecting={() => setCompletingOrderRedirect(true)}
                 onPaymentVerifyFailed={() => setCompletingOrderRedirect(false)}
                 />
            )
        }
            {
                loading && (
                    <div className="w-full flex flex-col lg:flex-row justify-center gap-6 lg:gap-10 py-4 sm:py-6 px-4 sm:px-6 lg:px-16 xl:px-24 bg-gray-50">
                        <div className="w-full lg:w-[65%] min-h-[50vh] max-h-[100vh] overflow-y-auto px-3 sm:px-5 bg-white border shadow-sm rounded-md p-4 sm:p-5">
                            <Skeleton className="w-40 sm:w-56 h-5" />
                            <div className="pb-5 pt-8 sm:pt-10 grid grid-cols-1 gap-4 sm:gap-5">
                                <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                                    <div className="w-full sm:size-[120px] h-40 sm:h-[120px] max-w-[220px] sm:max-w-none">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1 w-full">
                                        <Skeleton className="w-2/3 sm:w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-full sm:w-[90%] h-2 mb-2" />
                                        <div className="flex flex-wrap gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                                    <div className="w-full sm:size-[120px] h-40 sm:h-[120px] max-w-[220px] sm:max-w-none">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1 w-full">
                                        <Skeleton className="w-2/3 sm:w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-full sm:w-[90%] h-2 mb-2" />
                                        <div className="flex flex-wrap gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                                    <div className="w-full sm:size-[120px] h-40 sm:h-[120px] max-w-[220px] sm:max-w-none">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1 w-full">
                                        <Skeleton className="w-2/3 sm:w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-full sm:w-[90%] h-2 mb-2" />
                                        <div className="flex flex-wrap gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
                                    <div className="w-full sm:size-[120px] h-40 sm:h-[120px] max-w-[220px] sm:max-w-none">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1 w-full">
                                        <Skeleton className="w-2/3 sm:w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-full sm:w-[90%] h-2 mb-2" />
                                        <div className="flex flex-wrap gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[35%]">
                            <div className="w-full h-[130px] sm:h-[150px]">
                                <Skeleton className="w-full h-full" />

                            </div>

                            <div className="w-full h-[280px] sm:h-[400px] mt-6 sm:mt-8">
                                <Skeleton className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                )
            }

            <AlertDialog
                open={showCartSyncDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        dismissCartSyncDialog();
                    }
                }}
            >
                <AlertDialogContent className="raleway max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="exo">Updates to your cart</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="text-sm text-muted-foreground space-y-3 pt-2 text-left">
                                <p>
                                    The store may have changed prices or stock. Review the updates
                                    below. For out-of-stock products, remove them when you are ready.
                                </p>
                                <ul className="space-y-3 text-foreground/90 list-none pl-0">
                                    {cartSyncWarnings.map((w, idx) => (
                                        <li
                                            key={`${w.type}-${w.productId ?? "x"}-${idx}`}
                                            className="rounded-md border border-neutral-200/80 bg-neutral-50/80 p-3 text-sm"
                                        >
                                            <p className="text-foreground leading-snug">{w.message}</p>
                                            {w.type === "out_of_stock" && w.productId ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 border-rose-200 text-rose-700 hover:bg-rose-50"
                                                    disabled={loading}
                                                    onClick={() => removeCartLineById(w.productId!)}
                                                >
                                                    Remove {w.productName} from cart
                                                </Button>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button type="button" variant="default" onClick={dismissCartSyncDialog}>
                            Got it
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isAlertDialogOpen} onOpenChange={() => setIsOpenAlert(false)}>
                <AlertDialogContent className="raleway">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="exo">
                            Are you sure you want to delete {productIdToDelete.productName}?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="hidden">
                            This action cannot be undone. This will remove the item from your cart.
                        </AlertDialogDescription>

                        <div className="text-sm text-muted-foreground mt-4">
                            <div className="w-full flex gap-3 mt-2">
                                <div className="size-16 relative rounded-md overflow-hidden">
                                    <Image
                                        src={productIdToDelete.image}
                                        alt="productImage"
                                        className="object-cover object-center rounded-md"
                                        fill
                                        sizes="64px"
                                    />
                                </div>
                                <p className="raleway text-neutral-600">
                                    This action cannot be undone. This will remove the item from your cart.
                                </p>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handelRemoveItem} disabled={loading}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {
                cartdata.length <= 0 && loading === false && (
                    <div className={cn("w-full px-10 py-5 bg-white border-b shadow-sm h-screen flex items-center justify-center flex-col gap-3")}>
                        <ShoppingBag className="size-12 text-rose-600" />
                        <h5 className="md:text-2xl text-lg font-[600] raleway">Your Cart is Empty</h5>
                        <p className="md:text-base text-sm text-neutral-500 raleway">Please add some products to your cart to proceed.</p>
                        <Link href={'/shop'}>
                            <Button variant={'cart'} className="ralewa md:px-10 px-5 exo">
                                Go to Shop
                            </Button>
                        </Link>
                    </div>
                )
            }

            <div className={cn("w-full lg:flex lg:items-start justify-center gap-8 lg:gap-10 py-8 xl:px-32 lg:px-24 md:px-10 px-5 bg-gray-50", cartdata.length === 0 && 'hidden')}>

                <div className="w-full lg:w-[38%] xl:max-w-md order-2 space-y-5 min-w-0">

                    <Card className="border-indigo-100/90 bg-white shadow-sm overflow-hidden raleway">
                        <CardHeader className="p-4 sm:p-5 pb-2 space-y-1">
                            <CardTitle className="text-base font-semibold">Payment method</CardTitle>
                            <CardDescription className="text-xs">
                                Choose how you would like to pay for this order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                            <div className="flex gap-3 items-start">
                                <Checkbox id="onlinePayment"
                                    value={orderData.paymentMode === "onlinePayment" ? "onlinePayment" : ""}
                                    onCheckedChange={(checked) => {
                                        setOrderData({
                                            ...orderData,
                                            paymentMode: checked ? "onlinePayment" : "cod",
                                        });
                                    }}
                                    className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 mt-0.5"
                                    checked={orderData.paymentMode === "onlinePayment"}
                                />
                                <Label htmlFor="onlinePayment" className="text-sm font-normal leading-snug cursor-pointer">
                                    Pay online (card, UPI, netbanking)
                                </Label>
                            </div>
                            <div className="flex gap-3 items-start">
                                <Checkbox id="cod"
                                    value={orderData.paymentMode === "cod" ? "cod" : ""}
                                    onCheckedChange={(checked) => {
                                        setOrderData({
                                            ...orderData,
                                            paymentMode: checked ? "cod" : "onlinePayment",
                                        });
                                    }}
                                    className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 mt-0.5"
                                    checked={orderData.paymentMode === "cod"}
                                />
                                <Label htmlFor="cod" className="text-sm font-normal leading-snug cursor-pointer">
                                    Cash on delivery
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-100/90 bg-white shadow-sm overflow-hidden raleway">
                        <CardHeader className="p-4 sm:p-5 pb-2">
                            <CardTitle className="text-base font-semibold">Promo code</CardTitle>
                            <CardDescription className="text-xs">Have a coupon? Apply it here.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-0">
                            {discountPercentage <= 0 ? (
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                className="bg-white"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value.toLocaleUpperCase());
                                                }}
                                            />
                                        </div>
                                        <Button className="raleway shrink-0" onClick={handelApplyCoupon} disabled={couponLodaer}>
                                            Apply
                                            {couponLodaer && <Loader className="size-3 animate-spin ml-1" />}
                                        </Button>
                                    </div>
                                    {couponError ? (
                                        <p className="text-xs text-red-600 exo">{couponError}</p>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="bg-rose-600 text-white exo p-4 rounded-lg relative">
                                    <h5 className="font-[500] text-sm">Coupon applied</h5>
                                    <p className="mt-2 text-xs raleway pr-6">
                                        {couponCode} is applied — {discountPercentage}% off your order.
                                    </p>
                                    <button
                                        type="button"
                                        className="text-white font-[500] text-xs raleway mt-3 underline-offset-2 hover:underline"
                                        onClick={() => {
                                            resetCouponCode();
                                            setDiscountPercentage(0);
                                            toast.success("Coupon removed successfully");
                                        }}
                                        ref={buttonRef}
                                    >
                                        Remove coupon
                                    </button>
                                    <X
                                        className="size-4 absolute right-3 top-3 cursor-pointer opacity-90 hover:opacity-100"
                                        onClick={() => buttonRef.current?.click()}
                                        aria-label="Remove coupon"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-100/90 bg-white shadow-sm overflow-hidden raleway">
                        <CardHeader className="p-4 sm:p-5 pb-2 space-y-1">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <MapPin className="size-4 text-rose-600 shrink-0" aria-hidden />
                                Delivery details
                            </CardTitle>
                            <CardDescription className="text-xs">
                                We will ship your order to this address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-0">
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <Label htmlFor="cart-street" className="text-sm font-medium">
                                        Street address
                                    </Label>
                                    <Textarea
                                        id="cart-street"
                                        className="bg-white min-h-[88px] resize-y"
                                        placeholder="House / flat, building name, street, area"
                                        value={orderData.shippingAddress}
                                        onChange={(e) => {
                                            setOrderData({
                                                ...orderData,
                                                shippingAddress: e.target.value,
                                            });
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cart-city" className="text-sm font-medium">City</Label>
                                        <Input
                                            id="cart-city"
                                            className="bg-white"
                                            placeholder="City"
                                            autoComplete="address-level2"
                                            value={orderData.city}
                                            onChange={(e) =>
                                                setOrderData({ ...orderData, city: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cart-state" className="text-sm font-medium">State</Label>
                                        <Input
                                            id="cart-state"
                                            className="bg-white"
                                            placeholder="State"
                                            autoComplete="address-level1"
                                            value={orderData.state}
                                            onChange={(e) =>
                                                setOrderData({ ...orderData, state: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 sm:max-w-full">
                                        <Label htmlFor="cart-zip" className="text-sm font-medium">PIN / ZIP code</Label>
                                        <Input
                                            id="cart-zip"
                                            className="bg-white"
                                            inputMode="numeric"
                                            autoComplete="postal-code"
                                            placeholder="e.g. 110001"
                                            maxLength={8}
                                            value={orderData.zipCode}
                                            onChange={(e) =>
                                                setOrderData({
                                                    ...orderData,
                                                    zipCode: e.target.value.replace(/\D/g, "").slice(0, 8),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200/90 bg-white shadow-sm overflow-hidden raleway">
                        <CardHeader className="p-4 sm:p-5 pb-2">
                            <CardTitle className="text-base font-semibold">Order summary</CardTitle>
                            <CardDescription className="text-xs">Prices include applied discounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
                            <div className="space-y-3 text-sm">
                                {hasCheckoutBlocker ? (
                                    <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 raleway">
                                        Remove out-of-stock products from your cart before you can check
                                        out.
                                    </p>
                                ) : null}
                                <div className="flex justify-between gap-4">
                                    <span className="text-neutral-600">Item total</span>
                                    <span className="exo font-semibold tabular-nums">{"\u20B9"} {totalPrice}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-neutral-600">Shipping</span>
                                    <span className="exo text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-neutral-600">Discount</span>
                                    <span className="exo text-green-600 font-medium tabular-nums">−{"\u20B9"} {totalDiscountPrice}</span>
                                </div>
                                <div className="flex justify-between gap-4 pt-3 border-t border-dashed border-neutral-300 text-base">
                                    <span className="font-semibold">Subtotal</span>
                                    <span className="exo font-semibold text-rose-600 tabular-nums">{"\u20B9"} {subtotal}</span>
                                </div>
                            </div>
                            <div className="w-full pt-1">
                                {orderData.paymentMode === "onlinePayment" ? (
                                    <Button
                                        variant="cart"
                                        className="w-full raleway rounded-md exo h-11"
                                        disabled={loading || hasCheckoutBlocker}
                                        onClick={handelPlaceOrderWithrazorpay}
                                    >
                                        Continue to payment · {"\u20B9"} {subtotal}
                                        {loading && <Loader className="size-3 animate-spin ml-2" />}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="cart"
                                        className="w-full rounded-md h-11"
                                        disabled={loading || hasCheckoutBlocker}
                                        onClick={handelPlaceOrder}
                                    >
                                        Place order (cash on delivery)
                                        {loading && <Loader className="size-3 animate-spin ml-2" />}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>



                 <div className="w-full lg:flex-1 lg:min-w-0 lg:mt-0 mt-5 order-1 lg:min-h-[50vh] min-h-[20vh] max-h-[100vh] overflow-y-auto px-5 sm:px-6 bg-white border shadow-sm rounded-xl">


                    <div className="w-full">
                        <h5 className="flex items-center gap-4 lg:text-3xl sm:text-2xl text-xl font-[700] raleway py-5 border-b border-dashed sticky top-0 bg-white z-10">My Cart <ShoppingBag /></h5>
                        <div className="py-5 grid grid-cols-1 gap-5">
                            {
                                cartdata.map((item) => {
                                    const isOutOfStock = item.availableStock === 0;
                                    const maxSelectable = Math.min(10, item.availableStock ?? 10);
                                    return (
                                    <div
                                        className={cn(
                                            "w-full sm:flex gap-3 border-b last:border-b-0 rounded-lg p-2 -mx-2",
                                            isOutOfStock && "border border-rose-200 bg-rose-50/60"
                                        )}
                                        key={item.productId}
                                    >
                                        <div className="sm:size-[120px] size-[100px] relative rounded-xl overflow-hidden shrink-0">
                                            <Image
                                                src={item.images[0]}
                                                alt="productImage"
                                                className="object-cover object-center"
                                                fill
                                                sizes="(max-width: 640px) 100px, 120px"
                                            />
                                        </div>
                                        <div className="flex-1 p-2 min-w-0">
                                            {isOutOfStock ? (
                                                <p className="text-xs font-medium text-rose-800 raleway mb-1">
                                                    This item is out of stock. Remove it to continue
                                                    checkout.
                                                </p>
                                            ) : null}
                                            <h5 className="text-lg font-[500] exo">{item.productName}</h5>
                                            <p className="text-xs font-[300] raleway text-neutral-600 ">{
                                                item.shortDescription
                                            }</p>
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <p className="text-rose-600 font-[600] text-sm exo">{"\u20B9"} {
                                                    item.originalPrice * item.quantity
                                                }</p>
                                                <p className="text-neutral-500 font-[300] text-xs exo line-through">{"\u20B9"}
                                                    {
                                                        item.discountPrice * item.quantity
                                                    }
                                                </p>
                                                <p className="text text-rose-400 font-[300] text-xs raleway">
                                                    {
                                                        Math.round(((item.discountPrice - item.originalPrice) / item.discountPrice) * 100)
                                                    }
                                                    % off</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm raleway">
 
                                                {isOutOfStock ? (
                                                    <span className="text-sm text-rose-700 font-medium">
                                                        Out of stock
                                                    </span>
                                                ) : (
                                                <Select value={item.quantity.toString()}  onValueChange={(value) => {
                                                    if(buyNowproductId === item.productId) {
                                                        toast.error("You cannot change quantity for Buy Now product");
                                                        return;
                                                    }
                                                    setLoading(true);
                                                    fetch(`/api/cart`, {
                                                        method: "PUT",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            phone: user?.primaryPhoneNumber?.phoneNumber,
                                                            productId: item.productId,
                                                            quantity: parseInt(value),
                                                        }),
                                                    }).then(async (res) => {
                                                        if (res.ok) {
                                                            toast.success("Quantity updated successfully");
                                                            setIsChanged(!isChanged);
                                                            handelFetchCart();
                                                        } else {
                                                            const err = await res.json().catch(() => ({}));
                                                            toast.error(
                                                                typeof err?.error === "string"
                                                                    ? err.error
                                                                    : "Failed to update quantity"
                                                            );
                                                        }
                                                        setLoading(false);
                                                    }).catch((err) => {
                                                        console.error("Error updating quantity:", err);
                                                        setLoading(false);
                                                    });
                                                }}>
  <SelectTrigger className="w-24"  >
    <SelectValue placeholder="Qty" />
  </SelectTrigger>
  <SelectContent>
{Array.from(
                                                    { length: Math.max(1, maxSelectable) },
                                                    (_, i) => i + 1
                                                ).map((qty) => (
        <SelectItem key={qty} value={qty.toString()} >
           Qty {qty}
        </SelectItem>
    ))}
   
  </SelectContent>
</Select>
                                                )}
                                                {/* <div className="flex">
                                                    <div className="size-6 flex  items-center justify-center bg-white border cursor-pointer">
                                                        <Minus className="size-3" />
                                                    </div>
                                                    <div className="size-6 text-sm flex  items-center justify-center bg-white border-y">
                                                        {item.quantity}
                                                    </div>
                                                    <div className="size-6 text-sm flex  items-center justify-center bg-white border cursor-pointer">
                                                        <Plus className="size-3" />
                                                    </div>
                                                </div> */}
                                                <Button variant={'link'} disabled={loading || 
                                                    buyNowproductId === item.productId
                                                } className="text-rose-600 font-[500] text-sm exo ms-auto" onClick={() => {
                                                    {
                                                        setIsOpenAlert(true);
                                                        setProductIdToDelete({
                                                            image: item.images[0],
                                                            productId: item.productId,
                                                            productName: item.productName,
                                                        });
                                                    }
                                                }}>Remove</Button>

                                            </div>
                                        </div>
                                    </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
