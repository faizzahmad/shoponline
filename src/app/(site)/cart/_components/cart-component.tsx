"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsChanged } from "@/store/use-ischnaged";
import { useUser } from "@clerk/nextjs";
import { Loader,ShoppingBag, X } from "lucide-react";
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
import { PaymentComponent } from "../../_components/payenment-comp";
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
    
    // const [buyNowproductId, setBuyNowProductId] = useState<string | null>(params.get('productId') || null);
   const buyNowproductId = params.get('productId') || null;

    const [orderData, setOrderData] = useState({
        shippingAddress: "",
        paymentMode: "onlinePayment",
    });

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
          if(buyNowproductId && data.items.length > 0) {
                const findProduct = data.items.find((item: productItem) => item.productId === buyNowproductId);
                console.log("findProduct", findProduct);
              if (findProduct) {
                 setCartData([findProduct]);
                 
              }
          }else{
              setCartData(data.items);
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

    const totalPrice = cartdata
        .reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);

    const totalDiscountPrice = parseFloat((totalPrice * (discountPercentage / 100)).toFixed(2));

    const subtotal = parseFloat((totalPrice - totalDiscountPrice).toFixed(2));

    const handelPlaceOrder = async () => {
        if (cartdata.length <= 0) {
            toast.error("Your cart is empty. Please add some products to proceed.");
            return;
        }
        if (!orderData.shippingAddress) {
            toast.error("Please enter your shipping address.");
            return;
        }
        if(orderData.shippingAddress.length < 10){
            toast.error("Address must be at least 10 characters long.");
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
                deliveryAddress: orderData.shippingAddress,
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
           if (cartdata.length <= 0) {
            toast.error("Your cart is empty. Please add some products to proceed.");
            return;
        }
        if (!orderData.shippingAddress) {
            toast.error("Please enter your shipping address.");
            return;
        }
        if(orderData.shippingAddress.length < 10){
            toast.error("Address must be at least 10 characters long.");
            return;
        }
        if (!orderData.paymentMode) {
            toast.error("Please select a payment mode.");
            return;
        }else{
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
                deliveryAddress: orderData.shippingAddress,
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
        }
        // Optionally, you can redirect the user to a different page after placing the order
        // router.push('/order-confirmation');
    }

    return (
        <>
       
        {
            showpaymentComponent && (
                 <PaymentComponent
                 amount={Math.round(subtotal)}
                 orderId = {orderId ? orderId : ""}  
                 />
            )
        }
            {
                loading && (
                    <div className="w-full  flex justify-center gap-10 py-6  px-32 bg-gray-50">
                        <div className="w-[65%] min-h-[50vh] max-h-[100vh] overflow-y-auto px-5  bg-white border shadow-sm rounded-md p-5">
                            <Skeleton className="w-56 h-5" />
                            <div className="pb-5 pt-10 grid grid-cols-1 gap-5">
                                <div className="w-full flex gap-5 items-center">
                                    <div className="size-[120px]">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1">
                                        <Skeleton className="w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-[90%] h-2 mb-2" />
                                        <div className="flex gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-5 items-center">
                                    <div className="size-[120px]">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1">
                                        <Skeleton className="w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-[90%] h-2 mb-2" />
                                        <div className="flex gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-5 items-center">
                                    <div className="size-[120px]">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1">
                                        <Skeleton className="w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-[90%] h-2 mb-2" />
                                        <div className="flex gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full flex gap-5 items-center">
                                    <div className="size-[120px]">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                    </div>

                                    <div className="flex-1">
                                        <Skeleton className="w-[40%] h-5 mb-2" />
                                        <Skeleton className="w-[90%] h-2 mb-2" />
                                        <div className="flex gap-3 mb-2">
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                            <Skeleton className="w-10 h-3" />
                                        </div>

                                        <div className="w-full flex justify-between">
                                            <Skeleton className="w-24 h-5" />
                                            <Skeleton className="w-24 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-[35%]">
                            <div className="w-full h-[150px]">
                                <Skeleton className="w-full h-full" />

                            </div>

                            <div className="w-full h-[400px] mt-8">
                                <Skeleton className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                )
            }

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
                                <div className="size-16 relative">
                                    <Image
                                        src={productIdToDelete.image}
                                        alt="productImage"
                                        className="w-full h-full object-cover rounded-md"
                                        fill
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

            <div className={cn("w-full  lg:flex justify-center gap-10 py-6  xl:px-32 lg:px-24 md:px-10 px-5 bg-gray-50", cartdata.length === 0 && 'hidden')}>
               
                <div className="lg:w-[35%] order-2">

                    <div className="mb-5 p-5 rounded-md shadow-sm border bg-indigo-50 raleway">
                        <h5
                            className="text-lg font-[600] flex items-center gap-2">
                            Select Payenment Mode</h5>

                        <div className="w-full flex gap-2 items-center mt-3">
                            <Checkbox id="onlinePayement"
                                value={orderData.paymentMode === "onlinePayment" ? "onlinePayment" : ""}
                                onCheckedChange={(checked) => {
                                    setOrderData({
                                        ...orderData,
                                        paymentMode: checked ? "onlinePayment" : "cod",
                                    });
                                }
                                }
                                className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                checked={orderData.paymentMode === "onlinePayment"}
                            />
                            <Label htmlFor="onlinePayement">Pay with Online Payment</Label>
                        </div>
                        <div className="w-full flex gap-2 items-center mt-3">
                            <Checkbox id="cod"
                                value={orderData.paymentMode === "cod" ? "cod" : ""}
                                onCheckedChange={(checked) => {
                                    setOrderData({
                                        ...orderData,
                                        paymentMode: checked ? "cod" : "onlinePayment",
                                    });
                                }
                                }
                                className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                checked={orderData.paymentMode === "cod"}
                            />
                            <Label htmlFor="cod">Cash on Delivery</Label>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2 raleway">
                            Please select a payment mode to proceed with the order.
                        </p>
                    </div>
                    <div className="w-full p-5 bg-indigo-50 rounded-xl grid grid-cols-1 gap-5 shadow-sm border">
                        {
                            discountPercentage <= 0 ? (
                                <div>
                                    <div className="w-full flex gap-2 ">
                                        <div className="flex-1 raleway">
                                            <Input className="bg-white" placeholder="Add a coupon code" value={couponCode} onChange={(e) => {
                                                setCouponCode(e.target.value.toLocaleUpperCase())
                                            }} />
                                        </div>
                                        <Button className="raleway" onClick={handelApplyCoupon} disabled={couponLodaer}>
                                            Apply Code
                                            {
                                                couponLodaer && <Loader className="size-3 animate-spin" />
                                            }
                                        </Button>
                                    </div>
                                    <p className="text-xs text-red-600 exo mt-1">
                                        {couponError}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-rose-600 text-white exo p-3 relative">
                                    <h5 className="font-[500] text-sm">
                                        Coupon Applied
                                    </h5>
                                    <p className="mt-2 text-xs raleway">
                                        {couponCode}  has been applied successfully with a discount of {discountPercentage}%.
                                    </p>

                                    <button className="text-white font-[500] text-xs raleway mt-2 float-right" onClick={() => {

                                        resetCouponCode();
                                        setDiscountPercentage(0);
                                        toast.success("Coupon removed successfully");
                                    }}
                                        ref={buttonRef}
                                    >
                                        Remove Coupon
                                    </button>

                                    <X className="size-4 absolute right-2 top-2 cursor-pointer"
                                        onClick={() => buttonRef.current?.click()}
                                    />
                                </div>
                            )
                        }



                        <form className="w-full">
                            <div className="w-full grid grid-cols-1 gap-3">
                                <div>
                                    <Label className="raleway text-sm font-semibold mb-2">Shipping Address</Label>
                                    <Textarea className="bg-white raleway" placeholder="Enter your address" value={orderData.shippingAddress} onChange={(e) => {
                                        setOrderData({
                                            ...orderData,
                                            shippingAddress: e.target.value,
                                        });
                                    }} />
                                </div>


                            </div>
                        </form>

                        <div className="w-full py-3 raleway">
                            <h5 className="text-sm font-semibold mb-5">Product Details</h5>

                            <div className="w-full grid grid-cols-1 gap-4">
                                <div className="flex items-center w-full justify-between text-sm">
                                    <span>
                                        Total Price
                                    </span>
                                    <span className="exo font-semibold">
                                        ₹ {totalPrice}
                                    </span>
                                </div>

                                <div className="flex items-center w-full justify-between text-sm">
                                    <span>
                                        Shipping Fee
                                    </span>
                                    <span className="exo  text-green-500">
                                        Free
                                    </span>
                                </div>


                                <div className="flex items-center w-full justify-between text-sm">
                                    <span>
                                        Discount Price
                                    </span>
                                    <span className="exo  text-green-500">
                                        ₹ {totalDiscountPrice}
                                    </span>
                                </div>

                                <div className="flex items-center w-full justify-between text-sm py-2 border-y border-dashed border-gray-700">
                                    <span className=" font-semibold">
                                        Subtotal
                                    </span>
                                    <span className="exo font-semibold text-rose-500">
                                        ₹ {subtotal}
                                    </span>
                                </div>

                                <div className="w-full">
                                    {
                                        orderData.paymentMode === "onlinePayment" ? (
                                            <Button variant={'cart'} className="w-full raleway rounded-none exo" disabled={loading} onClick={handelPlaceOrderWithrazorpay}>
                                                Continue to Payment ₹ {subtotal}
                                                {
                                                    loading && <Loader className="size-3 animate-spin ml-2" />
                                                }
                                            </Button>
                                        ) : (
                                            <Button variant={'cart'} className="w-full rounded-none"  onClick={handelPlaceOrder}>
                                        Place Order (Cash on Delivery)
                                        {
                                            loading && <Loader className="size-3 animate-spin ml-2" />
                                        }
                                    </Button>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                 <div className="lg:w-[65%] lg:mt-0 mt-5 order-1 lg:min-h-[50vh] min-h-[20vh] max-h-[100vh] overflow-y-auto px-5  bg-white border shadow-sm rounded-md">


                    <div className="w-full">
                        <h5 className="flex items-center gap-4 lg:text-3xl sm:text-2xl text-xl font-[700] raleway py-5 border-b border-dashed sticky top-0 bg-white z-10">My Cart <ShoppingBag /></h5>
                        <div className="py-5 grid grid-cols-1 gap-5">
                            {
                                cartdata.map((item, index) => (
                                    <div className="w-full sm:flex gap-3 border-b last:border-b-0" key={index}>
                                        <div className="sm:size-[120px] size-[100px] relative rounded-xl overflow-hidden">
                                            <Image src={item.images[0]} alt="productImage" className="w-full h-full object-cover" fill />
                                        </div>
                                        <div className="flex-1 p-2">
                                            <h5 className="text-lg font-[500] exo">{item.productName}</h5>
                                            <p className="text-xs font-[300] raleway text-neutral-600 ">{
                                                item.shortDescription
                                            }</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <p className="text-rose-600 font-[600] text-sm exo">₹ {
                                                    item.originalPrice * item.quantity
                                                }</p>
                                                <p className="text-neutral-500 font-[300] text-xs exo line-through">₹
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
                                            <div className="flex items-center gap-3 mt-1 text-sm raleway">
 
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
                                                    }).then((res) => {
                                                        if (res.ok) {
                                                            toast.success("Quantity updated successfully");
                                                            setIsChanged(!isChanged);
                                                            handelFetchCart();
                                                        } else {
                                                            toast.error("Failed to update quantity");
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
{
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
        <SelectItem key={qty} value={qty.toString()} >
           Qty {qty}
        </SelectItem>
    ))
}
   
  </SelectContent>
</Select>
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
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
