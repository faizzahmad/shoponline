import { getOrderById } from "@/actions/invoive";
export async function GET(request: Request) {
     const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
    if (!orderId) {
        return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        });
    }
    try {
        const order = await getOrderById(orderId);
        if (!order) {
            return new Response(JSON.stringify({ error: "Order not found" }), {
                status: 404,
            });
        }
        return new Response(JSON.stringify(order), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch order" }), {
            status: 500,
        });
    }

}