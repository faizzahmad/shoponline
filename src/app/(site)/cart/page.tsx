import type { Metadata } from "next";
import { CartComponent } from "./_components/cart-component";
import { NOINDEX_METADATA } from "@/lib/site-metadata";

export const metadata: Metadata = {
    title: "Cart",
    description:
        "Review your bag, apply coupons, and check out securely at Najak Clothing.",
    ...NOINDEX_METADATA,
};

const CartPage = async () => {
    return (
        <div>
            <CartComponent />
        </div>
    );
};

export default CartPage;