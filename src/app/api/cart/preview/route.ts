import { connectToDb } from "@/lib/connectToDb";
import Product from "@/lib/models/product-model";
import mongoose from "mongoose";
import type { CartSyncWarning } from "@/actions/cart-sync";

type IncomingItem = {
    productId: string;
    variantId?: string;
    quantity: number;
};

type ProductLeanDoc = {
    _id: unknown;
    productName?: string;
    productStock?: number;
    originalPrice?: number;
    discountPrice?: number;
    images?: string[];
    productCategory?: string;
    productCategoryId?: unknown;
    productSubCategory?: string;
    productSubCategoryId?: unknown;
    shortDescription?: string;
    longDescription?: string;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
    variantCombinations?: Array<{
        variantId: string;
        productStock?: number;
        originalPrice?: number;
        discountPrice?: number;
        image?: string;
        attributes?: Array<{ name: string; value: string }>;
    }>;
};

function fmtInr(n: number): string {
    return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/**
 * Soft-validate a guest cart against the database.
 * Returns refreshed line items (price, stock, attributes, image) and warnings,
 * without mutating any persisted cart.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const incoming: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];
        if (incoming.length === 0) {
            return new Response(JSON.stringify({ items: [], warnings: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        await connectToDb();

        const warnings: CartSyncWarning[] = [];
        const refreshed: Array<Record<string, unknown>> = [];

        for (const line of incoming) {
            if (!mongoose.Types.ObjectId.isValid(String(line.productId))) {
                warnings.push({
                    type: "invalid_line_removed",
                    productName: "Item",
                    message: "An invalid item was removed from your cart.",
                });
                continue;
            }
            const raw = await Product.findById(line.productId).lean();
            if (!raw) {
                warnings.push({
                    type: "removed_missing",
                    productName: "Item",
                    message: "An item was removed because it is no longer available.",
                });
                continue;
            }
            const product = raw as ProductLeanDoc;
            const reqVariant = String(line.variantId ?? "");
            const matched = reqVariant
                ? (product.variantCombinations ?? []).find(
                      (v) => String(v.variantId) === reqVariant
                  )
                : null;

            const stock = Number(
                matched ? matched.productStock ?? 0 : product.productStock ?? 0
            );
            const originalPrice = Number(
                matched ? matched.originalPrice ?? 0 : product.originalPrice ?? 0
            );
            const discountPrice = Number(
                matched ? matched.discountPrice ?? 0 : product.discountPrice ?? 0
            );
            const productName = String(product.productName ?? "");

            const variantLabel = matched
                ? ` (${(matched.attributes ?? [])
                      .map((a) => `${a.name}: ${a.value}`)
                      .join(", ")})`
                : "";
            const displayName = `${productName}${variantLabel}`;

            let qty = Math.max(1, Math.floor(Number(line.quantity)));
            if (stock < 1) {
                warnings.push({
                    type: "out_of_stock",
                    productId: String(product._id),
                    variantId: reqVariant || undefined,
                    productName: displayName,
                    message: `${displayName} is out of stock. Remove it from your cart to continue.`,
                });
            } else if (qty > stock) {
                warnings.push({
                    type: "quantity_capped",
                    productId: String(product._id),
                    variantId: reqVariant || undefined,
                    productName: displayName,
                    message: `${displayName}: quantity lowered from ${qty} to ${stock} (only ${stock} in stock).`,
                });
                qty = stock;
            }

            refreshed.push({
                productId: String(product._id),
                variantId: reqVariant,
                variantAttributes: matched?.attributes ?? [],
                variantImage: matched?.image ?? "",
                quantity: qty,
                originalPrice,
                discountPrice,
                productName,
                images: product.images ?? [],
                productCategory: String(product.productCategory ?? ""),
                productCategoryId: String(product.productCategoryId ?? ""),
                productSubCategory: String(product.productSubCategory ?? ""),
                productSubCategoryId: String(product.productSubCategoryId ?? ""),
                shortDescription: product.shortDescription ?? "",
                longDescription: product.longDescription ?? "",
                length: Number(product.length ?? 0),
                breadth: Number(product.breadth ?? 0),
                height: Number(product.height ?? 0),
                weight: Number(product.weight ?? 0),
                availableStock: stock,
                /** Reserved for future "price changed" warnings — we only currently warn when caller passes oldPrice, which guest cart could opt into later. */
                _fmt: fmtInr(originalPrice),
            });
        }

        return new Response(JSON.stringify({ items: refreshed, warnings }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error previewing cart:", error);
        return new Response(JSON.stringify({ error: "Failed to preview cart" }), {
            status: 500,
        });
    }
}
