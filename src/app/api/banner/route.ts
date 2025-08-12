import { connectToDb } from "@/lib/connectToDb";
import { verifyAuth } from "@/utils/verifyToken";
import Banner from "@/lib/models/banner";

export async function POST(req: Request) {
    const isVerified = await verifyAuth();
    if (!isVerified.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    await connectToDb();
    const { type, link, image } = await req.json();
    try {
        const newBanner = new Banner({
            type,
            link,
            image
        });
        await newBanner.save();
        return new Response(JSON.stringify({
            message: "Banner created successfully",
        }), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating banner:", error);
        return new Response(JSON.stringify({ error: "Error creating banner" }), {
            status: 500,
        });
    }
}

export async function PUT(req: Request) {
 const isVerified = await verifyAuth();
    if (!isVerified.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    await connectToDb();
    const { id, link, image } = await req.json();
    try {
        const updatedBanner = await Banner.findByIdAndUpdate(id, {
            link,
            image,
        }, { new: true });
        
        if (!updatedBanner) {
            return new Response(JSON.stringify({ error: "Banner not found" }), { status: 404 });
        }
        
        return new Response(JSON.stringify({
            message: "Banner updated successfully",
        }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error updating banner:", error);
        return new Response(JSON.stringify({ error: "Error updating banner" }), {
            status: 500,
        });
    }
}

export async function GET() {
    const isVerified = await verifyAuth();
    if (!isVerified.isValid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    await connectToDb();
    try {
        const banners = await Banner.find({});
        return new Response(JSON.stringify(banners), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return new Response(JSON.stringify({ error: "Error fetching banners" }), {
            status: 500,
        });
    }   
}