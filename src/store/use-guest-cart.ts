"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GuestCartItem = {
    productId: string;
    variantId?: string;
    variantAttributes?: Array<{ name: string; value: string }>;
    variantImage?: string;
    quantity: number;
    /** Server still re-validates these on order submit */
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
    /** Shipping dimensions (cm) — refreshed by /api/cart/preview */
    length?: number;
    breadth?: number;
    height?: number;
    /** Shipping weight in grams */
    weight?: number;
    /** Refreshed on sync; used for stock messaging in cart UI */
    availableStock?: number;
};

type GuestCartState = {
    items: GuestCartItem[];
    addItem: (item: GuestCartItem, opts?: { mergeQuantity?: boolean }) => void;
    setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
    removeItem: (productId: string, variantId?: string) => void;
    clear: () => void;
    /** Replace local state with server payload (used after sign-in merge). */
    replaceAll: (items: GuestCartItem[]) => void;
};

const sameLine = (a: GuestCartItem, b: { productId: string; variantId?: string }) =>
    a.productId === b.productId && (a.variantId ?? "") === (b.variantId ?? "");

export const useGuestCart = create<GuestCartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (item, opts) =>
                set((state) => {
                    const idx = state.items.findIndex((it) => sameLine(it, item));
                    if (idx === -1) {
                        return { items: [...state.items, item] };
                    }
                    const merged = [...state.items];
                    if (opts?.mergeQuantity === false) {
                        merged[idx] = { ...merged[idx], ...item };
                    } else {
                        const cap = Math.min(
                            10,
                            item.availableStock ?? merged[idx].availableStock ?? Infinity
                        );
                        const nextQty = Math.min(
                            cap,
                            (merged[idx].quantity || 0) + (item.quantity || 1)
                        );
                        merged[idx] = { ...merged[idx], ...item, quantity: nextQty };
                    }
                    return { items: merged };
                }),
            setQuantity: (productId, variantId, quantity) =>
                set((state) => ({
                    items: state.items.map((it) =>
                        sameLine(it, { productId, variantId })
                            ? { ...it, quantity: Math.max(1, Math.floor(quantity)) }
                            : it
                    ),
                })),
            removeItem: (productId, variantId) =>
                set((state) => ({
                    items: state.items.filter(
                        (it) => !sameLine(it, { productId, variantId })
                    ),
                })),
            clear: () => set({ items: [] }),
            replaceAll: (items) => set({ items }),
        }),
        {
            name: "giftbox-guest-cart",
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
);
