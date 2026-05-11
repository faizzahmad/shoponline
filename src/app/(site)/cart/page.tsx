import type { Metadata } from "next";
import { CartComponent } from "./_components/cart-component";

export const metadata: Metadata = {
    title: "Cart",
    description:
        "Review your bag, apply coupons, and check out securely at Najak Clothing.",
};

const CartPage = async () => {
    return (
        <div>
            <CartComponent />
        </div>
    );
};

export default CartPage;