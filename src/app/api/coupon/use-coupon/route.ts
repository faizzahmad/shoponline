import Coupon from "@/lib/models/coupon-model";
import { connectToDb } from "@/lib/connectToDb";

export async function POST(request: Request) {
     const { code } = await request.json();
     await connectToDb();
        try {
            const coupon = await Coupon.findOne({ couponCode: code });
            if (!coupon) {
                return new Response(JSON.stringify({ error: "Coupon not found" }), { status: 404 });
            }
            const currentDate = new Date();
            if (coupon.validFrom > currentDate || coupon.validTo < currentDate) {
                return new Response(JSON.stringify({ error: "Coupon is not valid" }), { status: 400 });
            }
            if (coupon.maxCount <= 0) {
                return new Response(JSON.stringify({ error: "Coupon usage limit reached" }), { status: 400 });
            }
            coupon.maxCount -= 1;
            coupon.usedCount += 1;
            await coupon.save();
            return new Response(JSON.stringify({ message: "Coupon applied successfully", discountPercentage: coupon.discountPercentage }), { status: 200 });
        } catch (error) {
            console.error("Error applying coupon:", error);
            return new Response(JSON.stringify({ error: "Error applying coupon" }), { status: 500 });
        }
}