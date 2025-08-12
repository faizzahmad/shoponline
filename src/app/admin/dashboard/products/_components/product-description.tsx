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
import { useEffect, useState } from "react";
import { fetchData, postData } from "@/utils/apiCall";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { cn } from "@/lib/utils";

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

type GetProductDataprops = {
    _id: string;
    productId: string;
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

interface ProductDescriptionProps {
    allCategory: {
        _id: string;
        title: string;
        image: string;
        createdAt: string;
        updatedAt: string;
        subCategories: {
            _id: string;
            title: string;
            image: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }[];
}

type subCategoryProps = {
    _id: string;
    title: string;
    image: string;
    createdAt: string;
    updatedAt: string;
}
type CatgegoryProps = {
    _id: string;
    title: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    subCategories: subCategoryProps[];
}

type AddProductProps = {
    message: string;
}

export const ProductDescription = () => {

    const { setDescriptionPage } = useProductAdmin();
    const [categories, setCategories] = useState<CatgegoryProps[]>([]);
    const [subCategories, setSubCategories] = useState<subCategoryProps[]>([]);
    const [varientdata, setVarientData] = useState({
        type: '',
        productId: '',
        image: '',
        pname: ''
    })
    const [loader, setLoader] = useState<boolean>(false);
    const [products, setProducts] = useState<GetProductDataprops[]>([]); // Assuming products is an array of objects
    const [productData, setProductData] = useState<ProductData>({
        productName: '',
        images: [],
        productStock: '',
        productCategory: '',
        productCategoryId: '',
        productSubCategory: '',
        productSubCategoryId: '',
        discountPrice: '',
        originalPrice: '',
        shortDescription: '',
        longDescription: '',
        varients: []
    });

    // 'color' or 'size'
    const [colorVarient, setColorVarient] = useState(
        {
            type: 'color',
            products: [] as { value: string; productId: string; pname: string; image: string }[]
        }
    );

    const [sizeVarient, setSizeVarient] = useState(
        {
            type: 'size',
            products: [] as { size: string; productId: string; pname: string; image: string }[]
        }
    );

    const handelGetCategories = async () => {
        try {
            const response = await fetchData<CatgegoryProps[]>('category/allCategory')
            if (response && response.length > 0) {
                setCategories(response);
            }


        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    const handelGetAllProducts = async () => {
        try {
            const response = await fetchData<GetProductDataprops[]>('products');
            if (response && response.length > 0) {
                setProducts(response);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    }

    useEffect(() => {
        handelGetCategories();
        handelGetAllProducts();
    }, [])




    const handelAddProduct = async () => {
        if (!productData.productName || !productData.productStock || !productData.productCategoryId || !productData.productSubCategoryId || !productData.discountPrice || !productData.originalPrice || !productData.shortDescription || !productData.longDescription || productData.images.length === 0) {
            toast.error("Please fill all the fields");
            return;
        } else if (Number(productData.discountPrice) < Number(productData.originalPrice)) {
            toast.error("Discount price should be greater than  original price");
        }
        else {
            setLoader(true);

            const data = {
                productName: productData.productName,
                images: productData.images,
                productStock: productData.productStock,
                productCategory: productData.productCategory,
                productCategoryId: productData.productCategoryId,
                productSubCategory: productData.productSubCategory,
                productSubCategoryId: productData.productSubCategoryId,
                discountPrice: productData.discountPrice,
                originalPrice: productData.originalPrice,
                shortDescription: productData.shortDescription,
                longDescription: productData.longDescription,
                varients: [colorVarient,sizeVarient]
            }
           
            try {
                const response = await postData<typeof data, AddProductProps>('products', data);
                if (response && response.message) {
                    toast.success(response.message);
                }
                setDescriptionPage(false);

            } catch (err) {

                toast.error("Error adding product");
            } finally {
                setLoader(false);

            }

        }

    }


    const handelAddVarient = () => {
        if (!varientdata.type || !varientdata.productId) {
            toast.error("Please select varient type and product");
            return;
        } else {
            if (varientdata.type === 'color') {
                if (!varientdata.image || !varientdata.pname) {
                    toast.error("Please select color varient image and product name");
                    return;
                }
                setColorVarient((prev) => ({
                    ...prev,
                    products: [...prev.products, { value: varientdata.image, productId: varientdata.productId, pname: varientdata.pname, image: varientdata.image }]
                }));
            } else if (varientdata.type === 'size') {
                setSizeVarient((prev) => ({
                    ...prev,
                    products: [...prev.products, { size: varientdata.pname, productId: varientdata.productId, pname: varientdata.pname, image: varientdata.image }]
                }));
            }
            setVarientData({
                type: '',
                productId: '',
                image: '',
                pname: ''
            });
        }
    }


    console.log({sizeVarient});


    return (
        <>
            {
                loader && <FixedLoader />
            }
            <div className="grid grid-cols-1 gap-4">
                <div className="w-full flex raleway">

                    <Button className="text-lg font-semibold hover:no-underline" variant={'link'} onClick={() => {
                        setDescriptionPage(false);
                    }}>
                        <ArrowLeft />  Back to Products
                    </Button>

                    <div className="ms-auto flex gap-4 exo">
                        <Button className="font-[500] text-base" variant={'link'} onClick={handelAddProduct}>
                            Save Changes
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
                                productData.images.map((image, index) => (
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
                                                <Trash className="size-[12px]" />
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
                            <Select value={productData.productCategoryId}
                                onValueChange={(value) => {
                                    // setProductData((prev) => ({ ...prev, productCategory: value }));
                                    const selectedCategory = categories.find(category => category._id === value);
                                    if (selectedCategory) {
                                        setProductData((prev) => ({
                                            ...prev,
                                            productCategoryId: selectedCategory._id,
                                            productCategory: selectedCategory.title,
                                            productSubCategory: '',
                                            productSubCategoryId: ''
                                        }));
                                        setSubCategories(selectedCategory.subCategories);
                                    } else {
                                        setSubCategories([]);
                                    }

                                }}

                            >
                                <SelectTrigger className="w-full" id="productCatgeory">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        categories.map((categoty) => (
                                            <SelectItem key={categoty._id} value={categoty._id}>{categoty.title}</SelectItem>
                                        ))
                                    }

                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full">
                            <Label htmlFor='productSubCatgeory' className="mb-1">Select Sub Category</Label>
                            <Select value={productData.productSubCategoryId}
                                onValueChange={(value) => {
                                    const selectedSubCategory = subCategories.find(subCategory => subCategory._id === value);
                                    if (selectedSubCategory) {
                                        setProductData((prev) => ({
                                            ...prev,
                                            productSubCategoryId: selectedSubCategory._id,
                                            productSubCategory: selectedSubCategory.title
                                        }));
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full" id="productSubCatgeory">
                                    <SelectValue placeholder="Select SubCategory" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        subCategories.map((subCategory) => (
                                            <SelectItem value={subCategory._id} key={subCategory._id}>{subCategory.title}</SelectItem>
                                        ))
                                    }

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

                    <div className="flex gap-3">
                        {
                            colorVarient.products.map((varient) => (
                                <Button variant={'outline'} key={varient.productId} className=" relative"
                                    onClick={() => {
                                        setColorVarient((prev) => ({
                                            ...prev,
                                            products: prev.products.filter((v) => v.productId !== varient.productId)
                                        }));
                                    }}
                                >
                                    {varient.pname}
                                    <Trash size={2} />
                                </Button>
                            ))
                        }

                        {
                            sizeVarient.products.map((varient) => (
                                <Button variant={'outline'} key={varient.productId} className=" relative"
                                    onClick={() => {
                                        setSizeVarient((prev) => ({
                                            ...prev,
                                            products: prev.products.filter((v) => v.productId !== varient.productId)
                                        }));
                                    }}
                                >
                                    {varient.size}
                                    <Trash size={2} />
                                </Button>
                            ))
                        }
                    </div>
                    <div className="flex gap-5 mt-5 items-end">
                        <div className="w-[200px]">
                            <Label htmlFor='varientType' className="mb-1">Select Varient Type</Label>
                            <Select value={varientdata.type}
                                required
                                onValueChange={(value) => {
                                    setVarientData((prev) => ({ ...prev, type: value }));
                                }
                                }
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
                            <Select required value={varientdata.productId} onValueChange={(value) => {
                                const selectedProduct = products.find(product => product._id === value);
                                if (selectedProduct) {
                                    setVarientData((prev) => ({
                                        ...prev,
                                        productId: selectedProduct._id,
                                        image: selectedProduct.images[0] || '',
                                        pname: selectedProduct.productName
                                    }));
                                }
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Products" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        products.map((product) => (
                                            <SelectItem

                                                className={cn(
  (colorVarient.products.some(p => p.productId === product._id) ||
   sizeVarient.products.some(p => p.productId === product._id)) && 'hidden'
)}
                                                key={product._id} value={product._id}>{product.productName} {product.originalPrice}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[200px]">
                            <Button type='submit' className="w-full" onClick={handelAddVarient}>
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
        </>
    )
}