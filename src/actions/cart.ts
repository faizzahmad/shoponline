"use server";
import Cart from "@/lib/models/cart-model";
import { connectToDb } from "@/lib/connectToDb";
import { revalidatePath } from "next/cache";

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

export const AddtoCart = async (phone : string, items : productItem ) => {
    await connectToDb();
    if(!phone) {
        throw new Error("Phone number and product ID are required");
    }
    try {
        const cart = await Cart.findOne({ userPhone: phone });
        if(!cart){
            const newCart = new Cart({ userPhone: phone, items: [items] });
            await newCart.save();
            revalidatePath("/cart");
            revalidatePath("/")
            return {
                message: "Cart created and item added successfully",
            }


        }else {
            const existingItemIndex = cart.items.findIndex((item: productItem) => item.productId.toString() === items.productId);
            if(existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += items.quantity;
            } else {
                cart.items.push(items);

            }
            await cart.save();
            revalidatePath("/cart");
            revalidatePath("/")
            return {
                message: "Item added to cart successfully",
            }
        }


    }catch(err) {
        console.error("Error adding to cart:", err);
        throw new Error("Error adding to cart");
    }
}


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
        const cart = await Cart.findOne({ userPhone: phone });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const itemIndex = cart.items.findIndex((item: productItem) => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
        } else {
            throw new Error("Item not found in cart");
        }
    } catch (err) {
        console.error("Error changing item count:", err);
        throw new Error("Error changing item count");
    }
}
