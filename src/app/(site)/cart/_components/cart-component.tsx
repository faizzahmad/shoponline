"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsChanged } from "@/store/use-ischnaged";
import { useGuestCart } from "@/store/use-guest-cart";
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
import { normalizeAccountEmail } from "@/utils/account-email";

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
    variantId?: string;
    variantAttributes?: Array<{ name: string; value: string }>;
    /** Present when loaded from GET /api/cart */
    availableStock?: number;
    variantImage?: string;
    /** Shipping dimensions (cm) — populated from server */
    length?: number;
    breadth?: number;
    height?: number;
    /** Shipping weight in grams — populated from server */
    weight?: number;
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
        variantId: "",
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
    const guestItems = useGuestCart((s) => s.items);
    const guestSetQuantity = useGuestCart((s) => s.setQuantity);
    const guestRemoveItem = useGuestCart((s) => s.removeItem);
    const guestClear = useGuestCart((s) => s.clear);
    const guestReplaceAll = useGuestCart((s) => s.replaceAll);
    const isGuest = isLoaded && !isSignedIn;
    const guestSyncedRef = useRef<string>("");

    // const [buyNowproductId, setBuyNowProductId] = useState<string | null>(params.get('productId') || null);
   const buyNowproductId = params.get('productId') || null;

    const [guestContact, setGuestContact] = useState({ fullName: "", phone: "" });
    /** Delivery contact phone when signed in (Clerk email auth — phone collected at checkout). */
    const [signedInPhone, setSignedInPhone] = useState("");

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
        const email = normalizeAccountEmail(user?.primaryEmailAddress?.emailAddress);
        const res = await fetch(`/api/cart?email=${encodeURIComponent(email)}`, {
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

    /**
     * On sign-in, merge any guest items into the server cart, then fetch.
     * If still signed out, show guest items directly.
     */
    useEffect(() => {
        if (!isLoaded) return;
        const email = normalizeAccountEmail(user?.primaryEmailAddress?.emailAddress);
        if (isSignedIn && email) {
            const merge = async () => {
                if (guestItems.length > 0) {
                    setLoading(true);
                    try {
                        for (const it of guestItems) {
                            await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    email,
                                    items: {
                                        productId: it.productId,
                                        variantId: it.variantId ?? "",
                                        variantAttributes: it.variantAttributes ?? [],
                                        variantImage: it.variantImage ?? "",
                                        quantity: it.quantity,
                                        originalPrice: it.originalPrice,
                                        discountPrice: it.discountPrice,
                                        productName: it.productName,
                                        images: it.images,
                                        productCategory: it.productCategory,
                                        productCategoryId: it.productCategoryId,
                                        productSubCategory: it.productSubCategory,
                                        productSubCategoryId: it.productSubCategoryId,
                                        shortDescription: it.shortDescription,
                                        longDescription: it.longDescription,
                                    },
                                }),
                            });
                        }
                        guestClear();
                    } catch (e) {
                        console.error("Failed to merge guest cart:", e);
                    }
                }
                handelFetchCart();
            };
            merge();
        } else if (!isSignedIn) {
            const rows = guestItems as unknown as productItem[];
            if (buyNowproductId) {
                const found = rows.find((it) => it.productId === buyNowproductId);
                setCartData(found ? [found] : []);
            } else {
                setCartData(rows);
            }
            setLoading(false);
        }
    }, [isSignedIn, isLoaded, user?.primaryEmailAddress?.emailAddress, guestItems, buyNowproductId]);

    /**
     * Guest stock/price refresh: hits /api/cart/preview once per change-set
     * and updates the local guest store with fresh data + sync warnings.
     */
    useEffect(() => {
        if (!isLoaded || isSignedIn) return;
        if (guestItems.length === 0) {
            guestSyncedRef.current = "";
            return;
        }
        const signature = guestItems
            .map((it) => `${it.productId}:${it.variantId ?? ""}:${it.quantity}`)
            .join("|");
        if (signature === guestSyncedRef.current) return;
        guestSyncedRef.current = signature;

        const run = async () => {
            try {
                const res = await fetch("/api/cart/preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: guestItems.map((it) => ({
                            productId: it.productId,
                            variantId: it.variantId ?? "",
                            quantity: it.quantity,
                        })),
                    }),
                });
                if (!res.ok) return;
                const data = await res.json();
                const fresh = (data.items as Array<Record<string, unknown>>) ?? [];
                if (fresh.length === 0) {
                    guestClear();
                } else {
                    guestReplaceAll(
                        fresh.map((it) => ({
                            productId: String(it.productId),
                            variantId: (it.variantId as string) ?? "",
                            variantAttributes: (it.variantAttributes as { name: string; value: string }[]) ?? [],
                            variantImage: (it.variantImage as string) ?? "",
                            quantity: Number(it.quantity ?? 1),
                            originalPrice: Number(it.originalPrice ?? 0),
                            discountPrice: Number(it.discountPrice ?? 0),
                            productName: String(it.productName ?? ""),
                            images: (it.images as string[]) ?? [],
                            productCategory: String(it.productCategory ?? ""),
                            productCategoryId: String(it.productCategoryId ?? ""),
                            productSubCategory: String(it.productSubCategory ?? ""),
                            productSubCategoryId: String(it.productSubCategoryId ?? ""),
                            shortDescription: String(it.shortDescription ?? ""),
                            longDescription: String(it.longDescription ?? ""),
                            availableStock: Number(it.availableStock ?? 0),
                        }))
                    );
                }
                const warns = (data.warnings as CartSyncWarning[]) ?? [];
                if (warns.length > 0) {
                    syncDialogHoldRef.current = true;
                    setCartSyncWarnings(warns);
                    setShowCartSyncDialog(true);
                }
            } catch (e) {
                console.error("Guest cart preview failed:", e);
            }
        };
        run();
    }, [isLoaded, isSignedIn, guestItems, guestClear, guestReplaceAll]);



    const handelRemoveItem = async () => {
        if (isGuest) {
            guestRemoveItem(productIdToDelete.productId, productIdToDelete.variantId || undefined);
            toast.success("Item removed from cart");
            setIsChanged(!isChanged);
            setIsOpenAlert(false);
            setProductIdToDelete({
                image: "",
                productId: "",
                variantId: "",
                productName: "",
            });
            return;
        }
        setLoading(true);
        const res = await fetch(`/api/cart`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: normalizeAccountEmail(user?.primaryEmailAddress?.emailAddress),
                productId: productIdToDelete.productId,
                variantId: productIdToDelete.variantId,
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
                variantId: "",
                productName: "",
            });
            
        } else {
            toast.error("Failed to remove item from cart");
            console.log("Failed to remove item from cart");
        }
        setLoading(false);
    }

    const removeCartLineById = async (productId: string, variantId?: string) => {
        const em = normalizeAccountEmail(user?.primaryEmailAddress?.emailAddress);
        if (!em) {
            toast.error("Sign in to manage your cart.");
            return;
        }
        setLoading(true);
        const res = await fetch(`/api/cart`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: em,
                productId,
                variantId: variantId ?? "",
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

    const validateGuestContact = (): boolean => {
        const name = guestContact.fullName.trim();
        const phone = guestContact.phone.trim();
        if (name.length < 2) {
            toast.error("Please enter your full name (at least 2 characters).");
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            toast.error("Please enter a valid 10-digit Indian phone number.");
            return false;
        }
        return true;
    };

    const getCheckoutIdentity = (): { phone: string; name: string; userEmail: string } | null => {
        if (isSignedIn && user) {
            const userEmail = normalizeAccountEmail(user.primaryEmailAddress?.emailAddress);
            if (!userEmail) {
                toast.error("Your account needs an email address to check out.");
                return null;
            }
            const digits = signedInPhone.replace(/\D/g, "").slice(0, 10);
            if (!/^[6-9]\d{9}$/.test(digits)) {
                toast.error("Please enter a valid 10-digit Indian phone number for delivery and SMS updates.");
                return null;
            }
            return {
                phone: `+91${digits}`,
                name: (user.fullName ?? "").trim() || guestContact.fullName.trim() || "Customer",
                userEmail,
            };
        }
        if (isGuest) {
            if (!validateGuestContact()) return null;
            return {
                phone: `+91${guestContact.phone.trim()}`,
                name: guestContact.fullName.trim(),
                userEmail: "",
            };
        }
        return null;
    };

    const handelPlaceOrder = async () => {
        const identity = getCheckoutIdentity();
        if (!identity) return;
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
                userPhone: identity.phone,
                userEmail: identity.userEmail,
                username : identity.name,
                items: cartdata.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId ?? "",
                    variantAttributes: item.variantAttributes ?? [],
                    variantImage: item.variantImage ?? "",
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
            if (isGuest) {
                guestClear();
            }
            router.push(`/invoice/${data.orderId}`);
        } else {
            const errorData = await res.json();
            toast.error(errorData.error || "Failed to place order");
            console.error("Failed to place order:", errorData);
        }
        setLoading(false);
    }


      const handelPlaceOrderWithrazorpay = async () => {
        const identity = getCheckoutIdentity();
        if (!identity) return;
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
                userPhone: identity.phone,
                userEmail: identity.userEmail,
                username : identity.name,
                items: cartdata.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId ?? "",
                    variantAttributes: item.variantAttributes ?? [],
                    variantImage: item.variantImage ?? "",
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
            // Do not clear guest/server cart until Razorpay succeeds — clearing here
            // zeroed subtotal and broke /api/razorpay (min 1 paise).
            setShowPaymentComponent(true);
            setOrderId(data.orderId);
            return data.orderId;
        } else {
            const errorData = await res.json();
            toast.error(errorData.error || "Failed to place order");
            console.error("Failed to place order:", errorData);
        }
        setLoading(false);
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
                 onPaymentVerified={() => {
                     if (isLoaded && !isSignedIn) guestClear();
                 }}
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
                                                    className="mt-2 border-[#212121]/20 text-[#212121] hover:bg-[#FAFAFA]"
                                                    disabled={loading}
                                                    onClick={() => removeCartLineById(w.productId!, w.variantId)}
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
                        <ShoppingBag className="size-12 text-[#212121]" />
                        <h5 className="text-base font-[600] raleway sm:text-lg md:text-2xl">Your Cart is Empty</h5>
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

                    {isGuest ? (
                        <Card className="border-[#212121]/20/80 bg-[#FAFAFA]/50 shadow-sm overflow-hidden raleway">
                            <CardContent className="p-4 sm:p-5 flex flex-col gap-2">
                                <p className="text-sm font-medium text-[#212121]">
                                    You&apos;re shopping as a guest
                                </p>
                                <p className="text-xs text-neutral-700">
                                    You can place this order without creating an account.{" "}
                                    <button
                                        type="button"
                                        className="underline underline-offset-2 hover:text-[#212121]"
                                        onClick={() => {
                                            const fullPathWithQuery =
                                                window.location.pathname + window.location.search;
                                            router.push(
                                                `/sign-in?redirect_url=${encodeURIComponent(fullPathWithQuery)}`
                                            );
                                        }}
                                    >
                                        Sign in
                                    </button>{" "}
                                    for faster checkout next time and to track all your orders.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}

                    {isGuest ? (
                        <Card className="border-[#212121]/15/90 bg-white shadow-sm overflow-hidden raleway">
                            <CardHeader className="p-4 sm:p-5 pb-2 space-y-1">
                                <CardTitle className="text-base font-semibold">Your contact details</CardTitle>
                                <CardDescription className="text-xs">
                                    We use these to send order updates and confirm delivery.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5 pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="guest-name" className="text-sm font-medium">
                                            Full name
                                        </Label>
                                        <Input
                                            id="guest-name"
                                            className="bg-white"
                                            autoComplete="name"
                                            placeholder="e.g. Asha Sharma"
                                            value={guestContact.fullName}
                                            onChange={(e) =>
                                                setGuestContact({
                                                    ...guestContact,
                                                    fullName: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guest-phone" className="text-sm font-medium">
                                            Phone (10 digits)
                                        </Label>
                                        <Input
                                            id="guest-phone"
                                            className="bg-white"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            placeholder="10-digit mobile"
                                            maxLength={10}
                                            value={guestContact.phone}
                                            onChange={(e) =>
                                                setGuestContact({
                                                    ...guestContact,
                                                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {!isGuest ? (
                        <Card className="border-[#212121]/15/90 bg-white shadow-sm overflow-hidden raleway">
                            <CardHeader className="p-4 sm:p-5 pb-2 space-y-1">
                                <CardTitle className="text-base font-semibold">Contact for delivery</CardTitle>
                                <CardDescription className="text-xs">
                                    We use your email ({user?.primaryEmailAddress?.emailAddress ?? "—"}) for your
                                    account. Add a mobile number for courier and order updates.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5 pt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="signed-in-phone" className="text-sm font-medium">
                                        Phone (10 digits)
                                    </Label>
                                    <Input
                                        id="signed-in-phone"
                                        className="bg-white"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder="10-digit mobile"
                                        maxLength={10}
                                        value={signedInPhone}
                                        onChange={(e) =>
                                            setSignedInPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    <Card className="border-[#212121]/15/90 bg-white shadow-sm overflow-hidden raleway">
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
                                    className="data-[state=checked]:bg-[#212121] data-[state=checked]:border-[#212121] mt-0.5"
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
                                    className="data-[state=checked]:bg-[#212121] data-[state=checked]:border-[#212121] mt-0.5"
                                    checked={orderData.paymentMode === "cod"}
                                />
                                <Label htmlFor="cod" className="text-sm font-normal leading-snug cursor-pointer">
                                    Cash on delivery
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#212121]/15/90 bg-white shadow-sm overflow-hidden raleway">
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
                                        <p className="text-xs text-[#212121] exo">{couponError}</p>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="bg-[#212121] text-white exo p-4 rounded-lg relative">
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

                    <Card className="border-[#212121]/15/90 bg-white shadow-sm overflow-hidden raleway">
                        <CardHeader className="p-4 sm:p-5 pb-2 space-y-1">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <MapPin className="size-4 text-[#212121] shrink-0" aria-hidden />
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
                                    <p className="text-xs text-[#212121] bg-[#FAFAFA] border border-[#212121]/20 rounded-md px-3 py-2 raleway">
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
                                    <span className="exo font-semibold text-[#212121] tabular-nums">{"\u20B9"} {subtotal}</span>
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
                                {isGuest ? (
                                    <p className="text-[11px] text-neutral-500 mt-2 raleway leading-snug">
                                        Checking out as guest. Order updates will be sent to the phone
                                        number you provide.
                                    </p>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>



                 <div className="w-full lg:flex-1 lg:min-w-0 lg:mt-0 mt-5 order-1 lg:min-h-[50vh] min-h-[20vh] max-h-[100vh] overflow-y-auto px-5 sm:px-6 bg-white border shadow-sm rounded-xl">


                    <div className="w-full">
                        <h5 className="sticky top-0 z-10 flex items-center gap-3 border-b border-dashed bg-white py-4 text-lg font-[700] raleway sm:gap-4 sm:py-5 sm:text-2xl lg:text-3xl">My Cart <ShoppingBag /></h5>
                        <div className="py-5 grid grid-cols-1 gap-5">
                            {
                                cartdata.map((item) => {
                                    const isOutOfStock = item.availableStock === 0;
                                    const maxSelectable = Math.min(10, item.availableStock ?? 10);
                                    const displayImage = item.variantImage || item.images[0];
                                    const variantAttributes = item.variantAttributes ?? [];
                                    return (
                                    <div
                                        className={cn(
                                            "w-full sm:flex gap-3 border-b last:border-b-0 rounded-lg p-2 -mx-2",
                                            isOutOfStock && "border border-[#212121]/20 bg-[#FAFAFA]/60"
                                        )}
                                        key={`${item.productId}-${item.variantId ?? ""}`}
                                    >
                                        <div className="sm:size-[120px] size-[100px] relative rounded-xl overflow-hidden shrink-0">
                                            <Image
                                                src={displayImage}
                                                alt="productImage"
                                                className="object-cover object-center"
                                                fill
                                                sizes="(max-width: 640px) 100px, 120px"
                                            />
                                        </div>
                                        <div className="flex-1 p-2 min-w-0">
                                            {isOutOfStock ? (
                                                <p className="text-xs font-medium text-[#212121] raleway mb-1">
                                                    This item is out of stock. Remove it to continue
                                                    checkout.
                                                </p>
                                            ) : null}
                                            <h5 className="text-lg font-[500] exo">{item.productName}</h5>
                                           
                                            {variantAttributes.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {variantAttributes.map((attr) => (
                                                        <span
                                                            key={`${item.productId}-${attr.name}`}
                                                            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] raleway text-neutral-700"
                                                        >
                                                            <span className="capitalize text-neutral-500">{attr.name}:</span>
                                                            <span className="font-medium capitalize text-neutral-800">{attr.value}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <p className="text-[#212121] font-[600] text-sm exo">{"\u20B9"} {
                                                    item.originalPrice * item.quantity
                                                }</p>
                                                <p className="text-neutral-500 font-[300] text-xs exo line-through">{"\u20B9"}
                                                    {
                                                        item.discountPrice * item.quantity
                                                    }
                                                </p>
                                                <p className="text text-[#FBC02D] font-[300] text-xs raleway">
                                                    {
                                                        Math.round(((item.discountPrice - item.originalPrice) / item.discountPrice) * 100)
                                                    }
                                                    % off</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm raleway">
 
                                                {isOutOfStock ? (
                                                    <span className="text-sm text-[#212121] font-medium">
                                                        Out of stock
                                                    </span>
                                                ) : (
                                                <Select value={item.quantity.toString()}  onValueChange={(value) => {
                                                    if(buyNowproductId === item.productId) {
                                                        toast.error("You cannot change quantity for Buy Now product");
                                                        return;
                                                    }
                                                    if (isGuest) {
                                                        guestSetQuantity(
                                                            item.productId,
                                                            item.variantId ?? "",
                                                            parseInt(value)
                                                        );
                                                        toast.success("Quantity updated");
                                                        setIsChanged(!isChanged);
                                                        return;
                                                    }
                                                    setLoading(true);
                                                    fetch(`/api/cart`, {
                                                        method: "PUT",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            email: normalizeAccountEmail(user?.primaryEmailAddress?.emailAddress),
                                                            productId: item.productId,
                                                            variantId: item.variantId ?? "",
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
                                                } className="text-[#212121] font-[500] text-sm exo ms-auto" onClick={() => {
                                                    {
                                                        setIsOpenAlert(true);
                                                        setProductIdToDelete({
                                                            image: item.variantImage || item.images[0],
                                                            productId: item.productId,
                                                            variantId: item.variantId ?? "",
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
