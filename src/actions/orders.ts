import { connectToDb } from "@/lib/connectToDb";
import Order from "@/lib/models/order-model";

export const addRazorPayOrderid = async (orderId : string, razorpayOrderId: string) => {
    try {
        await connectToDb();
        const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { razorpayOrderId: razorpayOrderId },
        { new: true }
        );
        return order;
    } catch (error) {
        console.error("Error updating order with Razorpay ID:", error);
        throw error;
    }
}