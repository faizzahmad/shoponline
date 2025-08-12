import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userPhone: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true, min: 1 },
      originalPrice: { type: Number, required: true },
      discountPrice : { type: Number},
      productName: { type: String, required: true },
      images: { type: [String], required: true },
      productCategory: { type: String, required: true },
      productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
      productSubCategory: { type: String, required: true },
      productSubCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
      shortDescription: { type: String, required: true },
      longDescription: { type: String, required: true },
    },
  ],
}, { timestamps: true });

// This will throw error if `mongoose.models` is undefined
const Cart = mongoose.models?.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
