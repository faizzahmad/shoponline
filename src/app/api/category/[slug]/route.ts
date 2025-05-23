import Category from "@/lib/models/category-model";
import { connectToDb } from "@/lib/connectToDb";


export async function GET(req: Request){
     await connectToDb();
     const slugId  = req.url.split("/").pop();
     try{
        const category = await Category.findById(slugId).select("title _id image").lean();
         return new Response(JSON.stringify(category), {
            status: 201,
        });
             
     }catch(error){
       console.error("Error getting category info:", error);
        return new Response(JSON.stringify({ error: "Error getting category info" }), {
            status: 500,
        });
     }
     

}