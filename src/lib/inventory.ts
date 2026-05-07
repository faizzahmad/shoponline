import mongoose from "mongoose";
import Product from "@/lib/models/product-model";

/** Mongoose `.lean()` document shape for order validation */
type ProductLeanDoc = {
    _id: unknown;
    productStock?: number;
    originalPrice?: number;
    discountPrice?: number;
    variantCombinations?: Array<{
        variantId: string;
        productStock?: number;
        originalPrice?: number;
        discountPrice?: number;
        image?: string;
        attributes?: Array<{ name: string; value: string }>;
    }>;
    productName?: string;
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
};

export type ClientOrderLine = {
    productId: string;
    variantId?: string;
    variantAttributes?: Array<{ name: string; value: string }>;
    variantImage?: string;
    quantity: number;
    originalPrice: number;
    discountPrice: number;
    productName: string;
    images: string[];
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    shortDescription: string;
    longDescription: string;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
};

export type ValidateOrderResult =
    | { ok: true; items: ClientOrderLine[]; totalAmount: number }
    | { ok: false; error: string; code?: "INSUFFICIENT_STOCK" | "PRODUCT_NOT_FOUND" };

/**
 * Build order lines from DB: enforce current prices and stock.
 */
export async function validateAndNormalizeOrderItems(
    clientItems: ClientOrderLine[]
): Promise<ValidateOrderResult> {
    if (!clientItems?.length) {
        return { ok: false, error: "No items in order" };
    }

    const normalized: ClientOrderLine[] = [];
    let totalAmount = 0;

    for (const line of clientItems) {
        if (!mongoose.Types.ObjectId.isValid(line.productId)) {
            return {
                ok: false,
                error: `Invalid product in cart${line.productName ? ` (“${line.productName}”)` : ""}.`,
                code: "PRODUCT_NOT_FOUND",
            };
        }
        const raw = await Product.findById(line.productId).lean();
        if (!raw) {
            return {
                ok: false,
                error: `Product no longer available: ${line.productName}`,
                code: "PRODUCT_NOT_FOUND",
            };
        }
        const product = raw as ProductLeanDoc;
        const requestedVariantId =
            typeof line.variantId === "string" ? line.variantId.trim() : "";
        const variant = requestedVariantId
            ? (product.variantCombinations ?? []).find(
                  (v) => String(v.variantId) === requestedVariantId
              )
            : null;

        const stock = Number(
            variant ? variant.productStock ?? 0 : product.productStock ?? 0
        );
        const qty = Math.max(1, Math.floor(Number(line.quantity)));
        const displayName = String(product.productName ?? line.productName);
        if (stock < 1) {
            return {
                ok: false,
                error: `${displayName} is out of stock`,
                code: "INSUFFICIENT_STOCK",
            };
        }
        if (qty > stock) {
            return {
                ok: false,
                error: `Only ${stock} unit(s) available for ${displayName}`,
                code: "INSUFFICIENT_STOCK",
            };
        }

        const originalPrice = Number(
            variant ? variant.originalPrice ?? 0 : product.originalPrice ?? 0
        );
        const discountPrice = Number(
            variant ? variant.discountPrice ?? 0 : product.discountPrice ?? 0
        );
        const lineTotal = originalPrice * qty;
        totalAmount += lineTotal;

        normalized.push({
            productId: String(product._id),
            variantId: requestedVariantId,
            variantAttributes: variant?.attributes ?? [],
            variantImage: variant?.image ?? "",
            quantity: qty,
            originalPrice,
            discountPrice,
            productName: displayName,
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
        });
    }

    return { ok: true, items: normalized, totalAmount };
}

type OrderItemLike = {
    productId: string;
    variantId?: string;
    quantity: number;
};

/**
 * Atomically decrease stock; optionally increment totalSales.
 */
export async function decrementStockForOrderItems(
    items: OrderItemLike[],
    session?: mongoose.ClientSession | null
): Promise<{ ok: true } | { ok: false; message: string }> {
    for (const line of items) {
        const hasVariant = Boolean(line.variantId);
        const updated = hasVariant
            ? await Product.findOneAndUpdate(
                  {
                      _id: line.productId,
                      "variantCombinations.variantId": line.variantId,
                      "variantCombinations.productStock": { $gte: line.quantity },
                  },
                  {
                      $inc: {
                          "variantCombinations.$.productStock": -line.quantity,
                          totalSales: line.quantity,
                      },
                  },
                  { new: true, session: session ?? undefined }
              )
            : await Product.findOneAndUpdate(
                  {
                      _id: line.productId,
                      productStock: { $gte: line.quantity },
                  },
                  {
                      $inc: {
                          productStock: -line.quantity,
                          totalSales: line.quantity,
                      },
                  },
                  { new: true, session: session ?? undefined }
              );
        if (!updated) {
            return {
                ok: false,
                message: `Insufficient stock for a product (id: ${line.productId})`,
            };
        }
    }
    return { ok: true };
}

export async function incrementStockForOrderItems(
    items: OrderItemLike[],
    session?: mongoose.ClientSession | null
): Promise<void> {
    for (const line of items) {
        if (line.variantId) {
            await Product.findOneAndUpdate(
                {
                    _id: line.productId,
                    "variantCombinations.variantId": line.variantId,
                },
                {
                    $inc: {
                        "variantCombinations.$.productStock": line.quantity,
                        totalSales: -line.quantity,
                    },
                },
                { session: session ?? undefined }
            );
            continue;
        }
        await Product.findByIdAndUpdate(
            line.productId,
            {
                $inc: {
                    productStock: line.quantity,
                    totalSales: -line.quantity,
                },
            },
            { session: session ?? undefined }
        );
    }
}
