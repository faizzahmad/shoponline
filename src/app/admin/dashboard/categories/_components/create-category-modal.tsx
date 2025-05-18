"use client"
import { CustomModal } from "@/components/custom/custom-modal"
import { useCreateCategoryModal } from "../hooks/use-create-category-modal";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { UploadDropzone } from "@/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { postData } from "@/utils/apiCall";
interface CreateCategoryModalProps {
    handelGetCategories: () => void;
}
export const CreateCategoryModal = ({handelGetCategories} : CreateCategoryModalProps) => {
    const { isOpen, setIsOpen, close } = useCreateCategoryModal();
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [loader,setLoader] = useState(false);
    const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!uploadedImageUrl) {
            toast.error("Please upload an image")
            return;
        }else if (!categoryName) {
            toast.error("Please enter a category name")
            return;
        }else{
            setLoader(true);
            try{
                const response = await postData('category',{
                    title : categoryName,
                    image : uploadedImageUrl,
                    subCategories : [{}]
                } )
                if(response){
                    toast.success("Category created successfully")
                    setUploadedImageUrl("");
                    setCategoryName("");
                    handelGetCategories();
                    close();
                }

            }catch (error) {
                toast.error("Something went wrong")
            }finally{
                setLoader(false);
                
            }

        }
        
    }
    return (
        <CustomModal open={isOpen} onOpenChange={setIsOpen}>
            <DialogHeader>
                <DialogTitle asChild>
                    <h5 className="text-2xl font-[700]">Create Category</h5>
                </DialogTitle>
            </DialogHeader>
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
                    }}/>
                    <Button type={"submit"} className="w-full mt-4 flex items-center justify-center gap-2" variant={'default'} disabled={loader}>Create Category {
                       loader && ( <Loader className="animate-spin"/>)
                        }</Button>
                </form>

            </div>
        </CustomModal>
    )
}