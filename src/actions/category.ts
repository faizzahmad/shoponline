"use server";
import { connectToDb } from "@/lib/connectToDb";
import Category from "@/lib/models/category-model";

export const getLatestCategories = async (limit : number) => {
    await connectToDb();
    try {
        const categories = await Category.find().sort({ createdAt: -1 }).limit(limit);
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Error fetching categories");
    }
}


