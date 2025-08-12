import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import { getProductBySlug } from "@/actions/product";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const slug = url.pathname.split("/").pop(); 

    try {
        await connectToDb();
        const product = await Product.findOne({ _id: slug })
            .populate('productCategoryId', 'categoryName')
            .populate('productSubCategoryId', 'subcategoryName')
            .lean();

        if (!product) {
            return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(product), {
            status: 200,
           
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}


export async function POST(request: Request) {
      const url = new URL(request.url);
    const slug = url.pathname.split("/").pop(); 

    try {
        await connectToDb();
        const product = await getProductBySlug(slug ? slug : '');

        if (!product) {
            return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(product), {
            status: 200,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}