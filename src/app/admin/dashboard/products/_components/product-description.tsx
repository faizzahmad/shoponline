import { Button } from "@/components/ui/button";
import { ArrowLeft, GripVertical, ImageIcon, Layers, Plus, Trash } from "lucide-react";
import { useProductAdmin } from "../hooks/use-product-admin";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchData, postData, updateDataWithData } from "@/utils/apiCall";
import { FixedLoader } from "@/components/custom/fixed-loader";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";

function reorderImages(images: string[], fromIndex: number, toIndex: number): string[] {
    const next = [...images];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    return next;
}

type VariantAttrDisplay = "image" | "text";

type VariantAttributeInput = {
    name: string;
    options: string[];
    displayMode?: VariantAttrDisplay;
};

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
    variantAttributes?: VariantAttributeInput[];
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
    variantDisplayMode?: VariantAttrDisplay;
    variantAttributes?: VariantAttributeInput[];
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

type AttrEditor = {
    id: string;
    name: string;
    optionsInput: string;
    showAsImage: boolean;
};

type VariantRow = {
    variantId: string;
    attributes: Array<{ name: string; value: string }>;
    image: string;
    productStock: string;
    originalPrice: string;
    discountPrice: string;
    isDefault: boolean;
};

const newAttrEditor = (partial?: Partial<AttrEditor>): AttrEditor => ({
    id: `attr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    optionsInput: "",
    showAsImage: false,
    ...partial,
});

const parseOptions = (value: string): string[] =>
    value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

const comboKey = (attrs: Array<{ name: string; value: string }>) =>
    attrs.map((a) => `${a.name}:${a.value}`).join("|");

const buildCombinations = (
    editors: AttrEditor[]
): Array<Array<{ name: string; value: string }>> => {
    const active = editors
        .map((e) => ({
            name: e.name.trim(),
            options: parseOptions(e.optionsInput),
        }))
        .filter((e) => e.name && e.options.length > 0);

    if (!active.length) return [];

    return active.reduce<Array<Array<{ name: string; value: string }>>>(
        (acc, attr) => {
            const base = acc.length ? acc : [[]];
            const next: Array<Array<{ name: string; value: string }>> = [];
            for (const combo of base) {
                for (const value of attr.options) {
                    next.push([...combo, { name: attr.name, value }]);
                }
            }
            return next;
        },
        []
    );
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
    const [attrEditors, setAttrEditors] = useState<AttrEditor[]>([newAttrEditor({ name: "Size" })]);
    const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
    const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const dragImageIndexRef = useRef<number | null>(null);

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

    const anyImageAttr = useMemo(
        () => attrEditors.some((a) => a.showAsImage),
        [attrEditors]
    );

    const activeAttrNames = useMemo(
        () =>
            attrEditors
                .filter((e) => e.name.trim() && parseOptions(e.optionsInput).length > 0)
                .map((e) => e.name.trim()),
        [attrEditors]
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
        setAttrEditors([newAttrEditor({ name: "Size" })]);
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

                const loadedAttrs = (p.variantAttributes ?? []).filter(
                    (a) => a.name && Array.isArray(a.options) && a.options.length > 0
                );
                if (loadedAttrs.length > 0) {
                    setAttrEditors(
                        loadedAttrs.map((a) =>
                            newAttrEditor({
                                name: a.name,
                                optionsInput: (a.options ?? []).join(", "),
                                showAsImage: a.displayMode === "image",
                            })
                        )
                    );
                } else {
                    setAttrEditors([newAttrEditor({ name: "Size" })]);
                }
                setVariantRows(
                    (p.variantCombinations ?? []).map((combo, idx) => ({
                        variantId: combo.variantId || `v-${idx + 1}`,
                        attributes: Array.isArray(combo.attributes) ? combo.attributes : [],
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
        const nextCombos = buildCombinations(attrEditors);
        if (!nextCombos.length) {
            setVariantRows([]);
            return;
        }

        setVariantRows((prev) =>
            nextCombos.map((attributes, index) => {
                const key = comboKey(attributes);
                const found = prev.find((p) => comboKey(p.attributes) === key);
                return (
                    found ?? {
                        variantId: `v-${index + 1}`,
                        attributes,
                        image: "",
                        productStock: "",
                        originalPrice: productData.originalPrice || "",
                        discountPrice: productData.discountPrice || "",
                        isDefault: index === 0,
                    }
                );
            })
        );
    }, [attrEditors, productData.originalPrice, productData.discountPrice]);

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

        const namedAttrs = attrEditors.filter((e) => e.name.trim());
        const duplicateNames = namedAttrs
            .map((e) => e.name.trim().toLowerCase())
            .filter((name, i, arr) => arr.indexOf(name) !== i);
        if (duplicateNames.length > 0) {
            toast.error("Variant type names must be unique");
            return;
        }

        setLoader(true);

        const variantAttributes = attrEditors
            .map((e) => ({
                name: e.name.trim(),
                options: parseOptions(e.optionsInput),
                displayMode: (e.showAsImage ? "image" : "text") as VariantAttrDisplay,
            }))
            .filter((item) => item.name && item.options.length > 0);

        const normalizedRows = variantRows.filter((r) => r.originalPrice && r.productStock);
        const variantCombinations = normalizedRows.map((row) => ({
            variantId: row.variantId,
            attributes: row.attributes,
            // Only keep an image if the admin picked one — never auto-fill main product image
            image: row.image || "",
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
                    <h5 className="mb-1 text-2xl font-semibold raleway">
                        Product Images
                    </h5>
                    <p className="text-sm text-muted-foreground mb-3">
                        Upload up to 8 images at once. Drag by the grip to reorder — the first image is the main thumbnail.
                    </p>
                    <div className=" flex gap-8 items-start flex-wrap">

                        <div className="w-full max-w-[380px]">
                            <UploadDropzone
                                endpoint="productImages"
                                onClientUploadComplete={(res) => {
                                    if (!res?.length) return;
                                    const urls = res
                                        .map((file) => file.ufsUrl)
                                        .filter(Boolean);
                                    if (!urls.length) return;
                                    setProductData((prev) => ({
                                        ...prev,
                                        images: [...prev.images, ...urls],
                                    }));
                                    toast.success(
                                        urls.length === 1
                                            ? "1 image uploaded"
                                            : `${urls.length} images uploaded`
                                    );
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(error.message)
                                }}
                            />
                        </div>
                        <div className="flex-shrink-1 flex gap-4 flex-wrap">

                            {
                                productData.images.map((image, index) => (
                                    <div
                                        draggable
                                        onDragStart={() => {
                                            dragImageIndexRef.current = index;
                                            setDragImageIndex(index);
                                        }}
                                        onDragEnd={() => {
                                            dragImageIndexRef.current = null;
                                            setDragImageIndex(null);
                                            setDropTargetIndex(null);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                            setDropTargetIndex(index);
                                        }}
                                        onDragLeave={() => setDropTargetIndex((t) => (t === index ? null : t))}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const from = dragImageIndexRef.current;
                                            dragImageIndexRef.current = null;
                                            setDropTargetIndex(null);
                                            setDragImageIndex(null);
                                            if (from === null || from === index) return;
                                            setProductData((prev) => ({
                                                ...prev,
                                                images: reorderImages(prev.images, from, index),
                                            }));
                                        }}
                                        className={cn(
                                            "size-24 relative rounded-lg cursor-grab active:cursor-grabbing outline-none ring-offset-2 transition",
                                            dragImageIndex === index && "opacity-50 scale-[0.98]",
                                            dropTargetIndex === index &&
                                                dragImageIndex !== null &&
                                                dragImageIndex !== index &&
                                                "ring-2 ring-[#0F2744]",
                                        )}
                                        key={`${image}-${index}`}
                                    >
                                        <span className="absolute left-0.5 top-0.5 z-10 flex items-center rounded bg-black/55 p-0.5 text-white">
                                            <GripVertical className="size-4" aria-hidden />
                                        </span>
                                        <span className="absolute bottom-1 right-1 z-10 rounded bg-black/60 px-1.5 py-px text-[10px] font-semibold text-white">
                                            {index + 1}
                                        </span>
                                        <Image src={image} alt="product"
                                            fill
                                            objectFit="cover"
                                            className="h-full w-full rounded-lg pointer-events-none"
                                            draggable={false}
                                        />
                                        <div className="absolute top-1 right-1 z-10">
                                            <button
                                                type="button"
                                                title="Remove image"
                                                className="p-1 bg-[#0F2744] text-white rounded-full hover:bg-[#1B3F66]"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    ev.stopPropagation();
                                                    setProductData((prev) => ({
                                                        ...prev,
                                                        images: prev.images.filter((_, i) => i !== index),
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
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h5 className="flex items-center gap-2 text-2xl font-semibold">
                                <Layers className="size-5 text-[#0F2744]" aria-hidden />
                                Product Variants
                            </h5>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add only the variant types you need (e.g. Size or Pack). Check “Show as image” per type if you want image swatches.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {variantRows.length > 0 ? (
                                <span className="rounded-full border border-[#0F2744]/15 bg-[#F6F7F9] px-3 py-1 text-xs font-medium text-[#0F2744]">
                                    {variantRows.length} combination{variantRows.length === 1 ? "" : "s"}
                                </span>
                            ) : null}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setAttrEditors((prev) => [...prev, newAttrEditor()])}
                            >
                                <Plus className="size-4" />
                                Add type
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6 space-y-3">
                        {attrEditors.map((editor, editorIdx) => (
                            <div
                                key={editor.id}
                                className="rounded-xl border border-[#0F2744]/10 bg-[#F6F7F9] p-4"
                            >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Variant type {editorIdx + 1}
                                    </p>
                                    {attrEditors.length > 1 ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-neutral-500 hover:text-red-600"
                                            onClick={() =>
                                                setAttrEditors((prev) =>
                                                    prev.filter((e) => e.id !== editor.id)
                                                )
                                            }
                                        >
                                            <Trash className="size-3.5" />
                                            Remove
                                        </Button>
                                    ) : null}
                                </div>
                                <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                                    <div>
                                        <Label className="mb-1.5 text-sm font-medium">Type name</Label>
                                        <Input
                                            value={editor.name}
                                            onChange={(e) =>
                                                setAttrEditors((prev) =>
                                                    prev.map((item) =>
                                                        item.id === editor.id
                                                            ? { ...item, name: e.target.value }
                                                            : item
                                                    )
                                                )
                                            }
                                            placeholder="e.g. Size, Pack, Color"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-1.5 text-sm font-medium">Options</Label>
                                        <Input
                                            value={editor.optionsInput}
                                            onChange={(e) =>
                                                setAttrEditors((prev) =>
                                                    prev.map((item) =>
                                                        item.id === editor.id
                                                            ? { ...item, optionsInput: e.target.value }
                                                            : item
                                                    )
                                                )
                                            }
                                            placeholder="PackOf1, PackOf2, PackOf3"
                                            className="bg-white"
                                        />
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            Comma-separated values
                                        </p>
                                    </div>
                                </div>
                                <label
                                    htmlFor={`show-image-${editor.id}`}
                                    className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-[#0F2744]/10 bg-white px-3 py-2.5"
                                >
                                    <Checkbox
                                        id={`show-image-${editor.id}`}
                                        checked={editor.showAsImage}
                                        onCheckedChange={(checked) =>
                                            setAttrEditors((prev) =>
                                                prev.map((item) =>
                                                    item.id === editor.id
                                                        ? { ...item, showAsImage: Boolean(checked) }
                                                        : item
                                                )
                                            )
                                        }
                                        className="mt-0.5"
                                    />
                                    <span className="space-y-0.5">
                                        <span className="block text-sm font-semibold text-[#0F2744]">
                                            Show as image
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {editor.showAsImage
                                                ? "Options for this type render as image cards on the product page."
                                                : "Options for this type render as text cards on the product page."}
                                        </span>
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>

                    {variantRows.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-[#0F2744]/10">
                            <div className="max-h-[420px] overflow-y-auto divide-y">
                                {variantRows.map((row, idx) => (
                                    <div
                                        key={`${comboKey(row.attributes)}-${idx}`}
                                        className="grid grid-cols-1 gap-3 px-3 py-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-end"
                                    >
                                        {activeAttrNames.map((name) => {
                                            const value =
                                                row.attributes.find((a) => a.name === name)?.value ??
                                                "";
                                            return (
                                                <div key={`${row.variantId}-${name}`}>
                                                    <p className="mb-1 text-[10px] font-semibold uppercase text-neutral-500">
                                                        {name}
                                                    </p>
                                                    <Input value={value} disabled className="bg-neutral-50" />
                                                </div>
                                            );
                                        })}
                                        <div>
                                            <p className="mb-1 text-[10px] font-semibold uppercase text-neutral-500">Stock</p>
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
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-semibold uppercase text-neutral-500">Selling</p>
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
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-semibold uppercase text-neutral-500">MRP</p>
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
                                        </div>
                                        {anyImageAttr ? (
                                            <div>
                                                <p className="mb-1 text-[10px] font-semibold uppercase text-neutral-500">
                                                    Variant image
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {row.image ? (
                                                        <div className="relative size-9 shrink-0 overflow-hidden rounded border">
                                                            <Image
                                                                src={row.image}
                                                                alt=""
                                                                fill
                                                                sizes="36px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded border border-dashed text-neutral-400">
                                                            <ImageIcon className="size-3.5" />
                                                        </div>
                                                    )}
                                                    <Select
                                                        value={row.image || "__none__"}
                                                        onValueChange={(value) =>
                                                            setVariantRows((prev) =>
                                                                prev.map((v, i) =>
                                                                    i === idx
                                                                        ? {
                                                                              ...v,
                                                                              image:
                                                                                  value === "__none__"
                                                                                      ? ""
                                                                                      : value,
                                                                          }
                                                                        : v
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9 w-full min-w-0">
                                                            <SelectValue placeholder="Pick image" />
                                                        </SelectTrigger>
                                                        <SelectContent className="z-[120]">
                                                            <SelectItem value="__none__">No image</SelectItem>
                                                            {productData.images.map((img, imgIdx) => (
                                                                <SelectItem key={`${img}-${imgIdx}`} value={img}>
                                                                    Image {imgIdx + 1}
                                                                    {imgIdx === 0 ? " (main)" : ""}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ) : null}
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={row.isDefault ? "default" : "outline"}
                                                className="w-full"
                                                onClick={() =>
                                                    setVariantRows((prev) =>
                                                        prev.map((v, i) => ({ ...v, isDefault: i === idx }))
                                                    )
                                                }
                                            >
                                                {row.isDefault ? "Default" : "Set default"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-neutral-300 bg-[#F6F7F9] px-4 py-10 text-center">
                            <Layers className="mx-auto mb-2 size-8 text-neutral-400" aria-hidden />
                            <p className="text-sm font-medium text-neutral-700">No variants yet</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Enter a type name and options above to generate combinations.
                            </p>
                        </div>
                    )}

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
                        <RichTextEditor
                            value={productData.longDescription}
                            onChange={(html) =>
                                setProductData((prev) => ({ ...prev, longDescription: html }))
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    )
}