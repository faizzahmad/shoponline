import mongoose from "mongoose";

/**
 * Preset box / parcel sizes for shipping (e.g. Shiprocket courier dimensions).
 * Dimensions in cm; optional max weight capacity in grams.
 */
const shippingPackageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        length: { type: Number, required: true, min: 0.1 },
        breadth: { type: Number, required: true, min: 0.1 },
        height: { type: Number, required: true, min: 0.1 },
        /** Optional: recommended max dead weight for this box (grams). */
        maxWeightGrams: { type: Number, min: 1 },
        notes: { type: String, default: "" },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.ShippingPackage ||
    mongoose.model("ShippingPackage", shippingPackageSchema);
