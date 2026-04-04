import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import Order from "@/lib/models/order-model";
import { decrementStockForOrderItems } from "@/lib/inventory";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = body as {
            razorpay_order_id?: string;
            razorpay_payment_id?: string;
            razorpay_signature?: string;
            orderId?: string;
        };

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (
            !secret ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !orderId
        ) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const expected = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const a = Buffer.from(expected, "utf8");
        const b = Buffer.from(razorpay_signature, "utf8");
        if (
            a.length !== b.length ||
            !crypto.timingSafeEqual(a, b)
        ) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        await connectToDb();
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.razorpayOrderId !== razorpay_order_id) {
            return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
        }

        if (order.paymentStatus === "Paid" && order.inventoryAdjusted) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        const items = Array.isArray(order.items)
            ? order.items.map(
                  (line: { productId: string; quantity: number }) => ({
                      productId: String(line.productId),
                      quantity: Number(line.quantity),
                  })
              )
            : [];

        if (!order.inventoryAdjusted && items.length > 0) {
            const dec = await decrementStockForOrderItems(items);
            if (!dec.ok) {
                return NextResponse.json(
                    {
                        error:
                            "Payment received but inventory could not be allocated. Contact support with your order ID.",
                    },
                    { status: 409 }
                );
            }
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: "Paid",
                razorpayPaymentId: razorpay_payment_id,
                inventoryAdjusted: true,
            });
        } else {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: "Paid",
                razorpayPaymentId: razorpay_payment_id,
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Razorpay verify error:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}
