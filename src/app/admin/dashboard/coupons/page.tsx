import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";
import { Coupons } from "./_components/coupons";

const CouponsPage = async() => {
     const isVrefied = await verifyAuth();
        if (!isVrefied.isValid) redirect('/admin')
    return (  
        <div className="p-5 bg-gray-50 h-screen w-full overflow-y-auto">
           <Coupons/>
        </div>
    );
}
 
export default CouponsPage;