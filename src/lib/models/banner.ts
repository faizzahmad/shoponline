import mongoose from "mongoose";
const bannerSchema = new mongoose.Schema({
    type : {
        type: String,
        required: true,
    },
    link : {
        type: String,
        
    },
    image : {
        type: String,
        required: true,
    }

},{timestamps: true});

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
export default Banner;
