import { connectToDb } from "@/lib/connectToDb";
import Coupon from "@/lib/models/coupon-model";
import { verifyAuth } from "@/utils/verifyToken";


export async function POST(request: Request) {
     const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
    const body = await request.json();
    const { couponCode, discountPercentage, validFrom, validTo,maxCount } = body;
    try {
        const coupon = new Coupon({
            couponCode,
            discountPercentage,
            validFrom,
            validTo,
            maxCount
        });
        await coupon.save();
        return new Response(JSON.stringify({
            message: "Coupon created successfully",
        }), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return new Response(JSON.stringify({ error: "Error creating coupon" }), {
            status: 500,
        });
    }

    
}   

export async function GET(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
    try {
        const coupons = await Coupon.find({});
        return new Response(JSON.stringify(coupons), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return new Response(JSON.stringify({ error: "Error fetching coupons" }), {
            status: 500,
        });
    }
}   
