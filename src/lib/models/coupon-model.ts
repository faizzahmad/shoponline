import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    validFrom: {
        type: Date,
        required: true,
    },
    maxCount: {
        type: Number,
        required: true,
    },
    validTo: {
        type: Date,
        required: true,
    },
    usedCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
