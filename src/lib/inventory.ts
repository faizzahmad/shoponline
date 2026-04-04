import mongoose from "mongoose";
import Product from "@/lib/models/product-model";
export type ClientOrderLine = {
    productId: string;
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
        const product = await Product.findById(line.productId).lean();
        if (!product) {
            return {
                ok: false,
                error: `Product no longer available: ${line.productName}`,
                code: "PRODUCT_NOT_FOUND",
            };
        }

        const stock = Number(product.productStock ?? 0);
        const qty = Math.max(1, Math.floor(Number(line.quantity)));
        if (stock < 1) {
            return {
                ok: false,
                error: `${product.productName} is out of stock`,
                code: "INSUFFICIENT_STOCK",
            };
        }
        if (qty > stock) {
            return {
                ok: false,
                error: `Only ${stock} unit(s) available for ${product.productName}`,
                code: "INSUFFICIENT_STOCK",
            };
        }

        const originalPrice = Number(product.originalPrice);
        const discountPrice = Number(product.discountPrice ?? 0);
        const lineTotal = originalPrice * qty;
        totalAmount += lineTotal;

        normalized.push({
            productId: String(product._id),
            quantity: qty,
            originalPrice,
            discountPrice,
            productName: product.productName,
            images: product.images ?? [],
            productCategory: product.productCategory,
            productCategoryId: String(product.productCategoryId),
            productSubCategory: product.productSubCategory,
            productSubCategoryId: String(product.productSubCategoryId),
            shortDescription: product.shortDescription ?? "",
            longDescription: product.longDescription ?? "",
        });
    }

    return { ok: true, items: normalized, totalAmount };
}

type OrderItemLike = {
    productId: string;
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
        const updated = await Product.findOneAndUpdate(
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
