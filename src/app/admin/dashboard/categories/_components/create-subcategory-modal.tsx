"use client"
import { CustomModal } from "@/components/custom/custom-modal"
import { useCreateSubCategoryModal } from "../hooks/use-subcategory-modal";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Category } from "./catgeoryTable/columns";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { postData, updateDataWithData } from "@/utils/apiCall";
import { useCategory } from "../hooks/use-category";
import { Loader } from "lucide-react";
import { SubCategory } from "./subCategoryTable/columns";
import { useAlertDialog } from "../hooks/user-alert-dialog";
import { isAxiosError } from "axios";

interface CreateSubcategoryModalProps {
    categories: Category[];
    handelGetSubCategories: (id: string) => void;
    subCategories?: SubCategory[];
}

interface SubCategoryPost {
    message: string;
    categoryId: string;
}


export const CreateSubcategoryModal = ({ categories, handelGetSubCategories, subCategories }: CreateSubcategoryModalProps) => {
    const { isOpen, setIsOpen, } = useCreateSubCategoryModal();
    const { subCategoryId, setSubCategoryId } = useAlertDialog();
    const { setCategoryIdforSubcat, categoryIdforSubcat } = useCategory();
    const [isLoading, setIsLoading] = useState(false);
    const [subCategoryData, setSubCategoryData] = useState({
        title: "",
        image: "",
        categoryId: "",
    })

    useEffect(() => {
        if (subCategories && subCategoryId) {
            const subCategory = subCategories.find((subCategory) =>
                subCategory._id === subCategoryId
            )
            if (subCategory) {
                setSubCategoryData({
                    title: subCategory.title,
                    image: subCategory.image,
                    categoryId: categoryIdforSubcat
                });
            }
        }

    }, [subCategoryId])

    const hanelSubCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (subCategoryData.title.trim() === "" || subCategoryData.image === "" || subCategoryData.categoryId === "") {
            toast.error("All fields are required");
            return;
        } else if(subCategoryId){
             setIsLoading(true);
             const subCategoryDataforUpdate = {
                title : subCategoryData.title.trim(),
                image : subCategoryData.image,
                categoryId : subCategoryData.categoryId,
                id : subCategoryId 
             }
            try {
                const response = await updateDataWithData<typeof subCategoryDataforUpdate, SubCategoryPost>('category/sub-category', subCategoryDataforUpdate);
                toast.success(response.message);
                handelGetSubCategories(categoryIdforSubcat);
                setSubCategoryData({
                    title: "",
                    image: "",
                    categoryId: "",
                })
                setIsOpen(false);
                setSubCategoryId("");

            } catch (err) {
                console.log(err);
                const message =
                    isAxiosError(err) && err.response?.data?.error
                        ? String(err.response.data.error)
                        : "Something went wrong";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        }
        else {
            setIsLoading(true);
            try {
                const response = await postData<typeof subCategoryData, SubCategoryPost>('category/sub-category', {
                    ...subCategoryData,
                    title: subCategoryData.title.trim(),
                });
                toast.success(response.message);
                handelGetSubCategories(response.categoryId);
                setCategoryIdforSubcat(response.categoryId);
                setSubCategoryData({
                    title: "",
                    image: "",
                    categoryId: "",
                })
                setIsOpen(false);


            } catch (err) {
                console.log(err);
                const message =
                    isAxiosError(err) && err.response?.data?.error
                        ? String(err.response.data.error)
                        : "Something went wrong";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <CustomModal open={isOpen} onOpenChange={() => {
            setIsOpen(false);
            setSubCategoryId("");
            setSubCategoryData({
                title: "",
                image: "",
                categoryId: "",
            })
        }}>
            <DialogHeader>
                <DialogTitle asChild>
                    <h5 className="text-2xl font-[700]">
                        {
                            subCategoryId === "" ? "Add Sub Category" : "Edit Sub Category"
                        }
                    </h5>
                </DialogTitle>
            </DialogHeader>
            <div className="w-full flex flex-col gap-4">
                {
                    subCategoryData.image ? (
                        <div className="relative w-full h-[250px] border border-dotted mt-4 rounded-lg border-neutral-400 overflow-hidden">
                            <Image src={subCategoryData.image} alt="catImage" layout="fill" objectFit="cover" />
                            <div className=" absolute top-0 left-0 w-full h-full flex items-end justify-center py-4">
                                <Button variant={'outline'} onClick={() => {
                                    setSubCategoryData((prev) => ({
                                        ...prev,
                                        image: ""
                                    }))
                                }}>Change Image</Button>
                            </div>
                        </div>
                    ) : (
                        <UploadDropzone endpoint={"imageUploader"}
                            onClientUploadComplete={(res) => {
                                if (res && res.length > 0) {
                                    setSubCategoryData((prev) => ({
                                        ...prev,
                                        image: res[0].ufsUrl
                                    }))
                                }

                            }}
                            onUploadError={(error: Error) => {
                                toast.error(error.message)
                            }}
                        />
                    )
                }
                <form onSubmit={hanelSubCategory} className="w-full flex flex-col gap-4">
                    <div className="w-full">
                        <Label htmlFor='category'>Select Category</Label>
                        <Select value={subCategoryData.categoryId} onValueChange={(value) => {
                            setSubCategoryData((prev) => ({
                                ...prev,
                                categoryId: value
                            }))
                        }}

                        >
                            <SelectTrigger className="w-full" id="category">
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

                    </div>
                    <div className="w-full">
                        <Label htmlFor='subcategoryName'>SubCategory Name</Label>
                        <Input id="subcategoryName" type="text" value={subCategoryData.title} onChange={(e) => {
                            setSubCategoryData((prev) => ({
                                ...prev,
                                title: e.target.value
                            }))
                        }} />
                    </div>
                    <Button type={"submit"} disabled={isLoading} className="w-full mt-4 flex items-center justify-center gap-2" variant={'default'} >
                        {
                            subCategoryId === "" ? "Add Sub Category" : "Edit Sub Category"
                        }
                        {
                            isLoading && (<Loader className="animate-spin" />)
                        }
                    </Button>
                </form>
            </div>
        </CustomModal>
    )
}