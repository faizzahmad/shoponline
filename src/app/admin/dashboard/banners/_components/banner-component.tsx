"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fetchData } from "@/utils/apiCall";
import Image from "next/image";
import { useEffect, useState } from "react"
import { useBannerAdmin } from "../hooks/user-banner";
import { BannerModal } from "./banner-modal";


type Banner = {
    _id: string;
    type: string;
    link: string;
    image: string;
    createdAt: string;
    updatedAt: string;
}

export const BannerComponent = () => {
    const {openEditModal} = useBannerAdmin();
    const [bannerData,setBannerData] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const handelFetchDetails = async () => {
        setIsLoading(true);
        try{
            const response = await fetchData<Banner>('banner');
            if(response && Array.isArray(response)){
                setBannerData(response as Banner[]);
            }else{
                console.error("Unexpected response format:", response);
            }
            
        }catch (err){
            console.log(err);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
handelFetchDetails();
    },[])

return(
   <>
   <BannerModal/>
    <div className="w-full h-full p-5">
    <h5 className="text-2xl font-semibold exo">Banners</h5>
    <div className="w-full grid mt-10 grid-cols-3 gap-8">
       {
        bannerData.map((banner) => (
             <div className={cn("w-full", banner.type === 'bottom' && 'hidden')} key={banner._id}>
            <div className="w-full h-[300px] relative rounded-lg overflow-hidden">
                <Image src={banner.image} alt={`${banner._id}Image`} fill className="w-full h-full object-cover"/>
                <div className=" absolute left-0  bottom-3 w-full flex justify-center">
                <Button variant={'outline'} className="flex items-center gap-2 raleway"
                onClick={() => openEditModal(banner._id, banner.image, banner.link)}
                >
                    Edit image or link
                </Button>
                </div>
            </div>

            <div className="mt-4 w-full raleway">
                <Label className="text-sm font-semibold ml-2">Link</Label>
                <Input type="text" disabled value={banner.link}/>
                 
            </div>
        </div>
        ))
       }
    </div>

    <div className="mt-10">
         {
        bannerData.map((banner) => (
             <div className={cn("w-full", banner.type === 'top' && 'hidden')} key={banner._id}>
            <div className="w-full h-[300px] relative rounded-lg overflow-hidden">
                <Image src={banner.image} alt={`${banner._id}Image`} fill className="w-full h-full object-cover"/>
                <div className=" absolute left-0  bottom-3 w-full flex justify-center">
                <Button variant={'outline'} className="flex items-center gap-2 raleway" onClick={() => openEditModal(banner._id, banner.image, banner.link)}>
                    Edit image or link
                </Button>
                </div>
            </div>

            <div className="mt-4 w-full raleway">
                <Label className="text-sm font-semibold ml-2">Link</Label>
                <Input type="text" disabled value={banner.link}/>
                 
            </div>
        </div>
        ))
       }
    </div>
    </div>
   </>
)
}