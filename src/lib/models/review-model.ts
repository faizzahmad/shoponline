import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true, index: true },
        authorUserId: { type: String, required: true },
        authorName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, required: true, maxlength: 2000 },
        images: { type: [String], default: [] },
    },
    { timestamps: true }
);

reviewSchema.index({ productId: 1, authorUserId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
