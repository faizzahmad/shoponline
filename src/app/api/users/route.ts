import { connectToDb } from "@/lib/connectToDb";
import User from "@/lib/models/users-model";
import { verifyAuth } from "@/utils/verifyToken";

export async function GET() {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    await connectToDb();
    try {
        const users = await User.find({}).sort({ createdAt: -1 }).lean();
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return new Response(JSON.stringify({ error: "Error fetching users" }), { status: 500 });
    }
}
