"use client"
import { Button } from "@/components/ui/button"
import { Loader, Plus } from "lucide-react"
import { useCreateCategoryModal } from "../hooks/use-create-category-modal";
import { CreateCategoryModal } from "./create-category-modal";
import { CategoryDataTable } from "./catgeoryTable/category-table";
import { Category, Categorycolumns } from "./catgeoryTable/columns";
import { useEffect, useState } from "react";
import { deleteData, fetchData } from "@/utils/apiCall";
import { toast } from "sonner";
import { DeleteAlert } from "./delete-alert";
import { useAlertDialog } from "../hooks/user-alert-dialog";

export const CategoriesTab = () => {
    const {open} = useCreateCategoryModal();
    const {categoryId,setIsOpen,setCategoryId} = useAlertDialog();
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const handelGetCategories = async () => {
        setIsCategoryLoading(true);
        try{
            const response = await fetchData('category');
       
           if (response && Array.isArray(response)) {
           setCategories(response as Category[]);
}

        }catch (error) {
            console.log(error);
        }finally{
            setIsCategoryLoading(false);
        }
    }

    useEffect(() => {
        handelGetCategories();
    },[])


    const handelDelete = async () => {
         setIsCategoryLoading(true);
         try{
            const response = await deleteData(`category?id=${categoryId}`);
            if(response){
                toast.success("Category deleted successfully")
                setIsOpen(false);
                setCategoryId('');
                handelGetCategories();
            }

         }catch (error) {
                console.log(error);
                toast.error("failed to delete category")
            }finally{
                setIsCategoryLoading(false);
            }
    }

    return (
        <>
        <CreateCategoryModal handelGetCategories={handelGetCategories}/>
        <DeleteAlert title={"Are you sure you want to delete this category?"} description={
            "This action cannot be undone. This will delete all the subcategories and products under this category."
        } 
        handelDelete={handelDelete}
        />
        <div className=" w-full p-2">
            <div className="w-full flex justify-end">
                <Button variant="outline" className="flex items-center gap-x-2" onClick={open}>
                    <Plus/>
                    Add Category
                </Button>
            </div>
            <div className="mt-4 raleway">
                {
                    isCategoryLoading ? (
                        <div className=" h-[80vh] flex items-center justify-center w-full border rounded-xl text-neutral-400 flex-col gap-3">
                    <Loader className="animate-spin size-8"/>
                    Loading...
                </div>
                    ) : (<CategoryDataTable columns={Categorycolumns} data={categories}/>)
                }
              
            </div>
        </div>
        </>
    )
}