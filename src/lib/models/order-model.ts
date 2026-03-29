import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userPhone: { type: String, required: true },
    username  : { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true },
            originalPrice: { type: Number, required: true },
            discountPrice: { type: Number, required: true },
            productName: { type: String, required: true },
            images: [{ type: String }],
            productCategory: { type: String, required: true },
            productCategoryId: { type: String, required: true },
            productSubCategory: { type: String, required: true },
            productSubCategoryId: { type: String, required: true },
            shortDescription: { type: String, required: true },
            longDescription: { type: String, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    orderDateTime: { type: Date, default: Date.now },
    couponCode: { type: String, default: null },
    /** Full formatted address (invoice, search); built from structured fields on create */
    deliveryAddress: { type: String, required: true },
    streetAddress: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    paymentMethod: { type: String, required: true },
    orderStatus: { type: String, default: "Pending" },
    deliveryStatus: { type: String, default: "Pending" },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    paymentStatus: { type: String, default: "Pending" }
},{
    timestamps: true
})

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;