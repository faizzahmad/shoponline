"use server";
import { connectToDb } from "@/lib/connectToDb";
import Product from "@/lib/models/product-model";

export const getNewProducts = async (limit: number) => {
    await connectToDb();
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("_id productName images originalPrice discountPrice productStock shortDescription");

        return products.map((product) => ({
            id: product._id.toString(),
            title: product.productName,
            images: product.images,
            price: product.originalPrice,
            discountedPrice: product.discountPrice,
            productStock: product.productStock,
            description: product.shortDescription,
        }));
    } catch (error) {
        console.error("Error fetching new products:", error);
        throw new Error("Error fetching new products");
    }
}

export const getTopSellingProducts = async (limit: number) => {
    await connectToDb();
    try {
        const products = await Product.find()
            .sort({ totalSales: -1 })
            .limit(limit)
            .select("_id productName images originalPrice discountPrice productStock shortDescription");

        return products.map((product) => ({
            id: product._id.toString(),
            title: product.productName,
            images: product.images,
            price: product.originalPrice,
            discountedPrice: product.discountPrice,
            productStock: product.productStock,
            description: product.shortDescription,
        }));
    } catch (error) {
        console.error("Error fetching top selling products:", error);
        throw new Error("Error fetching top selling products");
    }
}

export const getProductBySlug = async (slug: string) => {
    await connectToDb();
    try {
        const product = await Product.findOne({ _id : slug }).lean();
        
        if (!product) {
            throw new Error("Product not found");
        }

        return product;
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        throw new Error("Error fetching product by slug");
    }
}