"use server";
import Cart from "@/lib/models/cart-model";
import Product from "@/lib/models/product-model";
import { connectToDb } from "@/lib/connectToDb";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

type productItem = {
    productId : string;
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
}

export const AddtoCart = async (phone: string, items: productItem) => {
    await connectToDb();
    if (!phone) {
        throw new Error("Phone number and product ID are required");
    }
    try {
        if (!mongoose.Types.ObjectId.isValid(items.productId)) {
            throw new Error("Invalid product");
        }
        const product = await Product.findById(items.productId).lean();
        if (!product) {
            throw new Error("Product not found");
        }
        const stock = Number(product.productStock ?? 0);
        if (stock < 1) {
            throw new Error("This product is out of stock");
        }

        const cart = await Cart.findOne({ userPhone: phone });
        const existingItemIndex = cart
            ? cart.items.findIndex(
                  (item: productItem) => item.productId.toString() === items.productId
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
            quantity: items.quantity,
            originalPrice: Number(product.originalPrice),
            discountPrice: Number(product.discountPrice ?? 0),
            productName: product.productName,
            images: product.images ?? [],
            productCategory: product.productCategory,
            productCategoryId: String(product.productCategoryId),
            productSubCategory: product.productSubCategory,
            productSubCategoryId: String(product.productSubCategoryId),
            shortDescription: product.shortDescription ?? "",
            longDescription: product.longDescription ?? "",
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


export const handelRemoveItemFromcart = async (phone: string, productId: string) => {
    await connectToDb();
    if (!phone || !productId) {
        throw new Error("Phone number and product ID are required");
    }
    try {
        const cart = await Cart.findOne({ userPhone: phone });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const itemIndex = cart.items.findIndex((item: productItem) => item.productId.toString() === productId);
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

export const chnageCount = async (phone: string, productId: string, quantity: number) => {
    await connectToDb();
    if (!phone || !productId || quantity < 1) {
        throw new Error("Phone number, product ID and valid quantity are required");
    }
    try {
        const product = await Product.findById(productId).lean();
        if (!product) {
            throw new Error("Product not found");
        }
        const stock = Number(product.productStock ?? 0);
        if (stock < 1) {
            throw new Error("This product is out of stock");
        }
        if (quantity > stock) {
            throw new Error(`Only ${stock} unit(s) available`);
        }

        const cart = await Cart.findOne({ userPhone: phone });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const itemIndex = cart.items.findIndex(
            (item: productItem) => item.productId.toString() === productId
        );
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].originalPrice = Number(product.originalPrice);
            cart.items[itemIndex].discountPrice = Number(product.discountPrice ?? 0);
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
