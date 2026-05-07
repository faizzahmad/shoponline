import { connectToDb } from "@/lib/connectToDb";
import Order from "@/lib/models/order-model";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in";

type OrderLine = {
    productName?: string;
    productId?: string;
    variantId?: string;
    quantity?: number;
    originalPrice?: number;
    weight?: number;
    length?: number;
    breadth?: number;
    height?: number;
};

let tokenCache: { token: string; expiresAtMs: number } | null = null;

function formatOrderDate(d: unknown): string {
    const x = d instanceof Date ? d : new Date();
    if (Number.isNaN(x.getTime())) return formatOrderDate(new Date());
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Last 10 digits for Indian mobile */
function normalizeIndianPhone(phone: string): string {
    const d = phone.replace(/\D/g, "");
    if (d.length >= 12 && d.startsWith("91")) return d.slice(-10);
    if (d.length >= 10) return d.slice(-10);
    return d.padStart(10, "0").slice(-10);
}

async function shiprocketLogin(email: string, password: string): Promise<string> {
    const now = Date.now();
    if (tokenCache && now < tokenCache.expiresAtMs - 120_000) {
        return tokenCache.token;
    }

    const res = await fetch(`${SHIPROCKET_BASE}/v1/external/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
        const msg =
            typeof json.message === "string"
                ? json.message
                : typeof json.error === "string"
                  ? json.error
                  : `Shiprocket login failed (${res.status})`;
        throw new Error(msg);
    }
    const token = json.token as string | undefined;
    if (!token) {
        throw new Error("Shiprocket login: no token in response");
    }
    // Docs: token valid 240h — refresh early
    tokenCache = {
        token,
        expiresAtMs: now + (240 - 1) * 60 * 60 * 1000,
    };
    return token;
}

function buildAdhocPayload(
    order: {
        _id: unknown;
        username?: string;
        userPhone?: string;
        streetAddress?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        totalAmount?: number;
        paymentMethod?: string;
        orderDateTime?: Date;
        items?: OrderLine[];
    },
    pickupLocation: string
): Record<string, unknown> {
    const items = Array.isArray(order.items) ? order.items : [];

    if (items.length === 0) {
        throw new Error("Cannot create Shiprocket order with no line items");
    }

    /**
     * Distribute the coupon discount across line items as a per-unit `discount`.
     * Shiprocket's adhoc API computes each line as `(selling_price - discount) * units`,
     * and prints `discount` in the invoice's UNIT DISCOUNT column. We:
     *   1. Compute the gross (pre-discount) total from line items.
     *   2. Diff against the stored `totalAmount` (which already includes the coupon).
     *   3. Allocate the diff to each line proportional to its share of the gross total,
     *      letting the last line absorb any rounding remainder so totals reconcile.
     */
    const subtotal = Math.round(Number(order.totalAmount) || 0);
    const lineMeta = items.map((line) => {
        const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
        const unitPrice = Math.round(Number(line.originalPrice) || 0);
        return { qty, unitPrice, gross: unitPrice * qty };
    });
    const grossTotal = lineMeta.reduce((s, m) => s + m.gross, 0);
    const totalDiscount = Math.max(0, grossTotal - subtotal);

    let remainingDiscount = totalDiscount;
    const order_items = items.map((line, idx) => {
        const { qty, unitPrice, gross } = lineMeta[idx];
        let lineDiscount = 0;
        if (totalDiscount > 0 && grossTotal > 0) {
            lineDiscount =
                idx === items.length - 1
                    ? remainingDiscount
                    : Math.round((gross / grossTotal) * totalDiscount);
            remainingDiscount -= lineDiscount;
        }
        const perUnitDiscount =
            qty > 0 ? Math.round((lineDiscount / qty) * 100) / 100 : 0;

        const sku = `${String(line.productId ?? "sku")}-${String(line.variantId ?? "default")}`.slice(
            0,
            50
        );
        return {
            name: String(line.productName ?? "Item").slice(0, 200),
            sku,
            units: qty,
            selling_price: unitPrice,
            discount: perUnitDiscount,
            tax: "",
            hsn: "",
        };
    });

    /**
     * Polythene-mailer assumption: parcel conforms to the products.
     * Use the largest single-product L/B/H and the summed weight (grams).
     */
    let totalGrams = 0;
    let maxL = 10;
    let maxB = 10;
    let maxH = 10;
    for (const line of items) {
        const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
        const lineWeight = Number(line.weight);
        totalGrams += (Number.isFinite(lineWeight) && lineWeight > 0 ? lineWeight : 500) * qty;
        if (Number(line.length) > 0) maxL = Math.max(maxL, Number(line.length));
        if (Number(line.breadth) > 0) maxB = Math.max(maxB, Number(line.breadth));
        if (Number(line.height) > 0) maxH = Math.max(maxH, Number(line.height));
    }
    const weightKg = Math.max(0.05, Math.round((totalGrams / 1000) * 1000) / 1000);

    const phoneDigits = normalizeIndianPhone(String(order.userPhone ?? ""));
    const billing_phone = Number(phoneDigits);

    const fullName = String(order.username ?? "Customer").trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const billing_customer_name = (parts[0] ?? "Customer").slice(0, 50);
    const billing_last_name = (parts.slice(1).join(" ") || "-").slice(0, 50);

    const billing_email =
        process.env.SHIPROCKET_ORDER_EMAIL?.trim() ||
        process.env.SHIPROCKET_EMAIL?.trim() ||
        "orders@example.com";

    const pinRaw = String(order.zipCode ?? "").replace(/\D/g, "").slice(0, 6);
    const billing_pincode = parseInt(pinRaw, 10) || 110001;

    const payment_method = order.paymentMethod === "cod" ? "COD" : "Prepaid";

    return {
        order_id: String(order._id).slice(0, 50),
        order_date: formatOrderDate(order.orderDateTime),
        pickup_location: pickupLocation,
        billing_customer_name,
        billing_last_name,
        billing_address: String(order.streetAddress ?? "-").slice(0, 200),
        billing_city: String(order.city ?? "-").slice(0, 30),
        billing_pincode,
        billing_state: String(order.state ?? "-").slice(0, 30),
        billing_country: "India",
        billing_email,
        billing_phone,
        shipping_is_billing: true,
        order_items,
        payment_method,
        sub_total: subtotal,
        length: maxL,
        breadth: maxB,
        height: maxH,
        weight: weightKg,
    };
}

/**
 * Pushes a placed order to Shiprocket (adhoc / quick order).
 * - COD: call right after order is saved.
 * - Prepaid: call only after Razorpay verification succeeds.
 *
 * Does not throw (logs only). Updates order with ids or `shiprocketSyncError`.
 * Requires `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, and `SHIPROCKET_PICKUP_LOCATION`
 * (exact warehouse name from Shiprocket → Settings → Pickup Location).
 */
export async function syncOrderToShiprocket(orderMongoId: string): Promise<void> {
    if (process.env.SHIPROCKET_ENABLED === "false") {
        return;
    }

    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD;
    const pickup = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();

    if (!email || !password) {
        console.warn("[Shiprocket] Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD — skip sync");
        return;
    }
    if (!pickup) {
        await connectToDb();
        await Order.findByIdAndUpdate(orderMongoId, {
            shiprocketSyncError:
                "Missing SHIPROCKET_PICKUP_LOCATION (use exact name from Shiprocket pickup settings)",
        });
        console.warn("[Shiprocket] Missing SHIPROCKET_PICKUP_LOCATION — skip sync");
        return;
    }

    try {
        await connectToDb();
    } catch (e) {
        console.error("[Shiprocket] DB connect failed", e);
        return;
    }

    const order = await Order.findById(orderMongoId).lean();
    if (!order) {
        console.warn("[Shiprocket] Order not found:", orderMongoId);
        return;
    }

    const existingId = (order as { shiprocketOrderId?: string | null }).shiprocketOrderId;
    if (existingId) {
        return;
    }

    try {
        const token = await shiprocketLogin(email, password);
        const payload = buildAdhocPayload(
            order as Parameters<typeof buildAdhocPayload>[0],
            pickup
        );

        const srRes = await fetch(`${SHIPROCKET_BASE}/v1/external/orders/create/adhoc`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const srJson = (await srRes.json()) as Record<string, unknown>;

        if (!srRes.ok) {
            const errMsg =
                typeof srJson.message === "string"
                    ? srJson.message
                    : JSON.stringify(srJson).slice(0, 800);
            console.error("[Shiprocket] Create order failed:", errMsg);
            await Order.findByIdAndUpdate(orderMongoId, {
                shiprocketSyncError: errMsg,
            });
            return;
        }

        const srOrderId =
            srJson.order_id != null ? String(srJson.order_id as string | number) : "";
        const shipmentId = srJson.shipment_id;

        if (!srOrderId) {
            console.warn("[Shiprocket] Success response missing order_id:", srJson);
        }

        await Order.findByIdAndUpdate(orderMongoId, {
            $set: {
                shiprocketOrderId: srOrderId || null,
                shiprocketShipmentId: shipmentId != null ? shipmentId : null,
                shiprocketSyncedAt: new Date(),
                shiprocketSyncError: null,
            },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[Shiprocket] syncOrderToShiprocket error:", msg);
        await Order.findByIdAndUpdate(orderMongoId, {
            shiprocketSyncError: msg.slice(0, 500),
        });
    }
}

export type AssignAwbResult =
    | {
          ok: true;
          awbCode: string;
          courierName: string;
          courierCompanyId?: number | string;
      }
    | { ok: false; error: string };

/**
 * Assign an AWB (tracking number) to a Shiprocket shipment.
 * Call this AFTER the order has been synced (i.e. `shiprocketShipmentId` exists).
 *
 * @param orderMongoId  Mongo `_id` of the order
 * @param courierCompanyId  Optional preferred courier id; otherwise Shiprocket picks the cheapest
 */
export async function assignAwbForOrder(
    orderMongoId: string,
    courierCompanyId?: number | string
): Promise<AssignAwbResult> {
    if (process.env.SHIPROCKET_ENABLED === "false") {
        return { ok: false, error: "Shiprocket integration is disabled" };
    }
    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD;
    if (!email || !password) {
        return { ok: false, error: "Shiprocket credentials are not configured" };
    }

    await connectToDb();
    const order = (await Order.findById(orderMongoId).lean()) as
        | {
              shiprocketShipmentId?: number | string | null;
              awbCode?: string | null;
          }
        | null;
    if (!order) return { ok: false, error: "Order not found" };
    if (!order.shiprocketShipmentId) {
        return {
            ok: false,
            error: "Order has not been synced to Shiprocket yet. Sync the order first.",
        };
    }
    if (order.awbCode) {
        return {
            ok: false,
            error: `AWB already assigned (${order.awbCode})`,
        };
    }

    try {
        const token = await shiprocketLogin(email, password);
        const body: Record<string, unknown> = {
            shipment_id: order.shiprocketShipmentId,
        };
        if (courierCompanyId !== undefined && courierCompanyId !== null && courierCompanyId !== "") {
            body.courier_id = courierCompanyId;
        }

        const res = await fetch(`${SHIPROCKET_BASE}/v1/external/courier/assign/awb`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        const json = (await res.json()) as Record<string, unknown>;

        const data = (json.response && typeof json.response === "object"
            ? (json.response as Record<string, unknown>).data
            : null) as Record<string, unknown> | null;

        const awb = (data?.awb_code ?? json.awb_code) as string | number | undefined;
        const courier = (data?.courier_name ?? json.courier_name) as string | undefined;
        const cid = (data?.courier_company_id ?? json.courier_company_id) as
            | string
            | number
            | undefined;

        if (!res.ok || !awb) {
            const msg =
                typeof json.message === "string"
                    ? json.message
                    : (data && typeof (data as Record<string, unknown>).message === "string"
                        ? ((data as Record<string, unknown>).message as string)
                        : "")
                      || JSON.stringify(json).slice(0, 800);
            await Order.findByIdAndUpdate(orderMongoId, {
                $set: { shiprocketSyncError: msg.slice(0, 500) },
            });
            return { ok: false, error: msg };
        }

        const awbCode = String(awb);
        const courierName = String(courier ?? "");

        await Order.findByIdAndUpdate(orderMongoId, {
            $set: {
                awbCode,
                courierName,
                courierCompanyId: cid ?? null,
                awbAssignedAt: new Date(),
                shiprocketSyncError: null,
            },
        });

        return {
            ok: true,
            awbCode,
            courierName,
            courierCompanyId: cid,
        };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[Shiprocket] assignAwbForOrder error:", msg);
        await Order.findByIdAndUpdate(orderMongoId, {
            $set: { shiprocketSyncError: msg.slice(0, 500) },
        });
        return { ok: false, error: msg };
    }
}
