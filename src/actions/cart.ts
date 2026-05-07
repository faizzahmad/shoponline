"use server";
import Cart from "@/lib/models/cart-model";
import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

type productItem = {
    productId : string;
    variantId?: string;
    variantAttributes?: Array<{ name: string; value: string }>;
    variantImage?: string;
    quantity : number;
    originalPrice : number;
    discountPrice : number;
    productName : string;
    images : string[];
    productCategory : string;
    productCategoryId : string;
    productSubCategory : string;
    productSubCategoryId : string;
    shortDescription : string;  
    longDescription : string;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
};

/** Mongoose `.lean()` is loosely typed; narrow for build-time checks */
type ProductLeanDoc = {
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

export const AddtoCart = async (phone: string, items: productItem) => {
    await connectToDb();
    if (!phone) {
        throw new Error("Phone number and product ID are required");
    }
    try {
        if (!mongoose.Types.ObjectId.isValid(items.productId)) {
            throw new Error("Invalid product");
        }
        const rawProduct = await Product.findById(items.productId).lean();
        if (!rawProduct) {
            throw new Error("Product not found");
        }
        const product = rawProduct as ProductLeanDoc;
        const requestedVariantId =
            typeof items.variantId === "string" ? items.variantId.trim() : "";
        const selectedVariant = requestedVariantId
            ? (product.variantCombinations ?? []).find(
                  (v) => String(v.variantId) === requestedVariantId
              )
            : null;
        if (requestedVariantId && !selectedVariant) {
            throw new Error("Selected variant is not available");
        }
        const stock = Number(
            selectedVariant ? selectedVariant.productStock ?? 0 : product.productStock ?? 0
        );
        if (stock < 1) {
            throw new Error("This product is out of stock");
        }

        const cart = await Cart.findOne({ userPhone: phone });
        const existingItemIndex = cart
            ? cart.items.findIndex(
                  (item: productItem) =>
                      item.productId.toString() === items.productId &&
                      String(item.variantId ?? "") === requestedVariantId
              )
            : -1;
        let nextQty = items.quantity;
        if (existingItemIndex > -1 && cart) {
            nextQty = cart.items[existingItemIndex].quantity + items.quantity;
        }
        if (nextQty > stock) {
            throw new Error(`Only ${stock} unit(s) available in stock`);
        }

        const line: productItem = {
            ...items,
            variantId: requestedVariantId,
            variantAttributes: selectedVariant?.attributes ?? items.variantAttributes ?? [],
            variantImage: selectedVariant?.image ?? "",
            quantity: items.quantity,
            originalPrice: Number(
                selectedVariant ? selectedVariant.originalPrice ?? 0 : product.originalPrice ?? 0
            ),
            discountPrice: Number(
                selectedVariant ? selectedVariant.discountPrice ?? 0 : product.discountPrice ?? 0
            ),
            productName: String(product.productName ?? ""),
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
        };

        if (!cart) {
            const newCart = new Cart({ userPhone: phone, items: [line] });
            await newCart.save();
            revalidatePath("/cart");
            revalidatePath("/");
            return {
                message: "Cart created and item added successfully",
            };
        }

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += items.quantity;
            cart.items[existingItemIndex].originalPrice = line.originalPrice;
            cart.items[existingItemIndex].discountPrice = line.discountPrice;
        } else {
            cart.items.push(line);
        }
        await cart.save();
        revalidatePath("/cart");
        revalidatePath("/");
        return {
            message: "Item added to cart successfully",
        };
    } catch (err) {
        console.error("Error adding to cart:", err);
        if (err instanceof Error) throw err;
        throw new Error("Error adding to cart");
    }
};


export const handelRemoveItemFromcart = async (
    phone: string,
    productId: string,
    variantId?: string
) => {
    await connectToDb();
    if (!phone || !productId) {
        throw new Error("Phone number and product ID are required");
    }
    try {
        const cart = await Cart.findOne({ userPhone: phone });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const targetVariant = typeof variantId === "string" ? variantId.trim() : "";
        const itemIndex = cart.items.findIndex(
            (item: productItem) =>
                item.productId.toString() === productId &&
                (targetVariant === "" || String(item.variantId ?? "") === targetVariant)
        );
        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
        } else {
            throw new Error("Item not found in cart");
        }
    } catch (err) {
        console.error("Error removing item:", err);
        throw new Error("Error removing item");
    }
}

export const handelgetCart = async (phone: string) =>{
     await connectToDb();
        if (!phone) {
            throw new Error("Phone number is required");
        }
        try {
            const cart = await Cart.findOne ({ userPhone: phone }).populate('items.productId');     
            if (!cart) {
                throw new Error("Cart not found");
            }
            return cart;
        } catch (err) {
            console.error("Error fetching cart:", err);
            throw new Error("Error fetching cart");
        }   
}

export const getCartCount = async (phone: string) => {
    await connectToDb();
    if (!phone) {
        console.log("Phone number is required");
        return 0;
    }
    try {
        const cart = await Cart.findOne({ userPhone: phone });
        if (!cart) {
            return 0; 
        }

       
        return cart.items.length;
    } catch (err) {
        console.error("Error fetching cart count:", err);
        throw new Error("Error fetching cart count");
    }
}

export const chnageCount = async (
    phone: string,
    productId: string,
    quantity: number,
    variantId?: string
) => {
    await connectToDb();
    if (!phone || !productId || quantity < 1) {
        throw new Error("Phone number, product ID and valid quantity are required");
    }
    try {
        const rawProduct = await Product.findById(productId).lean();
        if (!rawProduct) {
            throw new Error("Product not found");
        }
        const product = rawProduct as ProductLeanDoc;
        const cart = await Cart.findOne({ userPhone: phone });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const targetVariant = typeof variantId === "string" ? variantId.trim() : "";
        const itemIndex = cart.items.findIndex(
            (item: productItem) =>
                item.productId.toString() === productId &&
                (targetVariant === "" || String(item.variantId ?? "") === targetVariant)
        );
        if (itemIndex < 0) {
            throw new Error("Item not found in cart");
        }
        const lineVariantId = String(cart.items[itemIndex].variantId ?? "");
        const selectedVariant = lineVariantId
            ? (product.variantCombinations ?? []).find((v) => String(v.variantId) === lineVariantId)
            : null;
        const stock = Number(
            selectedVariant ? selectedVariant.productStock ?? 0 : product.productStock ?? 0
        );
        if (stock < 1) {
            throw new Error("This product is out of stock");
        }
        if (quantity > stock) {
            throw new Error(`Only ${stock} unit(s) available`);
        }
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].originalPrice = Number(
                selectedVariant ? selectedVariant.originalPrice ?? 0 : product.originalPrice
            );
            cart.items[itemIndex].discountPrice = Number(
                selectedVariant ? selectedVariant.discountPrice ?? 0 : product.discountPrice ?? 0
            );
            cart.items[itemIndex].length = Number(product.length ?? 0);
            cart.items[itemIndex].breadth = Number(product.breadth ?? 0);
            cart.items[itemIndex].height = Number(product.height ?? 0);
            cart.items[itemIndex].weight = Number(product.weight ?? 0);
            await cart.save();
        } else {
            throw new Error("Item not found in cart");
        }
    } catch (err) {
        console.error("Error changing item count:", err);
        if (err instanceof Error) throw err;
        throw new Error("Error changing item count");
    }
};
