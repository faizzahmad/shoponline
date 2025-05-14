import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";

const AdminDashboard = async() => {
    const isVrefied = await verifyAuth();
    if(!isVrefied.isValid) redirect('/admin')
        
    return (
        <div>
            AdminDashboard
        </div>
      );
}
 
export default AdminDashboard;