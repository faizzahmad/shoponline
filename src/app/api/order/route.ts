import Order from "@/lib/models/order-model";
import { connectToDb } from "@/lib/connectToDb";
import Cart from "@/lib/models/cart-model";
type OrderItem = {
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
};


export async function POST(req: Request) {
    const body = await req.json();
    const {
        userPhone,
        username,
        items,
        totalAmount,
        orderDateTime,
        couponCode,
        deliveryAddress,
        paymentMethod,
        razorpayOrderId
    } = body;

    if (!userPhone || !username || !items || !totalAmount || !deliveryAddress || !paymentMethod) {
        return new Response(JSON.stringify({ error: "All fields are required" }), {
            status: 400,
        });
    }

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
            paymentMethod,
            razorpayOrderId: razorpayOrderId || null
        });

        await newOrder.save();
        // find the cart for the user and clear it after placing the order
        const cart = await Cart.findOne({ userPhone });
      cart.items = cart.items.filter((item: any) =>
  !items.some((orderedItem: any) => String(orderedItem.productId) === String(item.productId))
);
await cart.save();


        // Optionally, you can revalidate paths or perform other actions here
        // revalidatePath("/cart");
        // revalidatePath("/");

        // Return a success response        

        return new Response(JSON.stringify({ message: "Order placed successfully", orderId: newOrder._id }),
            {
                status: 201,
            });
    } catch (error) {
        console.error("Error placing order:", error);
        return new Response(JSON.stringify({ error: "Error placing order" }), {
            status: 500,
        });
    }
}