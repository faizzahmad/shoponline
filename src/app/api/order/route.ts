import Order from "@/lib/models/order-model";
import { connectToDb } from "@/lib/connectToDb";
import Cart from "@/lib/models/cart-model";
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
