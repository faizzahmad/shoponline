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
                const variantId = String(item.variantId ?? "");
                const p = (await Product.findById(pid)
                    .select("productStock variantCombinations length breadth height weight")
                    .lean()) as {
                    productStock?: number;
                    variantCombinations?: Array<{
                        variantId: string;
                        productStock?: number;
                        image?: string;
                    }>;
                    length?: number;
                    breadth?: number;
                    height?: number;
                    weight?: number;
                } | null;
                const matchedVariant = variantId
                    ? p?.variantCombinations?.find((v) => String(v.variantId) === variantId)
                    : undefined;
                const availableStock = p
                    ? Number(matchedVariant?.productStock ?? p.productStock ?? 0)
                    : 0;
                return {
                    ...item,
                    productId: pid,
                    availableStock,
                    variantImage: (item.variantImage as string) || matchedVariant?.image || "",
                    length: Number(item.length ?? p?.length ?? 0),
                    breadth: Number(item.breadth ?? p?.breadth ?? 0),
                    height: Number(item.height ?? p?.height ?? 0),
                    weight: Number(item.weight ?? p?.weight ?? 0),
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
    const { phone, productId, variantId } = body;
    if (!phone || !productId) {
        return new Response(JSON.stringify({ error: "Phone number and product ID are required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        await handelRemoveItemFromcart(phone, productId, variantId);
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
    const { phone, productId, variantId, quantity } = body;
    if (!phone || !productId || quantity === undefined) {   
        return new Response(JSON.stringify({ error: "Phone number, product ID, and quantity are required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        const response = await chnageCount(phone, productId, quantity, variantId);
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
