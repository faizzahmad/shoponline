
import { ProductHome } from "./_components/product-home";
import { Suspense } from "react";

const DashboardProducts = async() => {
   
    return (
        <div className="w-full p-5 bg-gray-50">
            <Suspense fallback={<p>Loading products...</p>}>
            <ProductHome/>
            </Suspense>
        </div>
      );
}
 
export default DashboardProducts;