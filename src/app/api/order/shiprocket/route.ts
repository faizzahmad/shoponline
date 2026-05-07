import { connectToDb } from "@/lib/connectToDb";
import Order from "@/lib/models/order-model";
import { verifyAuth } from "@/utils/verifyToken";
import {
    assignAwbForOrder,
    syncOrderToShiprocket,
} from "@/lib/shiprocket";

type Action = "retry-sync" | "assign-awb";

export async function POST(request: Request) {
    const verified = await verifyAuth();
    if (!verified.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    let body: { orderId?: string; action?: Action; courierCompanyId?: number | string };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }

    const { orderId, action, courierCompanyId } = body;
    if (!orderId || typeof orderId !== "string") {
        return new Response(JSON.stringify({ error: "orderId is required" }), { status: 400 });
    }
    if (action !== "retry-sync" && action !== "assign-awb") {
        return new Response(
            JSON.stringify({ error: "action must be 'retry-sync' or 'assign-awb'" }),
            { status: 400 }
        );
    }

    await connectToDb();

    if (action === "retry-sync") {
        // Reset prior error so the result reflects this attempt
        await Order.findByIdAndUpdate(orderId, { $set: { shiprocketSyncError: null } });
        await syncOrderToShiprocket(orderId);
        const fresh = (await Order.findById(orderId)
            .select("shiprocketOrderId shiprocketShipmentId shiprocketSyncedAt shiprocketSyncError")
            .lean()) as Record<string, unknown> | null;
        if (fresh?.shiprocketOrderId) {
            return new Response(
                JSON.stringify({ message: "Synced to Shiprocket", order: fresh }),
                { status: 200 }
            );
        }
        return new Response(
            JSON.stringify({
                error:
                    typeof fresh?.shiprocketSyncError === "string"
                        ? (fresh.shiprocketSyncError as string)
                        : "Could not sync to Shiprocket",
            }),
            { status: 502 }
        );
    }

    // assign-awb
    const result = await assignAwbForOrder(orderId, courierCompanyId);
    if (result.ok) {
        return new Response(
            JSON.stringify({
                message: "AWB assigned",
                awbCode: result.awbCode,
                courierName: result.courierName,
                courierCompanyId: result.courierCompanyId ?? null,
            }),
            { status: 200 }
        );
    }
    return new Response(JSON.stringify({ error: result.error }), { status: 502 });
}
