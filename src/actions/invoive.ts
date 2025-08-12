"use server";
import { connectToDb } from "@/lib/connectToDb";
import Order from "@/lib/models/order-model";

type productItems = {
    productId : string;
    quantity: number; 
    originalPrice : number;
    discountedPrice : number;
    productName  : string;
    images : string[];
    productCategory : string;
    productCategoryId : string;
    productSubCategory : string;
    productSubCategoryId : string;
    shortDescription : string;
    longDescription : string;
}

type OrdersDetails = {
    _id : string;
    userPhone : string;
    username : string;
    items : productItems[];
    totalAmount : number;
    orderDateTime : Date;
    couponCode? : string;
    deliveryAddress : string;
    paymentMethod : string;
   orderStatus : string;
   deliveryStatus : string;
    razorpayOrderId : string;
    paymentStatus : string;
    createdAt : Date;
    updatedAt : Date;
    __v: number;
}

type MinimalOrder = {
  _id: string;
  orderDateTime: string; // or Date, depending on your schema
  totalAmount: number;
};

export const getOrderById = async (orderId: string): Promise<OrdersDetails | null> => {
    await connectToDb();
    try {
        const order = await Order.findById(orderId).lean();
        if (!order) {
            return null;
            throw new Error("Order not found");
        }
        return order as OrdersDetails;
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        throw new Error("Failed to fetch order");
    }
}

export const getlatestOrdersbyUserPhone = async (userPhone: string): Promise<MinimalOrder[]> => {
  await connectToDb();
  try {
    const orders = await Order.find(
      { userPhone },
      '_id orderDateTime totalAmount'
    )
    .sort({ orderDateTime: -1 })
 

    return orders as MinimalOrder[];
  } catch (error) {
    console.error("Error fetching latest orders by user phone:", error);
    throw new Error("Failed to fetch orders");
  }
}