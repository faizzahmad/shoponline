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
import { fetchData, postData, updateDataWithData } from "@/utils/apiCall";
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
    variantAttributes?: Array<{ name: string; options: string[] }>;
    variantCombinations?: Array<{
        variantId: string;
        attributes: Array<{ name: string; value: string }>;
        image?: string;
        productStock: number;
        originalPrice: number;
        discountPrice: number;
        isDefault?: boolean;
    }>;
    length: string;
    breadth: string;
    height: string;
    weight: string;
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
    variantAttributes?: Array<{ name: string; options: string[] }>;
    variantCombinations?: Array<{
        variantId: string;
        attributes: Array<{ name: string; value: string }>;
        image?: string;
        productStock: number;
        originalPrice: number;
        discountPrice: number;
        isDefault?: boolean;
    }>;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
};

type VariantRow = {
    variantId: string;
    color: string;
    size: string;
    image: string;
    productStock: string;
    originalPrice: string;
    discountPrice: string;
    isDefault: boolean;
};

// interface ProductDescriptionProps {
//     allCategory: {
//         _id: string;
//         title: string;
//         image: string;
//         createdAt: string;
//         updatedAt: string;
//         subCategories: {
//             _id: string;
//             title: string;
//             image: string;
//             createdAt: string;
//             updatedAt: string;
//         }[];
//     }[];
// }

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
};

const emptyProductData = (): ProductData => ({
    productName: "",
    images: [],
    productStock: "",
    productCategory: "",
    productCategoryId: "",
    productSubCategory: "",
    productSubCategoryId: "",
    discountPrice: "",
    originalPrice: "",
    shortDescription: "",
    longDescription: "",
    varients: [],
    variantAttributes: [],
    variantCombinations: [],
    length: "",
    breadth: "",
    height: "",
    weight: "",
});

export const ProductDescription = () => {

    const { descriptionPage, setDescriptionPage, editProductId, setEditProductId } = useProductAdmin();
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
    const [productData, setProductData] = useState<ProductData>(emptyProductData());
    const [colorOptionsInput, setColorOptionsInput] = useState("");
    const [sizeOptionsInput, setSizeOptionsInput] = useState("");
    const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

    const parseOptions = (value: string): string[] =>
        value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

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
    }, []);

    useEffect(() => {
        if (editProductId) return;
        if (!descriptionPage) return;
        setProductData(emptyProductData());
        setColorVarient({ type: "color", products: [] });
        setSizeVarient({ type: "size", products: [] });
        setColorOptionsInput("");
        setSizeOptionsInput("");
        setVariantRows([]);
        setSubCategories([]);
    }, [descriptionPage, editProductId]);

    useEffect(() => {
        if (!editProductId) return;

        let cancelled = false;
        (async () => {
            setLoader(true);
            try {
                const p = await fetchData<GetProductDataprops>(`products/${editProductId}`);
                if (cancelled) return;

                setProductData({
                    productName: p.productName ?? "",
                    images: Array.isArray(p.images) ? p.images : [],
                    productStock: String(p.productStock ?? ""),
                    productCategory: p.productCategory ?? "",
                    productCategoryId: p.productCategoryId ?? "",
                    productSubCategory: p.productSubCategory ?? "",
                    productSubCategoryId: p.productSubCategoryId ?? "",
                    discountPrice: String(p.discountPrice ?? ""),
                    originalPrice: String(p.originalPrice ?? ""),
                    shortDescription: p.shortDescription ?? "",
                    longDescription: p.longDescription ?? "",
                    varients: p.varients ?? [],
                    variantAttributes: p.variantAttributes ?? [],
                    variantCombinations: p.variantCombinations ?? [],
                    length: p.length != null ? String(p.length) : "",
                    breadth: p.breadth != null ? String(p.breadth) : "",
                    height: p.height != null ? String(p.height) : "",
                    weight: p.weight != null ? String(p.weight) : "",
                });

                const colorAttr = (p.variantAttributes ?? []).find(
                    (a) => a.name.toLowerCase() === "color"
                );
                const sizeAttr = (p.variantAttributes ?? []).find(
                    (a) => a.name.toLowerCase() === "size"
                );
                setColorOptionsInput((colorAttr?.options ?? []).join(", "));
                setSizeOptionsInput((sizeAttr?.options ?? []).join(", "));
                setVariantRows(
                    (p.variantCombinations ?? []).map((combo, idx) => ({
                        variantId: combo.variantId || `v-${idx + 1}`,
                        color:
                            combo.attributes.find((a) => a.name.toLowerCase() === "color")?.value ??
                            "",
                        size:
                            combo.attributes.find((a) => a.name.toLowerCase() === "size")?.value ??
                            "",
                        image: combo.image ?? "",
                        productStock: String(combo.productStock ?? 0),
                        originalPrice: String(combo.originalPrice ?? 0),
                        discountPrice: String(combo.discountPrice ?? 0),
                        isDefault: Boolean(combo.isDefault),
                    }))
                );

                const raw = (p.varients ?? []) as {
                    type?: string;
                    products?: unknown[];
                }[];
                const colorDoc = raw.find((v) => v?.type === "color") ?? {
                    type: "color",
                    products: [],
                };
                const sizeDoc = raw.find((v) => v?.type === "size") ?? {
                    type: "size",
                    products: [],
                };
                setColorVarient({
                    type: "color",
                    products: Array.isArray(colorDoc.products)
                        ? (colorDoc.products as {
                              value: string;
                              productId: string;
                              pname: string;
                              image: string;
                          }[])
                        : [],
                });
                setSizeVarient({
                    type: "size",
                    products: Array.isArray(sizeDoc.products)
                        ? (sizeDoc.products as {
                              size: string;
                              productId: string;
                              pname: string;
                              image: string;
                          }[])
                        : [],
                });
            } catch {
                toast.error("Could not load product for editing");
                setEditProductId(null);
            } finally {
                if (!cancelled) setLoader(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [editProductId, setEditProductId]);

    useEffect(() => {
        if (!editProductId || !productData.productCategoryId || categories.length === 0) return;
        const selectedCategory = categories.find((c) => c._id === productData.productCategoryId);
        if (selectedCategory) {
            setSubCategories(selectedCategory.subCategories);
        }
    }, [editProductId, productData.productCategoryId, categories]);

    useEffect(() => {
        const colors = parseOptions(colorOptionsInput);
        const sizes = parseOptions(sizeOptionsInput);
        if (!colors.length && !sizes.length) {
            setVariantRows([]);
            return;
        }
        const nextKeys: Array<{ color: string; size: string }> = [];
        if (colors.length && sizes.length) {
            for (const color of colors) {
                for (const size of sizes) nextKeys.push({ color, size });
            }
        } else if (colors.length) {
            for (const color of colors) nextKeys.push({ color, size: "" });
        } else {
            for (const size of sizes) nextKeys.push({ color: "", size });
        }

        setVariantRows((prev) =>
            nextKeys.map((key, index) => {
                const found = prev.find((p) => p.color === key.color && p.size === key.size);
                return (
                    found ?? {
                        variantId: `v-${index + 1}`,
                        color: key.color,
                        size: key.size,
                        image: "",
                        productStock: "",
                        originalPrice: productData.originalPrice || "",
                        discountPrice: productData.discountPrice || "",
                        isDefault: index === 0,
                    }
                );
            })
        );
    }, [colorOptionsInput, sizeOptionsInput, productData.originalPrice, productData.discountPrice]);

    const handelAddProduct = async () => {
        if (
            !productData.productName ||
            !productData.productStock ||
            !productData.productCategoryId ||
            !productData.productSubCategoryId ||
            !productData.discountPrice ||
            !productData.originalPrice ||
            !productData.shortDescription ||
            !productData.longDescription ||
            productData.images.length === 0
        ) {
            toast.error("Please fill all the fields");
            return;
        }
        if (Number(productData.discountPrice) < Number(productData.originalPrice)) {
            toast.error("Discount price should be greater than original price");
            return;
        }

        const lengthNum = Number(productData.length);
        const breadthNum = Number(productData.breadth);
        const heightNum = Number(productData.height);
        const weightNum = Number(productData.weight);
        if (!Number.isFinite(lengthNum) || lengthNum <= 0) {
            toast.error("Please enter a valid length (cm)");
            return;
        }
        if (!Number.isFinite(breadthNum) || breadthNum <= 0) {
            toast.error("Please enter a valid breadth (cm)");
            return;
        }
        if (!Number.isFinite(heightNum) || heightNum <= 0) {
            toast.error("Please enter a valid height (cm)");
            return;
        }
        if (!Number.isFinite(weightNum) || weightNum < 1) {
            toast.error("Please enter a valid weight (grams)");
            return;
        }

        setLoader(true);

        const variantAttributes = [
            { name: "color", options: parseOptions(colorOptionsInput) },
            { name: "size", options: parseOptions(sizeOptionsInput) },
        ].filter((item) => item.options.length > 0);
        const normalizedRows = variantRows.filter((r) => r.originalPrice && r.productStock);
        const variantCombinations = normalizedRows.map((row) => ({
            variantId: row.variantId,
            attributes: [
                ...(row.color ? [{ name: "color", value: row.color }] : []),
                ...(row.size ? [{ name: "size", value: row.size }] : []),
            ],
            image: row.image || productData.images[0] || "",
            productStock: Number(row.productStock || 0),
            originalPrice: Number(row.originalPrice || 0),
            discountPrice: Number(row.discountPrice || 0),
            isDefault: row.isDefault,
        }));
        const hasCombo = variantCombinations.length > 0;
        const computedStock = hasCombo
            ? variantCombinations.reduce((sum, row) => sum + Number(row.productStock || 0), 0)
            : Number(productData.productStock || 0);
        const computedOriginal = hasCombo
            ? Math.min(...variantCombinations.map((row) => Number(row.originalPrice || 0)))
            : Number(productData.originalPrice || 0);
        const computedDiscount = hasCombo
            ? Math.max(...variantCombinations.map((row) => Number(row.discountPrice || 0)))
            : Number(productData.discountPrice || 0);

        const payload = {
            productName: productData.productName,
            images: productData.images,
            productStock: computedStock,
            productCategory: productData.productCategory,
            productCategoryId: productData.productCategoryId,
            productSubCategory: productData.productSubCategory,
            productSubCategoryId: productData.productSubCategoryId,
            discountPrice: computedDiscount,
            originalPrice: computedOriginal,
            shortDescription: productData.shortDescription,
            longDescription: productData.longDescription,
            varients: [colorVarient, sizeVarient],
            variantAttributes,
            variantCombinations,
            length: lengthNum,
            breadth: breadthNum,
            height: heightNum,
            weight: weightNum,
        };

        try {
            if (editProductId) {
                const response = await updateDataWithData<
                    typeof payload & { _id: string },
                    AddProductProps
                >("products", { _id: editProductId, ...payload });
                if (response?.message) {
                    toast.success(response.message);
                }
                setEditProductId(null);
                setDescriptionPage(false);
            } else {
                const response = await postData<typeof payload, AddProductProps>("products", payload);
                if (response && response.message) {
                    toast.success(response.message);
                }
                setDescriptionPage(false);
            }
        } catch (err) {
            toast.error(editProductId ? "Error updating product" : "Error adding product");
            console.error(err);
        } finally {
            setLoader(false);
        }
    };


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


    const isEditMode = Boolean(editProductId);

    return (
        <>
            {
                loader && <FixedLoader />
            }
            <div className="grid grid-cols-1 gap-4">
                <div className="w-full flex raleway">

                    <Button className="text-lg font-semibold hover:no-underline" variant={'link'} onClick={() => {
                        setDescriptionPage(false);
                        setEditProductId(null);
                    }}>
                        <ArrowLeft />  Back to Products
                    </Button>

                    <div className="ms-auto flex items-center gap-4 exo">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            {isEditMode ? "Editing product" : "New product"}
                        </span>
                        <Button className="font-[500] text-base" variant={'link'} onClick={handelAddProduct}>
                            {isEditMode ? "Save changes" : "Save product"}
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
                        Shipping Details
                    </h5>
                    <p className="text-sm text-muted-foreground mb-4">
                        Used for shipping rate calculation (Shiprocket / couriers). All fields are required.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="w-full">
                            <Label htmlFor='productLength' className="mb-1">Length (cm)</Label>
                            <Input id="productLength" type="number" min={0.1} step="0.1"
                                value={productData.length}
                                onChange={(e) => setProductData((prev) => ({ ...prev, length: e.target.value }))}
                                placeholder="e.g. 20"
                            />
                        </div>
                        <div className="w-full">
                            <Label htmlFor='productBreadth' className="mb-1">Breadth (cm)</Label>
                            <Input id="productBreadth" type="number" min={0.1} step="0.1"
                                value={productData.breadth}
                                onChange={(e) => setProductData((prev) => ({ ...prev, breadth: e.target.value }))}
                                placeholder="e.g. 15"
                            />
                        </div>
                        <div className="w-full">
                            <Label htmlFor='productHeight' className="mb-1">Height (cm)</Label>
                            <Input id="productHeight" type="number" min={0.1} step="0.1"
                                value={productData.height}
                                onChange={(e) => setProductData((prev) => ({ ...prev, height: e.target.value }))}
                                placeholder="e.g. 5"
                            />
                        </div>
                        <div className="w-full">
                            <Label htmlFor='productWeight' className="mb-1">Weight (grams)</Label>
                            <Input id="productWeight" type="number" min={1} step="1"
                                value={productData.weight}
                                onChange={(e) => setProductData((prev) => ({ ...prev, weight: e.target.value }))}
                                placeholder="e.g. 500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-5 pb-10 raleway">
                    <h5 className="mb-4 text-2xl font-semibold ">
                        Product Varients
                    </h5>

                    <p className="text-sm text-muted-foreground mb-4">
                        Create Myntra/Flipkart-style combinations (Color x Size) with per-variant
                        stock and price.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label className="mb-1">Color options (comma separated)</Label>
                            <Input
                                value={colorOptionsInput}
                                onChange={(e) => setColorOptionsInput(e.target.value)}
                                placeholder="Black, White, Blue"
                            />
                        </div>
                        <div>
                            <Label className="mb-1">Size options (comma separated)</Label>
                            <Input
                                value={sizeOptionsInput}
                                onChange={(e) => setSizeOptionsInput(e.target.value)}
                                placeholder="S, M, L, XL"
                            />
                        </div>
                    </div>
                    {variantRows.length > 0 ? (
                        <div className="border rounded-md overflow-hidden mb-6">
                            <div className="grid grid-cols-7 gap-2 px-3 py-2 text-xs font-semibold bg-neutral-50 border-b">
                                <span>Color</span>
                                <span>Size</span>
                                <span>Stock</span>
                                <span>Selling Price</span>
                                <span>MRP</span>
                                <span>Image URL</span>
                                <span>Default</span>
                            </div>
                            <div className="max-h-[340px] overflow-y-auto">
                                {variantRows.map((row, idx) => (
                                    <div
                                        key={`${row.color}-${row.size}-${idx}`}
                                        className="grid grid-cols-7 gap-2 px-3 py-2 border-b last:border-b-0"
                                    >
                                        <Input value={row.color} disabled />
                                        <Input value={row.size} disabled />
                                        <Input
                                            type="number"
                                            value={row.productStock}
                                            onChange={(e) =>
                                                setVariantRows((prev) =>
                                                    prev.map((v, i) =>
                                                        i === idx ? { ...v, productStock: e.target.value } : v
                                                    )
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={row.originalPrice}
                                            onChange={(e) =>
                                                setVariantRows((prev) =>
                                                    prev.map((v, i) =>
                                                        i === idx ? { ...v, originalPrice: e.target.value } : v
                                                    )
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={row.discountPrice}
                                            onChange={(e) =>
                                                setVariantRows((prev) =>
                                                    prev.map((v, i) =>
                                                        i === idx ? { ...v, discountPrice: e.target.value } : v
                                                    )
                                                )
                                            }
                                        />
                                        <Input
                                            value={row.image}
                                            onChange={(e) =>
                                                setVariantRows((prev) =>
                                                    prev.map((v, i) =>
                                                        i === idx ? { ...v, image: e.target.value } : v
                                                    )
                                                )
                                            }
                                            placeholder="https://..."
                                        />
                                        <Button
                                            type="button"
                                            variant={row.isDefault ? "default" : "outline"}
                                            onClick={() =>
                                                setVariantRows((prev) =>
                                                    prev.map((v, i) => ({ ...v, isDefault: i === idx }))
                                                )
                                            }
                                        >
                                            {row.isDefault ? "Default" : "Make default"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="hidden">
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
                    <div className="hidden">
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