import { connectToDb } from "@/lib/connectToDb";
import Category from "@/lib/models/category-model";

export const getAllCategories = async () => {
    await connectToDb();
    try {
        const categories = await Category.find({});
        return categories;
    } catch (error) {
        console.error("Error fetching all categories:", error);
        throw new Error("Error fetching all categories");
    }
}