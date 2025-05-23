"use client"
import { CustomModal } from "@/components/custom/custom-modal"
import { useCreateCategoryModal } from "../hooks/use-create-category-modal";
import { DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { UploadDropzone } from "@/utils/uploadthing";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { postData, updateDataWithData } from "@/utils/apiCall";
import { useAlertDialog } from "../hooks/user-alert-dialog";

interface CreateCategoryModalProps {
    handelGetCategories: () => void;
}
interface ApiCategoryProps {
    message : string;
}


export const CreateCategoryModal = ({ handelGetCategories }: CreateCategoryModalProps) => {
    const { isOpen, setIsOpen, close } = useCreateCategoryModal();
    const { setCategoryId, categoryId } = useAlertDialog();
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [loader, setLoader] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!categoryId || !isOpen) return;

        startTransition(() => {
            fetch(`/api/category/${categoryId}`)
                .then((res) => res.json())
                .then((data) => {
                    setCategoryName(data.title);
                    setUploadedImageUrl(data.image)
                })
                .catch((err) => console.error(err));
        });
    }, [categoryId, isOpen]);


    const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!uploadedImageUrl) {
            toast.error("Please upload an image")
            return;
        } else if (!categoryName) {
            toast.error("Please enter a category name")
            return;
        } else if (!categoryId || !isOpen) {
            setLoader(true);
            const data = {
                 title: categoryName,
                    image: uploadedImageUrl,
                    subCategories: [{}]
            }
            try {
                const response = await postData<typeof data, ApiCategoryProps>('category', data)
                if (response) {
                    toast.success("Category created successfully")
                    setUploadedImageUrl("");
                    setCategoryName("");
                    handelGetCategories();
                    close();
                }

            } catch (error) {
                toast.error("Something went wrong")
                console.log(error);
            } finally {
                setLoader(false);

            }

        } else {
            setLoader(true);
            try {
                const data  = {
                    title: categoryName,
                    image: uploadedImageUrl,
                    
                }
                const response = await updateDataWithData<typeof data, ApiCategoryProps>(`category?id=${categoryId}`,data )
                if (response) {
                    toast.success("Category updated successfully")
                    setUploadedImageUrl("");
                    setCategoryName("");
                    setCategoryId('');
                    handelGetCategories();
                    close();
                }

            } catch (error) {
                toast.error("Something went wrong")
                console.log(error);
            } finally {
                setLoader(false);

            }
        }

    }
    return (
        <CustomModal open={isOpen} onOpenChange={() => {
            setIsOpen(false);
            setCategoryId('');
        }}>
            <DialogHeader>
                <DialogTitle asChild>
                    <h5 className="text-2xl font-[700]">
                        {
                            !categoryId || !isOpen ? "Create Category" : "Edit Category"
                        } </h5>
                </DialogTitle>
            </DialogHeader>
            {
                isPending ? (<div className="h-72 flex border rounded-lg items-center justify-center text-neutral-600 flex-col gap-2 exo">
                    <Loader className="size-4 animate-spin" />
                    <span className="text-xs">Loading..</span>
                </div>

                ) : (
                    <div className="w-full flex flex-col">

                        {
                            uploadedImageUrl ? (
                                <div className="relative w-full h-[250px] border border-dotted mt-4 rounded-lg border-neutral-400 overflow-hidden">
                                    <Image src={uploadedImageUrl} alt="catImage" layout="fill" objectFit="cover" />
                                    <div className=" absolute top-0 left-0 w-full h-full flex items-end justify-center py-4">
                                        <Button variant={'outline'} onClick={() => {
                                            setUploadedImageUrl("")
                                        }}>Change Image</Button>
                                    </div>
                                </div>
                            ) : (
                                <UploadDropzone endpoint={"imageUploader"}
                                    onClientUploadComplete={(res) => {
                                        if (res && res.length > 0) {
                                            setUploadedImageUrl(res[0].ufsUrl)
                                        }

                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(error.message)
                                    }}
                                />
                            )
                        }


                        <form onSubmit={handelSubmit} className="mt-10 flex flex-col gap-y-4">
                            <Label htmlFor='categoryName'>Category Name</Label>
                            <Input id="categoryName" type="text" value={categoryName} onChange={(e) => {
                                setCategoryName(e.target.value)
                            }} />
                            <Button type={"submit"} className="w-full mt-4 flex items-center justify-center gap-2" variant={'default'} disabled={loader}>
                                {
                                    !categoryId || !isOpen ? "Create Category" : "Update Category"
                                }
                                {
                                    loader && (<Loader className="animate-spin" />)
                                }</Button>
                        </form>

                    </div>
                )
            }
        </CustomModal>
    )
}


