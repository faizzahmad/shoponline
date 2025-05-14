import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    adminType : {
        type : String,
        enum : ["superAdmin", "admin"],
        default : "admin",
    }

},{ timestamps : true })

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;