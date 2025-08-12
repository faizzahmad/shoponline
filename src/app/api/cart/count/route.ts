import { getCartCount } from "@/actions/cart";
import { connectToDb } from "@/lib/connectToDb";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    if (!phone) {
        return new Response(JSON.stringify({ error: "Phone number is required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        const count = await getCartCount(phone);
        return new Response(JSON.stringify({ count }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching cart count:", error);
        return new Response(JSON.stringify({ error: "Error fetching cart count" }), {
            status: 500,
        });
    }
}