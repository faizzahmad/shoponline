import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";
import { DashboardHome } from "./_components/dashboard-home";

const AdminDashboard = async () => {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) redirect("/admin");

    return (
        <div className="p-5 bg-gray-50 min-h-screen w-full overflow-y-auto">
            <DashboardHome />
        </div>
    );
};

export default AdminDashboard;
