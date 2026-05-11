import { connectToDb } from "@/lib/connectToDb";
import Product from "@/lib/models/product-model";
import mongoose from "mongoose";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("excludeId");
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");

    if (!excludeId || !mongoose.Types.ObjectId.isValid(excludeId)) {
        return new Response(JSON.stringify({ error: "excludeId required" }), { status: 400 });
    }

    await connectToDb();
    const excludeObjectId = new mongoose.Types.ObjectId(excludeId);

    try {
        const baseFilter = { _id: { $ne: excludeObjectId } };

        type LeanProduct = {
            _id: mongoose.Types.ObjectId;
            productName: string;
            images: string[];
            originalPrice: number;
            discountPrice: number;
            productStock?: number;
            shortDescription?: string;
        };

        let items: LeanProduct[] = [];

        if (subCategoryId) {
            items = (await Product.find({
                ...baseFilter,
                productSubCategoryId: subCategoryId,
            })
                .sort({ createdAt: -1 })
                .limit(12)
                .select("_id productName images originalPrice discountPrice productStock shortDescription")
                .lean()) as unknown as LeanProduct[];
        }

        if (items.length < 8 && categoryId) {
            const existingIds = items.map((p) => p._id);
            const more = (await Product.find({
                _id: { $ne: excludeObjectId, $nin: existingIds },
                productCategoryId: categoryId,
            })
                .sort({ createdAt: -1 })
                .limit(12 - items.length)
                .select("_id productName images originalPrice discountPrice productStock shortDescription")
                .lean()) as unknown as LeanProduct[];
            items = [...items, ...more];
        }

        if (items.length === 0 && categoryId) {
            items = (await Product.find({
                ...baseFilter,
                productCategoryId: categoryId,
            })
                .sort({ createdAt: -1 })
                .limit(12)
                .select("_id productName images originalPrice discountPrice productStock shortDescription")
                .lean()) as unknown as LeanProduct[];
        }

        const payload = items.map((p) => ({
            id: String(p._id),
            title: p.productName,
            images: p.images ?? [],
            price: p.originalPrice,
            discountedPrice: p.discountPrice,
            productStock: p.productStock ?? 0,
            description: p.shortDescription ?? "",
        }));

        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("related-products", e);
        return new Response(JSON.stringify({ error: "Failed to load related products" }), {
            status: 500,
        });
    }
}
