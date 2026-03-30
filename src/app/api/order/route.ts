import Order from "@/lib/models/order-model";
import { connectToDb } from "@/lib/connectToDb";
import Cart from "@/lib/models/cart-model";
import { verifyAuth } from "@/utils/verifyToken";
import {
    formatDeliveryAddress,
    validateDeliveryAddressParts,
    type DeliveryAddressParts,
} from "@/lib/delivery-address";

export async function POST(req: Request) {
    const body = await req.json();
    const {
        userPhone,
        username,
        items,
        totalAmount,
        orderDateTime,
        couponCode,
        paymentMethod,
        razorpayOrderId,
        streetAddress,
        city,
        state,
        zipCode,
    } = body;

    if (!userPhone || !username || !items || !totalAmount || !paymentMethod) {
        return new Response(JSON.stringify({ error: "All fields are required" }), {
            status: 400,
        });
    }

    const addressParts: DeliveryAddressParts = {
        streetAddress: typeof streetAddress === "string" ? streetAddress : "",
        city: typeof city === "string" ? city : "",
        state: typeof state === "string" ? state : "",
        zipCode: typeof zipCode === "string" ? zipCode : "",
    };

    const addressError = validateDeliveryAddressParts(addressParts);
    if (addressError) {
        return new Response(JSON.stringify({ error: addressError }), {
            status: 400,
        });
    }

    const deliveryAddress = formatDeliveryAddress(addressParts);

    await connectToDb();

    try {
        const newOrder = new Order({
            userPhone,
            username,
            items,
            totalAmount,
            orderDateTime: orderDateTime || new Date(),
            couponCode: couponCode || null,
            deliveryAddress,
            streetAddress: addressParts.streetAddress.trim(),
            city: addressParts.city.trim(),
            state: addressParts.state.trim(),
            zipCode: addressParts.zipCode.trim(),
            paymentMethod,
            razorpayOrderId: razorpayOrderId || null,
        });

        await newOrder.save();
        const cart = await Cart.findOne({ userPhone });
        if (cart) {
            cart.items = cart.items.filter(
                (item: { productId: unknown }) =>
                    !items.some(
                        (orderedItem: { productId: unknown }) =>
                            String(orderedItem.productId) === String(item.productId)
                    )
            );
            await cart.save();
        }

        return new Response(
            JSON.stringify({ message: "Order placed successfully", orderId: newOrder._id }),
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("Error placing order:", error);
        return new Response(JSON.stringify({ error: "Error placing order" }), {
            status: 500,
        });
    }
}

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
const DELIVERY_STATUSES = ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"] as const;
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"] as const;

export async function GET() {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await connectToDb();
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        return new Response(JSON.stringify(orders), { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return new Response(JSON.stringify({ error: "Error fetching orders" }), { status: 500 });
    }
}

type PutBody = {
    orderId?: string;
    orderStatus?: string;
    deliveryStatus?: string;
    paymentStatus?: string;
};

export async function PUT(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const body = (await request.json()) as PutBody;
    const { orderId, orderStatus, deliveryStatus, paymentStatus } = body;
    if (!orderId || typeof orderId !== "string") {
        return new Response(JSON.stringify({ error: "orderId is required" }), { status: 400 });
    }
    if (
        orderStatus !== undefined &&
        !ORDER_STATUSES.includes(orderStatus as (typeof ORDER_STATUSES)[number])
    ) {
        return new Response(JSON.stringify({ error: "Invalid orderStatus" }), { status: 400 });
    }
    if (
        deliveryStatus !== undefined &&
        !DELIVERY_STATUSES.includes(deliveryStatus as (typeof DELIVERY_STATUSES)[number])
    ) {
        return new Response(JSON.stringify({ error: "Invalid deliveryStatus" }), { status: 400 });
    }
    if (
        paymentStatus !== undefined &&
        !PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])
    ) {
        return new Response(JSON.stringify({ error: "Invalid paymentStatus" }), { status: 400 });
    }
    await connectToDb();
    try {
        const update: Record<string, string> = {};
        if (orderStatus !== undefined) update.orderStatus = orderStatus;
        if (deliveryStatus !== undefined) update.deliveryStatus = deliveryStatus;
        if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
        if (Object.keys(update).length === 0) {
            return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });
        }
        const updated = await Order.findByIdAndUpdate(orderId, update, { new: true });
        if (!updated) {
            return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ message: "Order updated", order: updated }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error updating order:", error);
        return new Response(JSON.stringify({ error: "Error updating order" }), { status: 500 });
    }
}
