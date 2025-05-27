"use client";
import { useProductAdmin } from "../hooks/use-product-admin"
import { ProductDescription } from "./product-description";
import { ShowProductData } from "./show-product-data";



export const ProductHome = () => {
    const {descriptionPage} = useProductAdmin();
     return(
        <div>
            {
                descriptionPage ? (<ProductDescription/>) : (<ShowProductData/>)
            }
        </div>
    )
}