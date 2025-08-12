import { currentUser } from "@clerk/nextjs/server";
import { CartComponent } from "./_components/cart-component";
import { redirect } from "next/navigation";
const CartPage = async () => {
    const user = await currentUser()
  if (!user) redirect(`/login?redirect_url=${encodeURIComponent("/cart")}`);

    return (
        <div>
            <CartComponent />
        </div>
    );
}

export default CartPage;