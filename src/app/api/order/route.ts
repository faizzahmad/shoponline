import Order from "@/lib/models/order-model";
import { connectToDb } from "@/lib/connectToDb";
import Cart from "@/lib/models/cart-model";
import Coupon from "@/lib/models/coupon-model";
import { verifyAuth } from "@/utils/verifyToken";
import {
    formatDeliveryAddress,
    validateDeliveryAddressParts,
    type DeliveryAddressParts,
} from "@/lib/delivery-address";
import {
    validateAndNormalizeOrderItems,
    decrementStockForOrderItems,
    type ClientOrderLine,
} from "@/lib/inventory";
import { syncOrderToShiprocket } from "@/lib/shiprocket";

function totalsMatchClient(
    clientTotal: number,
    serverSubtotal: number,
    coupon: { discountPercentage: number } | null
): boolean {
    const c = Math.round(Number(clientTotal));
    if (!coupon) {
        return Math.abs(c - Math.round(serverSubtotal)) <= 1;
    }
    const totalPrice = serverSubtotal;
    const totalDiscountPrice = parseFloat(
        ((totalPrice * coupon.discountPercentage) / 100).toFixed(2)
    );
    const subtotalAfter = parseFloat((totalPrice - totalDiscountPrice).toFixed(2));
    const expected = Math.round(subtotalAfter);
    return Math.abs(c - expected) <= 1;
}

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
        const rawItems = items as ClientOrderLine[];
        const validated = await validateAndNormalizeOrderItems(rawItems);
        if (!validated.ok) {
            return new Response(JSON.stringify({ error: validated.error }), {
                status: 400,
            });
        }

        const serverSubtotal = validated.totalAmount;
        const code =
            typeof couponCode === "string" && couponCode.trim()
                ? couponCode.trim().toUpperCase()
                : null;

        let couponDoc: { discountPercentage: number; validFrom: Date; validTo: Date } | null =
            null;
        if (code) {
            const found = (await Coupon.findOne({ couponCode: code }).lean()) as {
                discountPercentage: number;
                validFrom: Date;
                validTo: Date;
            } | null;
            if (!found) {
                return new Response(JSON.stringify({ error: "Invalid or expired coupon" }), {
                    status: 400,
                });
            }
            const now = new Date();
            if (now < new Date(found.validFrom) || now > new Date(found.validTo)) {
                return new Response(JSON.stringify({ error: "Coupon is not valid at this time" }), {
                    status: 400,
                });
            }
            couponDoc = {
                discountPercentage: found.discountPercentage,
                validFrom: found.validFrom,
                validTo: found.validTo,
            };
        }

        if (!totalsMatchClient(Number(totalAmount), serverSubtotal, couponDoc)) {
            return new Response(
                JSON.stringify({
                    error:
                        "Order total does not match current prices. Refresh your cart and try again.",
                }),
                { status: 400 }
            );
        }

        const normalizedItems = validated.items;
        const stockLines = normalizedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
        }));

        const isCod = paymentMethod === "cod";

        if (isCod) {
            const dec = await decrementStockForOrderItems(stockLines);
            if (!dec.ok) {
                return new Response(
                    JSON.stringify({
                        error:
                            dec.message ||
                            "Could not complete order due to stock. Refresh your cart and try again.",
                    }),
                    { status: 409 }
                );
            }
        }

        const totalPrice = serverSubtotal;
        let storedTotal = Math.round(totalPrice);
        if (couponDoc) {
            const totalDiscountPrice = parseFloat(
                ((totalPrice * couponDoc.discountPercentage) / 100).toFixed(2)
            );
            const subtotalAfter = parseFloat((totalPrice - totalDiscountPrice).toFixed(2));
            storedTotal = Math.round(subtotalAfter);
        }

        const newOrder = new Order({
            userPhone,
            username,
            items: normalizedItems,
            totalAmount: storedTotal,
            orderDateTime: orderDateTime || new Date(),
            couponCode: code,
            deliveryAddress,
            streetAddress: addressParts.streetAddress.trim(),
            city: addressParts.city.trim(),
            state: addressParts.state.trim(),
            zipCode: addressParts.zipCode.trim(),
            paymentMethod,
            razorpayOrderId: razorpayOrderId || null,
            inventoryAdjusted: isCod,
        });

        await newOrder.save();

        const mongoOrderId = String(newOrder._id);
        if (isCod) {
            void syncOrderToShiprocket(mongoOrderId).catch((err) =>
                console.error("[Shiprocket] COD sync failed:", err)
            );
        }

        const cart = await Cart.findOne({ userPhone });
        if (cart) {
            const orderedKeys = new Set(
                normalizedItems.map(
                    (i) => `${String(i.productId)}::${String(i.variantId ?? "")}`
                )
            );
            cart.items = cart.items.filter((item: { productId: unknown; variantId?: unknown }) => {
                const key = `${String(item.productId)}::${String(item.variantId ?? "")}`;
                return !orderedKeys.has(key);
            });
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
