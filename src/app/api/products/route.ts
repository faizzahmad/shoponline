import { connectToDb } from "@/lib/connectToDb";
import Product from "@/lib/models/product-model";
import { verifyAuth } from "@/utils/verifyToken";

export async function POST(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
    const body = await request.json();
    const { productName, images, productStock, productCategory, productCategoryId, productSubCategory, productSubCategoryId, discountPrice, originalPrice, shortDescription, longDescription, varients } = body;
    try {
        const product = new Product({
            productName,
            productId: productName.replace(/\s+/g, '-').toLowerCase(),
            images,
            productStock,
            productCategory,
            productCategoryId,
            productSubCategory,
            productSubCategoryId,
            discountPrice,
            originalPrice,
            shortDescription,
            longDescription,
            varients
        });
        await product.save();
        return new Response(JSON.stringify({
            message: "Product created successfully",
            productId: product._id
        }), {
            status: 201,
        });


    } catch (error) {
        console.error("Error creating product:", error);
        return new Response(JSON.stringify({ error: "Error creating product" }), {
            status: 500,
        });
    }

}

export async function GET() {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
    try {
        const products = await Product.find({});
        return new Response(JSON.stringify(products), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return new Response(JSON.stringify({ error: "Error fetching products" }), {
            status: 500,
        });
    }
}


export async function DELETE(request: Request) {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
        return new Response(JSON.stringify({ error: "Missing product id" }), {
            status: 400,
        });
    }
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return new Response(JSON.stringify({ error: "Product not found" }), {
                status: 404,
            });
        }
        return new Response(JSON.stringify({ message: "Product deleted successfully" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return new Response(JSON.stringify({ error: "Error deleting product" }), {
            status: 500,
        });
    }

}
