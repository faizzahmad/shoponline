"use client";
import { Button } from "@/components/ui/button"
import { Loader, Plus } from "lucide-react"
import { useProductAdmin } from "../hooks/use-product-admin";
import { Product,Productcolumns } from "./columns";
import { useEffect, useState } from "react";
import { deleteData, fetchData } from "@/utils/apiCall";
import { ProductDataTable } from "./product-table";
import { DeleteAlert } from "./delete-alert";
import { useProductDialog } from "../hooks/use-product-alert";
import { toast } from "sonner";

type DeleteProductProps = {
    message: string;
}

export const ShowProductData = () => {
       const { setDescriptionPage, setEditProductId } = useProductAdmin();
       const { setIsOpenAlert,productId } = useProductDialog();
       const [isLoading, setIsLoading] = useState(false);
         const [products, setProducts] = useState<Product[]>([]);

         const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await fetchData<Product[]>('products');
                if (response && Array.isArray(response)) {
                    setProducts(response as Product[]);
                } else {
                    console.error("Unexpected response format:", response);
                }

            }catch (error) {
                console.error("Error fetching products:", error);
            }finally{
                setIsLoading(false);
            }
         }
            

         useEffect(() => {
            fetchProducts();
            }, []);

            const handelDelete = async () => {
                setIsLoading(true);
                try {
                    const response = await deleteData<DeleteProductProps>(`products?id=${productId}`);
                    if (response) {
                        toast.success("Product deleted successfully");
                        setIsOpenAlert(false);
                        fetchProducts();
                    }
                } catch (error) {
                    toast.error("Failed to delete product");
                    console.error("Error deleting product:", error);
                } finally {
                    setIsLoading(false);
                }

            }

    return (
       <>
       <DeleteAlert handelDelete={handelDelete}
        description="Are you sure you want to delete this product?"
        title="Delete Product"
        />
        <div className="w-full">
                <div className="w-full flex exo">
                <h1 className="text-2xl font-bold">Products</h1>
                <Button className="ms-auto" variant={'outline'} onClick={() => {
                    setEditProductId(null);
                    setDescriptionPage(true);
                }}>
                 <Plus/>   Add New Product
                </Button>
            </div>

         {
            isLoading ? (   <div className="mt-10 w-full h-[600px] flex items-center justify-center flex-col exo gap-2 border rounded-lg">
                <Loader className="animate-spin"/>
                Loading...
            </div>) : (
                <ProductDataTable columns={Productcolumns} data={products} />
            )
         }
            </div>
       </>
    )
}