import { connectToDb } from "@/lib/connectToDb";
import { AddtoCart,handelgetCart,handelRemoveItemFromcart,chnageCount } from "@/actions/cart";

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
        return new Response(JSON.stringify({ error: "Error adding to cart" }), {
            status: 500,
        });
    }       
}


export async function GET(req: Request) {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    console.log("Phone number:", phone);
    if (!phone) {
        return new Response(JSON.stringify({ error: "Phone number is required" }), {
            status: 400,
        });
    }
    await connectToDb();
    try {
        const cart = await handelgetCart(phone);
        return new Response(JSON.stringify(cart), {
            status: 200,
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
        return new Response(JSON.stringify({ error: "Error changing item count" }), {
            status: 500,
        });
    }   

}
