import { getCartCount } from "@/actions/cart";
import { connectToDb } from "@/lib/connectToDb";
import { normalizeAccountEmail } from "@/utils/account-email";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const email = normalizeAccountEmail(url.searchParams.get("email") ?? url.searchParams.get("phone"));
    if (!email) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        const count = await getCartCount(email);
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
