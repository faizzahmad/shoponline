import Category from "@/lib/models/category-model";
import { connectToDb } from "@/lib/connectToDb";
import { verifyAuth } from "@/utils/verifyToken";

export async function POST(req: Request) {
     const isVrefied = await verifyAuth();
     if(!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   
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

export async function GET() {
     const isVrefied = await verifyAuth();
     if(!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   
    await connectToDb();
    try {
        
        const categories = await Category.find({}, '_id title image createdAt').sort({ createdAt: -1 });
        
        return new Response(JSON.stringify(categories), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return new Response(JSON.stringify({ error: "Error fetching categories" }), {
            status: 500,
        });
    }
}

export async function DELETE(req: Request) {
    const isVrefied = await verifyAuth();
    if(!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
      const url = new URL(req.url);
  const id = url.searchParams.get("id");
    if (!id) {
        return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
        });
    }
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return new Response(JSON.stringify({ error: "Category not found" }), {
                status: 404,
            });
        }
        return new Response(JSON.stringify(deletedCategory), {
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        return new Response(JSON.stringify({ error: "Error deleting category" }), {
            status: 500,
        });
    }
}
