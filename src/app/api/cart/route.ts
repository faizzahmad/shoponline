import { connectToDb } from "@/lib/connectToDb";
import {
    AddtoCart,
    handelRemoveItemFromcart,
    chnageCount,
} from "@/actions/cart";
import { syncCartWithProducts } from "@/actions/cart-sync";
import Cart from "@/lib/models/cart-model";
import Product from "@/lib/models/product-model";

export async function POST(req: Request) {
    const body = await req.json();
    const { phone, items } = body;
    if (!phone || !items) {
        return new Response(JSON.stringify({ error: "Phone number and items are required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        const response = await AddtoCart(phone, items);
        return new Response(JSON.stringify(response), {
            status: 200,
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        const msg = error instanceof Error ? error.message : "Error adding to cart";
        const client = msg !== "Error adding to cart";
        return new Response(JSON.stringify({ error: msg }), {
            status: client ? 400 : 500,
        });
    }
}


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
        const warnings = await syncCartWithProducts(phone);
        const cart = (await Cart.findOne({ userPhone: phone }).lean()) as {
            items?: Array<Record<string, unknown>>;
        } | null;
        if (!cart || !cart.items?.length) {
            return new Response(JSON.stringify({ items: [], warnings }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        const items = await Promise.all(
            cart.items.map(async (item: Record<string, unknown>) => {
                const pid = String(item.productId);
                const p = (await Product.findById(pid).select("productStock").lean()) as {
                    productStock?: number;
                } | null;
                const availableStock = p ? Number(p.productStock ?? 0) : 0;
                return {
                    ...item,
                    productId: pid,
                    availableStock,
                };
            })
        );

        return new Response(JSON.stringify({ items, warnings }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return new Response(JSON.stringify({ error: "Error fetching cart" }), {
            status: 500,
        });
    }
}

export async function DELETE(req: Request) {
    const body = await req.json();
    const { phone, productId } = body;
    if (!phone || !productId) {
        return new Response(JSON.stringify({ error: "Phone number and product ID are required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        await handelRemoveItemFromcart(phone, productId);
        return new Response(JSON.stringify({ message: "Item removed from cart successfully"}), {
            status: 200,
        });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        return new Response(JSON.stringify({ error: "Error removing item from cart" }), {
            status: 500,
        });
    }
}

export async function PUT(req: Request) {
    const body = await req.json();
    const { phone, productId, quantity } = body;
    if (!phone || !productId || quantity === undefined) {   
        return new Response(JSON.stringify({ error: "Phone number, product ID, and quantity are required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        const response = await chnageCount(phone, productId, quantity);
        return new Response(JSON.stringify(response), {
            status: 200,
        });
    } catch (error) {
        console.error("Error changing item count:", error);
        const msg = error instanceof Error ? error.message : "Error changing item count";
        const client = msg !== "Error changing item count";
        return new Response(JSON.stringify({ error: msg }), {
            status: client ? 400 : 500,
        });
    }
}
