import mongoose from "mongoose";

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
            }


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
        varients : [varientsSchema]
},{timestamps: true});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;