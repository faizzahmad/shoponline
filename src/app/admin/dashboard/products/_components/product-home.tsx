"use client";
import { useProductAdmin } from "../hooks/use-product-admin"
import { ProductDescription } from "./product-description";
import { ShowProductData } from "./show-product-data";



export const ProductHome = () => {
    const { descriptionPage, editProductId } = useProductAdmin();
    const showForm = descriptionPage || !!editProductId;
    return (
        <div>
            {showForm ? <ProductDescription /> : <ShowProductData />}
        </div>
    );
};