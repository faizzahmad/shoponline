import { FullScreenLoader } from "@/components/custom/full-screen-loader";


const CartLoader = () => {
    return (  
        <FullScreenLoader label={
            "Loading your product please wait..."
        } />
    );
}
 
export default CartLoader;