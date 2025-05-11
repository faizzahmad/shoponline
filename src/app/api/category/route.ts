import Category from "@/lib/models/category-model";
import { connectToDb } from "@/lib/connectToDb";

export async function POST(req: Request) {
    await connectToDb();
    const { title, image, subCategories } = await req.json();
    try {
        const newCategory = new Category({
            title,
            image,
            subCategories
        });
        await newCategory.save();
        return new Response(JSON.stringify(newCategory), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        return new Response(JSON.stringify({ error: "Error creating category" }), {
            status: 500,
        });
    }


}