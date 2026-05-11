import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    /** Delivery / Shiprocket contact phone */
    userPhone: { type: String, required: true },
    /** Clerk account email when logged in — used for order history */
    userEmail: { type: String, default: "", index: true },
    username  : { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            variantId: { type: String, default: "" },
            variantAttributes: {
                type: [
                    {
                        name: { type: String, required: true },
                        value: { type: String, required: true },
                    },
                ],
                default: [],
            },
            variantImage: { type: String, default: "" },
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
            longDescription: { type: String, required: true },
            length: { type: Number, default: 0 },
            breadth: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
            weight: { type: Number, default: 0 }
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
    paymentStatus: { type: String, default: "Pending" },
    /** When true, productStock has been decremented for this order's items */
    inventoryAdjusted: { type: Boolean, default: false },
    /** Shiprocket quick-order id after successful sync */
    shiprocketOrderId: { type: String, default: null },
    shiprocketShipmentId: { type: mongoose.Schema.Types.Mixed, default: null },
    shiprocketSyncedAt: { type: Date, default: null },
    shiprocketSyncError: { type: String, default: null },
    /** Set when AWB (tracking number) is assigned to the Shiprocket shipment */
    awbCode: { type: String, default: null },
    courierName: { type: String, default: null },
    courierCompanyId: { type: mongoose.Schema.Types.Mixed, default: null },
    awbAssignedAt: { type: Date, default: null },
},{
    timestamps: true
})

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;