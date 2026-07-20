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
    const normalizedTitle = String(title ?? "").trim();

    if (!normalizedTitle || !categoryId) {
        return new Response(JSON.stringify({ error: "Title and category are required" }), {
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
        const duplicateExists = category.subCategories.some(
            (sub: { title?: string }) =>
                String(sub?.title ?? "").trim().toLowerCase() === normalizedTitle.toLowerCase()
        );
        if (duplicateExists) {
            return new Response(
                JSON.stringify({ error: "Subcategory already exists in this category" }),
                { status: 409 }
            );
        }
        category.subCategories.push({
            title: normalizedTitle,
            image: typeof image === "string" ? image : "",
        });
        await category.save();
        return new Response(JSON.stringify({
            message: "Subcategory created successfully",
            categoryId: category._id,
        }), {
            status: 200,
        });
    } catch (error: unknown) {
        console.error("Error creating subcategory:", error);
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: number }).code === 11000
        ) {
            return new Response(
                JSON.stringify({ error: "Duplicate value found. Please use a different name." }),
                { status: 409 }
            );
        }
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
    const normalizedTitle = String(title ?? "").trim();

    if (!id || !normalizedTitle) {
        return new Response(JSON.stringify({ error: "ID and title are required" }), {
            status: 400,
        });
    }

    try {
        const category = await Category.findOne({ "subCategories._id": id });
        if (!category) {
            return new Response(JSON.stringify({ error: "Subcategory not found" }), {
                status: 404,
            });
        }

        const duplicateExists = category.subCategories.some(
            (sub: { _id: { toString: () => string }; title?: string }) =>
                sub._id.toString() !== id &&
                String(sub?.title ?? "").trim().toLowerCase() === normalizedTitle.toLowerCase()
        );
        if (duplicateExists) {
            return new Response(
                JSON.stringify({ error: "Subcategory already exists in this category" }),
                { status: 409 }
            );
        }

        const updated = await Category.findOneAndUpdate(
            { "subCategories._id": id },
            {
                $set: {
                    "subCategories.$.title": normalizedTitle,
                    "subCategories.$.image": typeof image === "string" ? image : "",
                },
            },
            { new: true }
        );
        if (!updated) {
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