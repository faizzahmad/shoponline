"use client"
import { CustomModal } from "@/components/custom/custom-modal"
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useBannerAdmin } from "../hooks/user-banner";
import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import { updateDataWithData } from "@/utils/apiCall";

interface BannerModalProps {
    handelGetData : () => void;
}

type UpdateProps = {
    message: string;
}

export const BannerModal = ({handelGetData} : BannerModalProps) => {
    const { editModal, closeEditModal, bannerImage, bannerlink, bannerId,setBannerImage,setBannerLink } = useBannerAdmin();
    const [isLoading, setIsLoading] = useState(false);
    const [isChnageImage, setIsChangeImage] = useState(false);


    const handelUpdate =  async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       if(bannerImage === '' || bannerlink === ''){
            toast.error("Please fill all fields");
            return;
        }
       else{
         setIsLoading(true);
        const data = {
            id: bannerId,
            link: bannerlink,
            image: bannerImage
        }
        try{
       const response = await updateDataWithData<typeof data, UpdateProps>('banner',data);
        if(response && response.message){
            toast.success(response.message);
            handelGetData();    
        }

        }catch(err) {
            console.log(err);
            toast.error("Something went wrong");
        }finally{
            setIsLoading(false);
            closeEditModal();
        }
       }
    }

    return (
        <CustomModal open={editModal} onOpenChange={() => closeEditModal()}>
            <DialogHeader>
                <DialogTitle asChild>
                    <h5 className="text-2xl font-[700]">
                        Edit Banner
                    </h5>
                </DialogTitle>
            </DialogHeader>
            <div className="w-full flex flex-col gap-4">
                <div className="w-full h-[300px] relative overflow-x-hidden rounded-lg">
                    {bannerImage && !isChnageImage && (
                        <Image
                            src={bannerImage}
                            alt="Banner Image"
                            fill
                            className="w-full h-full object-cover"
                        />
                    )}

{
    isChnageImage && (
         <UploadDropzone endpoint={"imageUploader"}
                                            onClientUploadComplete={(res) => {
                                                if (res && res.length > 0) {
                                                    setBannerImage(res[0].ufsUrl);
                                                    setIsChangeImage(false);
                                                }
        
                                            }}
                                            onUploadError={(error: Error) => {
                                                toast.error(error.message)
                                            }}
                                        />
    )
}

                   {
                    !isChnageImage && (
                         <div className=" absolute left-0  bottom-3 w-full flex justify-center">
                        <Button variant={'outline'} className="flex items-center gap-2 raleway"
                            onClick={() => setIsChangeImage(!isChnageImage)}
                        >
                            Chnage Image
                        </Button>
                    </div>
                    )
                   }

                </div>


            <form onSubmit={handelUpdate}>
                <Label className="text-sm font-semibold">
                    Banner Link 
                </Label>
                <Input
                    type="text"
                    placeholder="Enter Banner Link"
                    value={bannerlink}
                    className="w-full mt-2" 
                    onChange={(e) => {
                        
                        setBannerLink(e.target.value)
                    }
                    }
                />

                <Button className="mt-4 w-full flex items-center justify-center" type="submit" disabled={isLoading}>
                    Update Banner
                        {
                            isLoading && <Loader className="animate-spin"/>
                        }
                        
                </Button>
            </form>
            </div>
        </CustomModal>
    )
}