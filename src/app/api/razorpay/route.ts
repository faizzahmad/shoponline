import { NextRequest,NextResponse } from "next/server";
import Razorpay from "razorpay";
import {addRazorPayOrderid} from "@/actions/orders";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
    try {
        const { amount, currency, orderId } = await request.json();

        if (!orderId || typeof orderId !== "string") {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        // Client sends amount in paise (amount in rupees × 100). Do not multiply again.
        const amountPaise = Math.round(Number(amount));
        if (!Number.isFinite(amountPaise) || amountPaise < 1) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const receipt =
            `ord_${orderId}`.length <= 40
                ? `ord_${orderId}`
                : orderId.slice(0, 40);

        const options = {
            amount: amountPaise,
            currency: currency || "INR",
            receipt,
        };

        const order = await razorpay.orders.create(options);
        if (!order || !order.id) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }
        // Update the order in the database with the Razorpay order ID
        await addRazorPayOrderid(orderId, order.id);
        return NextResponse.json(
            {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }   
}