import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
        unique: true,
    },
    image : {
        type: String,
        required: true,
    }
}, { timestamps: true });


const categorySchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
        unique: true,
    },
    image : {
        type: String,
        required: true,
    },
    subCategories : [subCategorySchema]
}, { timestamps: true });

    

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;