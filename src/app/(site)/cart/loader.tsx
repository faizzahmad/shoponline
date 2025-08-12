import { FullScreenLoader } from "@/components/custom/full-screen-loader";

const CartLoader = () => {
    return (  
        <FullScreenLoader label={
            "Loading your cart items, please wait..."
        } />
    );
}
 
export default CartLoader;