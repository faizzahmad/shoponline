"use client"
import { CustomModal } from "@/components/custom/custom-modal"
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useBannerAdmin } from "../hooks/user-banner";



export const BannerModal = () => {

    const { editModal, closeEditModal, bannerImage, bannerlink, bannerId } = useBannerAdmin();

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
                    {bannerImage && (
                        <Image
                            src={bannerImage}
                            alt="Banner Image"
                            fill
                            className="w-full h-full object-cover"
                        />
                    )}


                    <div className=" absolute left-0  bottom-3 w-full flex justify-center">
                        <Button variant={'outline'} className="flex items-center gap-2 raleway"

                        >
                            Chnage Image
                        </Button>
                    </div>

                </div>

            </div>
        </CustomModal>
    )
}