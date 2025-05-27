import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import { useProductAdmin } from "../hooks/use-product-admin";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";

type ProductData = {
    productName: string;
    images: string[];
    productStock: string;
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    discountPrice: string;
    originalPrice: string;
    shortDescription: string;
    longDescription: string;
    varients: any[]; 
};

export const EditProduct = () => {
    const {setDescriptionPage} = useProductAdmin();
    const [productData, setProductData] = useState<ProductData>({
        productName: '',
        images : [],
        productStock: '',
        productCategory: '',
        productCategoryId: '',
        productSubCategory: '',
        productSubCategoryId: '',
        discountPrice: '',
        originalPrice: '',
        shortDescription: '',
        longDescription: '',
        varients : []
    })
const [colorVarient, setColorVarient] = useState(
    {
        type: 'color',
        products: [] as { value: string; productId: string; image : string }[]
    }
);

const [sizeVarient, setSizeVarient] = useState(
    {
        type: 'size',
        products: [] as { size: string; productId: string; image : string }[]
    }
);


    return (
        <div className="grid grid-cols-1 gap-4">
           <div className="w-full flex raleway">
               
                <Button className="text-lg font-semibold hover:no-underline"  variant={'link'} onClick={() => {
                    setDescriptionPage(false);
                }}>
                 <ArrowLeft  />  Back to Products
                </Button>

                <div className="ms-auto flex gap-4 exo">
                      <Button className="font-[500] text-base"  variant={'link'} >
                 Save Changes
                </Button>

                  <Button className="font-[500] text-base"  variant={'link'} >
                 Delete
                </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg border p-5">
                <h5 className="mb-4 text-2xl font-semibold raleway">
                   Product Images 
                </h5>
                <div className=" flex gap-8 items-center">
                
                <div className="w-[350px]">
                    <UploadDropzone endpoint={"imageUploader"}
                                    onClientUploadComplete={(res) => {
                                        if (res && res.length > 0) {
                                           console.log(res[0].ufsUrl)
                                           setProductData((prev) => ({
                                               ...prev,
                                               images: [...prev.images, res[0].ufsUrl]
                                           }))
                                        }

                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(error.message)
                                    }}
                                />
                </div>
                <div className="flex-shrink-1 flex gap-4 flex-wrap">
               
                {
                    productData.images.map((image,index) => (
                         <div className="size-24 relative rounded-lg" key={index}>
                    <Image src={image} alt="partyImage" 
                    fill
                    objectFit="cover"
                    className="h-full w-full rounded-lg"
                    />
                    <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
                        <button type="button" className="p-1 bg-rose-600 text-white rounded-full"
                        onClick={() => {
                            setProductData((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                            }));
                        }}
                        >
                              <Trash className="size-[12px]"/>
                        </button>

                    </div>
                 </div>
                    ))
                }
                </div>
            </div>
            </div>

            <div className="bg-white rounded-lg border p-5 pb-10 raleway">
                 <h5 className="mb-4 text-2xl font-semibold ">
                   Product Info
                </h5>
                <div className="grid grid-cols-2 gap-5">
                <div className="w-full">
                  <Label htmlFor='productName' className="mb-1">Product Name</Label>
                        <Input id="productName" type="text" value={productData.productName}
                        onChange={(e) => setProductData((prev) => ({ ...prev, productName: e.target.value }))}
                        />
                </div>

                <div className="w-full">
                  <Label htmlFor='productStock' className="mb-1">Product Stock</Label>
                        <Input id="productStock" type="number" 
                        value={productData.productStock}
                        onChange={(e) => setProductData((prev) => ({ ...prev, productStock: e.target.value }))}
                        />
                </div>

                 <div className="w-full">
                  <Label htmlFor='productCatgeory' className="mb-1">Select Product Category</Label>
                                               <Select value={productData.productCategory}
                                               onValueChange={(value) => setProductData((prev) => ({ ...prev, productCategory: value }))}
                        >
                            <SelectTrigger className="w-full" id="productCatgeory">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ballon">Baloons</SelectItem>

                            </SelectContent>
                        </Select>
                </div>

                 <div className="w-full">
                  <Label htmlFor='productSubCatgeory' className="mb-1">Select Sub Category</Label>
                                               <Select value={productData.productSubCategory}
                                               onValueChange={(value) => setProductData((prev) => ({ ...prev, productSubCategory: value }))}
                                               >
                            <SelectTrigger className="w-full" id="productSubCatgeory">
                                <SelectValue placeholder="Select SubCategory" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ballon">Baloons</SelectItem>

                            </SelectContent>
                        </Select>
                </div>


                </div>
            </div>

              <div className="bg-white rounded-lg border p-5 pb-10 raleway">
                 <h5 className="mb-4 text-2xl font-semibold ">
                   Product Pricing
                </h5>
                <div className="grid grid-cols-2 gap-5">

            
                <div className="w-full">
                  <Label htmlFor='discountprice' className="mb-1">Discount Price</Label>
                        <Input id="discountprice" type="number" 
                        value={productData.discountPrice}
                        onChange={(e) => setProductData((prev) => ({ ...prev, discountPrice: e.target.value }))}
                        />
                </div>

                <div className="w-full">
                  <Label htmlFor='productprice' className="mb-1">Original Price</Label>
                        <Input id="productprice" type="number" value={productData.originalPrice}
                        onChange={(e) => setProductData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                        />
                </div>
            
                </div>
            </div>

            <div className="bg-white rounded-lg border p-5 pb-10 raleway">
                 <h5 className="mb-4 text-2xl font-semibold ">
                   Product Varients
                </h5>

                <Button variant={'outline'}> 
                    Add New Varient
                </Button>
                <div className="flex gap-5 mt-5 items-end">
                <div className="w-[200px]">
                  <Label htmlFor='varientType' className="mb-1">Select Varient Type</Label>
                                               <Select value={productData.varients[0]?.type || ''}
                                               onValueChange={(value) => {
                                                if(value === 'color'){
                                                    setProductData((prev) => ({
                                                        ...prev,
                                                        varients: [...prev.varients, { type: value, products: [] }]
                                                    }));
                                                }
                                               }}
                        >
                            <SelectTrigger className="w-full" id="varientType">
                                <SelectValue placeholder="Select Varient Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="color">Color</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            </SelectContent>
                        </Select>
                </div>


                  <div className="w-[400px]">
                  <Label className="mb-1">Select Product</Label>
                                               <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Products" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="color">
                                  
                                    Balloons</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            </SelectContent>
                        </Select>
                </div>
               
               <div className="w-[200px]">
                <Button className="w-full" type="button">
                    Add Varient
                </Button>
               </div>
            
                </div>
            </div>


             <div className="bg-white rounded-lg border p-5 pb-10 raleway">
                 <h5 className="mb-4 text-2xl font-semibold ">
                   Product Description
                </h5>
                <div className="grid grid-cols-1 gap-1">
                    <Label htmlFor='shortDescription' className="mb-1">Short Description</Label>
                    <Textarea id="shortDescription" placeholder="Short Description" className="h-[100px]"
                    value={productData.shortDescription}
                    onChange={(e) => setProductData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    />
                </div>

                <div className="grid grid-cols-1 gap-1 mt-10">
                    <Label htmlFor='longDescription' className="mb-1">Long Description</Label>
                    <Textarea id="longDescription" placeholder="Long Description" className="h-[200px]"
                        value={productData.longDescription}
                        onChange={(e) => setProductData((prev) => ({ ...prev, longDescription: e.target.value }))}
                    />
                </div>
            </div>
        </div>
    )
}