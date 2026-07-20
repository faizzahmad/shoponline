import mongoose from "mongoose";

const variantAttributeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        options: { type: [String], default: [] },
        /** Storefront UI: image swatches or text cards for this attribute */
        displayMode: {
            type: String,
            enum: ["image", "text"],
            default: "text",
        },
    },
    { _id: false }
);

const variantCombinationSchema = new mongoose.Schema(
    {
        variantId: { type: String, required: true },
        sku: { type: String, default: "" },
        attributes: {
            type: [
                {
                    name: { type: String, required: true, trim: true },
                    value: { type: String, required: true, trim: true },
                },
            ],
            default: [],
        },
        image: { type: String, default: "" },
        productStock: { type: Number, default: 0 },
        originalPrice: { type: Number, required: true },
        discountPrice: { type: Number, default: 0 },
        isDefault: { type: Boolean, default: false },
    },
    { _id: false }
);

const varientsSchema = new mongoose.Schema({
    type : {
        type: String,
    },
    products : [
        {
            value :{
                type: String,
            },
            productId : {
                type: String,
            },
            image :{
                type: String,
            },
            pname : {
                type: String,
            },

        }
    ]
})

const productSchema = new mongoose.Schema({
     productName: {
            type: String,
            required: true,
     },
     productId : {
            type: String,
            unique : true,
     },
        images : {
            type: [String],
        },
        productStock: {
            type: Number,
            default: 0,
        },
        productCategory: {
            type: String,
            required: true,
        },
        productCategoryId: {
            type: String,
            required: true,
        },
        productSubCategory: {
            type: String,
            required: true,
        },
        productSubCategoryId: {
            type: String,
            required: true,
        },
        discountPrice: {
            type: Number,
            default: 0,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        shortDescription: {
            type: String,
        },
        longDescription: {
            type: String,
        },
        totalSales : {
            type: Number,
            default: 0,
        },
        /** Shipping dimensions (cm) — required for Shiprocket integration */
        length: {
            type: Number,
            required: true,
            min: 0.1,
        },
        breadth: {
            type: Number,
            required: true,
            min: 0.1,
        },
        height: {
            type: Number,
            required: true,
            min: 0.1,
        },
        /** Shipping weight in grams */
        weight: {
            type: Number,
            required: true,
            min: 1,
        },
        varients : [varientsSchema],
        /** How options render on product page / modal: image swatches or text cards */
        variantDisplayMode: {
            type: String,
            enum: ["image", "text"],
            default: "text",
        },
        variantAttributes: {
            type: [variantAttributeSchema],
            default: [],
        },
        variantCombinations: {
            type: [variantCombinationSchema],
            default: [],
        },
},{timestamps: true});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;