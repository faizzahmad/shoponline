import { connectToDb } from "@/lib/connectToDb";
import Review from "@/lib/models/review-model";
import Product from "@/lib/models/product-model";
import { auth, currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
        return new Response(JSON.stringify({ error: "productId is required" }), { status: 400 });
    }

    await connectToDb();
    try {
        const reviews = await Review.find({ productId })
            .sort({ createdAt: -1 })
            .lean();

        const agg = await Review.aggregate<{ avg: number; count: number }>([
            { $match: { productId } },
            {
                $group: {
                    _id: null,
                    avg: { $avg: "$rating" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const averageRating =
            agg.length > 0 && agg[0].count > 0 ? Math.round(agg[0].avg * 10) / 10 : 0;
        const reviewCount = agg[0]?.count ?? 0;

        return new Response(
            JSON.stringify({
                reviews: reviews.map((r) => ({
                    _id: String(r._id),
                    productId: r.productId,
                    authorUserId: r.authorUserId,
                    authorName: r.authorName,
                    rating: r.rating,
                    text: r.text,
                    images: r.images ?? [],
                    createdAt: r.createdAt,
                })),
                averageRating,
                reviewCount,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (e) {
        console.error("reviews GET", e);
        return new Response(JSON.stringify({ error: "Failed to load reviews" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new Response(JSON.stringify({ error: "Sign in to write a review" }), { status: 401 });
    }

    const user = await currentUser();
    const authorName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        user?.username ||
        user?.emailAddresses?.[0]?.emailAddress ||
        "Customer";

    let body: { productId?: string; rating?: number; text?: string; images?: string[] };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    const { productId, rating, text, images } = body;
    if (!productId || typeof productId !== "string") {
        return new Response(JSON.stringify({ error: "productId is required" }), { status: 400 });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return new Response(JSON.stringify({ error: "rating must be 1–5" }), { status: 400 });
    }
    if (!text || typeof text !== "string" || text.trim().length < 4) {
        return new Response(JSON.stringify({ error: "Review text is too short" }), { status: 400 });
    }
    if (text.length > 2000) {
        return new Response(JSON.stringify({ error: "Review text is too long" }), { status: 400 });
    }

    const imageList = Array.isArray(images) ? images.filter((u) => typeof u === "string").slice(0, 4) : [];

    await connectToDb();

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return new Response(JSON.stringify({ error: "Invalid product" }), { status: 400 });
        }
        const product = await Product.findById(productId).select("_id").lean();
        if (!product) {
            return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
        }

        const existing = await Review.findOne({ productId, authorUserId: userId });
        if (existing) {
            existing.rating = rating;
            existing.text = text.trim();
            existing.images = imageList;
            existing.authorName = authorName;
            await existing.save();
            return new Response(JSON.stringify({ message: "Review updated", review: existing }), {
                status: 200,
            });
        }

        const review = await Review.create({
            productId,
            authorUserId: userId,
            authorName,
            rating,
            text: text.trim(),
            images: imageList,
        });

        return new Response(JSON.stringify({ message: "Review posted", review }), { status: 201 });
    } catch (e) {
        console.error("reviews POST", e);
        return new Response(JSON.stringify({ error: "Could not save review" }), { status: 500 });
    }
}
