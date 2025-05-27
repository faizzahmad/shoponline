"use client";

import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SubCategoryDataTable } from "./subCategoryTable/sub-category-table";
import { SubCategory, SubCategorycolumns } from "./subCategoryTable/columns";
import { useEffect, useState } from "react";
import { deleteData, fetchData } from "@/utils/apiCall";
import { Category } from "./catgeoryTable/columns";
import { useCategory } from "../hooks/use-category";
import { useCreateSubCategoryModal } from "../hooks/use-subcategory-modal";
import { CreateSubcategoryModal } from "./create-subcategory-modal";
import { DeleteAlert } from "./delete-alert";
import { toast } from "sonner";
import { useAlertDialog } from "../hooks/user-alert-dialog";

interface CategoryProps {
    _id: string;
    title: string;
    image: string;
    createdAt: string;
}

interface SubCategoryProps {
    _id: string;
    subCategories: SubCategory[];
}

interface DeleteCategoryProps {
    message: string;
}

export const SubCategoryTab = () => {
    const { open } = useCreateSubCategoryModal();
    const { subCategoryId, setSubCategoryId, setIsOpenAlert } = useAlertDialog();
    const { categoryIdforSubcat, setCategoryIdforSubcat } = useCategory();
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loader, setLoader] = useState(false);
    const handelGetAllCategories = async () => {
        try {
            const response = await fetchData<CategoryProps>('category');

            if (response && Array.isArray(response)) {
                setCategories(response as Category[]);
            }

        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        handelGetAllCategories();
        setCategoryIdforSubcat('');
    }, [])


    const handelGetSubCategories = async (id: string) => {
        setLoader(true);
        try {
            const response = await fetchData<SubCategoryProps>(`category/sub-category?id=${id}`);
            if (response && Array.isArray(response.subCategories)) {
                setSubCategories(response.subCategories as SubCategory[]);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoader(false);
        }
    }


    const handelDelete = async () => {
        setLoader(true);
        try {
            const response = await deleteData<DeleteCategoryProps>(`category/sub-category?id=${subCategoryId}`);
            if (response) {
                toast.success("SubCategory deleted successfully")
                setIsOpenAlert(false);
                setSubCategoryId("");
                handelGetSubCategories(categoryIdforSubcat);

            }

        } catch (error) {
            console.log(error);
            toast.error("failed to delete category")
        } finally {
            setLoader(false);
        }
    }


    return (
        <>
            <CreateSubcategoryModal categories={categories} handelGetSubCategories={handelGetSubCategories} subCategories={subCategories} />
            <DeleteAlert title={"Are you sure you want to delete this SubCategory?"} description={
                "This action cannot be undone. This will the subcategory and all the products under this subcategory."
            }
                handelDelete={handelDelete}
            />
            <div className="w-full">
                <div className="w-full flex justify-end gap-5">
                    <Select value={categoryIdforSubcat} onValueChange={(value) => {
                        setCategoryIdforSubcat(value);
                        handelGetSubCategories(value);
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                categories.map((categories) => (
                                    <SelectItem key={categories._id} value={categories._id}>{categories.title}</SelectItem>
                                ))
                            }

                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="flex items-center gap-x-2" onClick={open}>
                        <Plus />
                        Add Sub-category
                    </Button>
                </div>

                <div className="w-full mt-5">
                    {
                        loader ? (
                            <div className=" h-[80vh] flex items-center justify-center w-full border rounded-xl text-neutral-400 flex-col gap-3">
                                <Loader className="animate-spin size-8" />
                                Loading...
                            </div>
                        ) : (<SubCategoryDataTable columns={SubCategorycolumns} data={subCategories} />)
                    }

                </div>
            </div>
        </>
    )
}