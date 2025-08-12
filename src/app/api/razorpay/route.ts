import { NextRequest,NextResponse } from "next/server";
import Razorpay from "razorpay";
import {addRazorPayOrderid} from "@/actions/orders";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
    try {
        const { amount, currency, orderId, } = await request.json();
        const options = {
            amount: amount * 100, // Convert to smallest currency unit
            currency: currency || "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7), 
        };

        const order = await razorpay.orders.create(options);
        if (!order || !order.id) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }
        // Update the order in the database with the Razorpay order ID
        await addRazorPayOrderid(orderId, order.id);
        return NextResponse.json({
            id: order.id,
            
        },{ status: 200 });
    }
    catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }   
}