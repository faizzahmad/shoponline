import Category from "@/lib/models/category-model";
import { connectToDb } from "@/lib/connectToDb";
import { verifyAuth } from "@/utils/verifyToken";

export async function GET(req: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    await connectToDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
        return new Response(JSON.stringify({ error: "ID is required" }), {
            status: 400,
        });
    }
    try {
        const category = await Category.findById(id, 'subCategories').populate('subCategories');
        if (!category) {
            return new Response(JSON.stringify({ error: "Category not found" }), {
                status: 404,
            });
        }
        return new Response(JSON.stringify(category), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching category:", error);
        return new Response(JSON.stringify({ error: "Error fetching category" }), {
            status: 500,
        });
    }
}

export async function POST(req: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    await connectToDb();
    const body = await req.json();
    const { title, image, categoryId } = body;

    if (!title || !image || !categoryId) {
        return new Response(JSON.stringify({ error: "All fields are required" }), {
            status: 400,
        });
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return new Response(JSON.stringify({ error: "Category not found" }), {
                status: 404,
            });
        }
        category.subCategories.push({ title, image });
        await category.save();
        return new Response(JSON.stringify({
            message: "Subcategory created successfully",
            categoryId: category._id,
        }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return new Response(JSON.stringify({ error: "Error creating subcategory" }), {
            status: 500,
        });
    }
}

export async function DELETE(req: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    await connectToDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
        return new Response(JSON.stringify({ error: "ID is required" }), {
            status: 400,
        });
    }
    try {
        const category = await Category.findOneAndUpdate(
            { 'subCategories._id': id },
            { $pull: { subCategories: { _id: id } } },
            { new: true }
        );
        if (!category) {
            return new Response(JSON.stringify({ error: "Subcategory not found" }), {
                status: 404,
            });
        }
        return new Response(JSON.stringify({
            message: "Subcategory deleted successfully",
        }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return new Response(JSON.stringify({ error: "Error deleting subcategory" }), {
            status: 500,
        });
    }
}

export async function PUT(req: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    await connectToDb();
    const body = await req.json();
    const { id, title, image } = body;

    if (!id || !title || !image) {
        return new Response(JSON.stringify({ error: "All fields are required" }), {
            status: 400,
        });
    }

    try {
        const category = await Category.findOneAndUpdate(
            { 'subCategories._id': id },
            { $set: { 'subCategories.$.title': title, 'subCategories.$.image': image } },
            { new: true }
        );
        if (!category) {
            return new Response(JSON.stringify({ error: "Subcategory not found" }), {
                status: 404,
            });
        }
        return new Response(JSON.stringify({
            message: "Subcategory updated successfully",
        }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return new Response(JSON.stringify({ error: "Error updating subcategory" }), {
            status: 500,
        });
    }
}