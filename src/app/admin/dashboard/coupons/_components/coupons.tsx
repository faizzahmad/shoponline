"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchData, postData } from "@/utils/apiCall";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { CouponsType,Couponcolumns } from "./columns";
import { CouponDataTable } from "./coupon-table";
type addcouponInfo = {
    message: string;
}
export const Coupons = () => {
    const [couponInfo, setcouponInfo] = useState({
        couponCode: "",
        discountPercentage: 0,
        validFrom: new Date(),
        validTo: new Date(),
        maxCount: 0,
    });
    const [addLoader, setAddLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coupons, setCoupons] = useState<CouponsType[]>([]);

    const handleCreateCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!couponInfo.couponCode || !couponInfo.discountPercentage || !couponInfo.validFrom || !couponInfo.validTo || !couponInfo.maxCount) {
            toast.error("Please fill all fields");
            return;
        }else if (couponInfo.discountPercentage < 0 || couponInfo.discountPercentage > 100) {
            toast.error("Discount percentage must be between 0 and 100");
            return;
        } else if (couponInfo.validFrom >= couponInfo.validTo) {
            toast.error("Valid from date must be before valid to date");
            return;
        }
        setAddLoader(true);
        try {
            const response = await postData<typeof couponInfo, addcouponInfo>('coupon', couponInfo);
            if (response.message) {
                toast.success(response.message);
                setcouponInfo({
                    couponCode: "",
                    discountPercentage: 0,
                    validFrom: new Date(),
                    validTo: new Date(),
                    maxCount: 0,
                });
                handelFetchCoupons();
            }
        } catch (err) {
            console.error("Error creating coupon:", err);
            toast.error("Error creating coupon");
        } finally {
            setAddLoader(false);
        }
    }


    const handelFetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await fetchData<CouponsType[]>('coupon');
            if (response && Array.isArray(response)) {
                setCoupons(response);
            } else {
                toast.error("No coupons found");
            }
        }catch (error) {
           console.log("Error fetching coupons:", error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        handelFetchCoupons();
    },[])



    return (
     <>
     {
        addLoader && (
            <FixedLoader/>
        )
     }
        <div className=" grid grid-cols-1 gap-6">
            <form className="w-full grid grid-cols-4  !gap-4 h-auto raleway items-end p-5 bg-white shadow-sm border-neutral-500 rounded-lg content-center" onSubmit={handleCreateCoupon}>
                <div className="w-full">
                    <Label htmlFor="couponCode">Coupon Code</Label>
                    <Input id="couponCode" type="text" placeholder="Enter coupon code" className="mt-2"
                        value={couponInfo.couponCode}
                        onChange={(e) => setcouponInfo((prev) => ({
                            ...prev,
                            couponCode: e.target.value.toUpperCase()
                        }))}
                    />
                </div>
                <div className="w-full">
                    <Label htmlFor="discountPercentage">Discount Percentage</Label>
                    <Input id="discountPercentage" type="number" placeholder="Enter discount percentage" className="mt-2"
                    min={0} max={90}
                        value={couponInfo.discountPercentage}
                        onChange={(e) => setcouponInfo((prev) => ({
                            ...prev,
                            discountPercentage: parseFloat(e.target.value)
                        }))}
                    />
                </div>
                <div className="w-full">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            type="button"
                                variant="outline"
                                data-empty={!couponInfo.validFrom}
                                className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon />
                                {couponInfo.validFrom ? format(couponInfo.validFrom, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={couponInfo.validFrom} onSelect={
                                (date) =>
                                    setcouponInfo((prev) => ({
                                        ...prev,
                                        validFrom: date || new Date()
                                    }))
                            } />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="w-full">
                    <Label htmlFor="validTo">Valid To</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                             type="button"
                                variant="outline"
                                data-empty={!couponInfo.validTo}
                                className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon />
                                {couponInfo.validTo ? format(couponInfo.validTo, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={couponInfo.validTo} onSelect={
                                (date) =>
                                    setcouponInfo((prev) => ({
                                        ...prev,
                                        validTo: date || new Date()
                                    }))
                            } />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="w-full">
                    <Label htmlFor="maxCount">Max Count</Label>
                    <Input id="maxCount" type="number" placeholder="Enter max count" className="mt-2"
                        value={couponInfo.maxCount}
                          min={0} 
                        onChange={(e) => setcouponInfo((prev) => ({
                            ...prev,
                            maxCount: parseInt(e.target.value, 10)
                        }))}
                    />
                </div>
                <div className="w-full">
                    <Button className="w-full exo"  type="submit">
                        Create Coupon
                    </Button>
                </div>
            </form>
            <div className="w-full bg-white shadow-sm border-neutral-500 rounded-lg p-5">
                {
                    loading ? (<div className="w-full h-[60vh] flex items-center justify-center gap-2">
                        <Loader className="size-8 animate-spin"/>
                        Loading...
                    </div>) : (
                        <CouponDataTable
                          data={coupons}
                          columns={Couponcolumns}
                        />
                    )
                }
            </div>
        </div>
     </>
    );
};