import { connectToDb } from "@/lib/connectToDb";
import Banner from "@/lib/models/banner"; 

export async function getBanners(type : string) {
    try {
         await connectToDb();
        const banners = await Banner.find({ type }).sort({ createdAt: -1 }).lean();
        return banners
    } catch (error) {
        console.error("Error fetching banners:", error);
        throw new Error("Failed to fetch banners");
    }

}