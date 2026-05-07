"use server";

import Cart from "@/lib/models/cart-model";
import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import mongoose from "mongoose";

function fmtInr(n: number): string {
    return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export type CartSyncWarning = {
    type:
        | "price_updated"
        | "quantity_capped"
        | "removed_missing"
        | "out_of_stock"
        | "invalid_line_removed";
    /** Set when the user can remove this line from the cart (e.g. out of stock) */
    productId?: string;
    /** Variant of the affected line so sibling variants of the same product aren't also removed */
    variantId?: string;
    productName: string;
    message: string;
};

/**
 * Refresh cart line prices from Product documents and enforce stock limits.
 * Out-of-stock lines stay in the cart so the customer can remove them manually.
 */
export async function syncCartWithProducts(phone: string): Promise<CartSyncWarning[]> {
    await connectToDb();
    const warnings: CartSyncWarning[] = [];

    const cart = await Cart.findOne({ userPhone: phone });
    if (!cart || !cart.items.length) {
        return warnings;
    }

    for (let i = cart.items.length - 1; i >= 0; i--) {
        const item = cart.items[i];
        const pid = item.productId;
        const id = typeof pid === "string" ? pid : String(pid);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            warnings.push({
                type: "invalid_line_removed",
                productName: String(item.productName),
                message: `Removed an invalid cart entry (“${String(item.productName)}”).`,
            });
            cart.items.splice(i, 1);
            continue;
        }

        const raw = await Product.findById(id).lean();
        if (!raw) {
            warnings.push({
                type: "removed_missing",
                productName: String(item.productName),
                message: `${item.productName} is no longer sold here and was removed from your cart.`,
            });
            cart.items.splice(i, 1);
            continue;
        }

        const product = raw as {
            productStock?: number;
            productName?: string;
            originalPrice?: number;
            discountPrice?: number;
            images?: string[];
            productCategory?: string;
            productSubCategory?: string;
            shortDescription?: string;
            longDescription?: string;
            productCategoryId?: unknown;
            productSubCategoryId?: unknown;
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

        const lineVariantId = String(item.variantId ?? "");
        const matchedVariant = lineVariantId
            ? (product.variantCombinations ?? []).find(
                  (v) => String(v.variantId) === lineVariantId
              )
            : null;
        if (lineVariantId && !matchedVariant) {
            warnings.push({
                type: "removed_missing",
                productName: String(item.productName),
                message: `${item.productName} (selected option is no longer available) was removed from your cart.`,
            });
            cart.items.splice(i, 1);
            continue;
        }

        const stock = Number(
            matchedVariant ? matchedVariant.productStock ?? 0 : product.productStock ?? 0
        );
        const name = String(product.productName);
        let qty = Math.max(1, Math.floor(Number(item.quantity)));

        const oldOrig = Number(item.originalPrice);
        const oldDisc = Number(item.discountPrice ?? 0);
        const newOrig = Number(
            matchedVariant ? matchedVariant.originalPrice ?? 0 : product.originalPrice ?? 0
        );
        const newDisc = Number(
            matchedVariant ? matchedVariant.discountPrice ?? 0 : product.discountPrice ?? 0
        );

        const variantLabel = matchedVariant
            ? ` (${(matchedVariant.attributes ?? [])
                  .map((a) => `${a.name}: ${a.value}`)
                  .join(", ")})`
            : "";
        const displayName = `${name}${variantLabel}`;

        if (oldOrig !== newOrig || oldDisc !== newDisc) {
            const detail: string[] = [];
            if (oldOrig !== newOrig) {
                const dir = newOrig > oldOrig ? "increased" : "decreased";
                detail.push(
                    `selling price ${dir} from ${fmtInr(oldOrig)} to ${fmtInr(newOrig)} per unit`
                );
            }
            if (oldDisc !== newDisc) {
                detail.push(`MRP updated from ${fmtInr(oldDisc)} to ${fmtInr(newDisc)}`);
            }
            warnings.push({
                type: "price_updated",
                productId: id,
                variantId: lineVariantId || undefined,
                productName: displayName,
                message: `${displayName}: ${detail.join("; ")}.`,
            });
        }

        if (stock < 1) {
            item.originalPrice = newOrig;
            item.discountPrice = newDisc;
            item.productName = name;
            item.images = product.images ?? [];
            item.productCategory = String(product.productCategory);
            item.productSubCategory = String(product.productSubCategory);
            item.shortDescription = String(product.shortDescription ?? "");
            item.longDescription = String(product.longDescription ?? "");
            item.productCategoryId = product.productCategoryId as typeof item.productCategoryId;
            item.productSubCategoryId = product.productSubCategoryId as typeof item.productSubCategoryId;
            item.length = Number(product.length ?? 0);
            item.breadth = Number(product.breadth ?? 0);
            item.height = Number(product.height ?? 0);
            item.weight = Number(product.weight ?? 0);

            warnings.push({
                type: "out_of_stock",
                productId: id,
                variantId: lineVariantId || undefined,
                productName: displayName,
                message: `${displayName} is out of stock. Remove it from your cart to continue shopping, or wait until it is restocked.`,
            });
            continue;
        }

        if (qty > stock) {
            warnings.push({
                type: "quantity_capped",
                productId: id,
                variantId: lineVariantId || undefined,
                productName: displayName,
                message: `${displayName}: quantity lowered from ${qty} to ${stock} (only ${stock} in stock).`,
            });
            qty = stock;
        }

        item.quantity = qty;
        item.originalPrice = newOrig;
        item.discountPrice = newDisc;
        item.productName = name;
        item.images = product.images ?? [];
        item.productCategory = String(product.productCategory);
        item.productSubCategory = String(product.productSubCategory);
        item.shortDescription = String(product.shortDescription ?? "");
        item.longDescription = String(product.longDescription ?? "");
        item.productCategoryId = product.productCategoryId as typeof item.productCategoryId;
        item.productSubCategoryId = product.productSubCategoryId as typeof item.productSubCategoryId;
        item.length = Number(product.length ?? 0);
        item.breadth = Number(product.breadth ?? 0);
        item.height = Number(product.height ?? 0);
        item.weight = Number(product.weight ?? 0);
    }

    await cart.save();
    return warnings;
}
