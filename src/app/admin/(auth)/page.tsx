import { redirect } from "next/navigation";
import { Login } from "./_components/login";
import { verifyAuth } from "@/utils/verifyToken";

const AdminLogin = async() => {
  const isVerified = await verifyAuth();
  if (isVerified.isValid) redirect("/admin/dashboard");
    return ( 
        <div className="w-full h-screen flex items-center justify-center">
            <Login/>
        </div>
     );
}
 
export default AdminLogin;