import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    categoryId : {
        type : String,
        required : true,
    }
});

const subCategorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    subCategoryId : {
        type : String,
        required : true,
    }
})
const filterSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    filterId : {
        type : String,
        required : true,
    }
})

const productSchema = new mongoose.Schema({
   title : {
        type : String,
        required : true,
   },
    short_description : {
          type : String,
          required : true,
    },
    long_description : {
            type : String,
            required : true,
    },
    price : {
        type : Number,
        required : true,
    },
    discountedPrice : {
        type : Number,
        required : false,
    },
    images : {
        type : [String],
    },
    category : [categorySchema],
    subCategory : [subCategorySchema],
    filters : [filterSchema],
    totalSales : {
        type : Number,
        default : 0,
    },
    productId : {
        type : String,
        required : true,
    },
}, { timestamps: true });
