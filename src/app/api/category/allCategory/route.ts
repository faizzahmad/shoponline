import Category from "@/lib/models/category-model";
import { connectToDb } from "@/lib/connectToDb";
import { verifyAuth } from "@/utils/verifyToken";

export async function GET() {
    const isVerified = await verifyAuth();
    if (!isVerified.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    await connectToDb();
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        return new Response(JSON.stringify(categories), { status: 200 });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return new Response(JSON.stringify({ error: "Error fetching categories" }), { status: 500 });
    }
}