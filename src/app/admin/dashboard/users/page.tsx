import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";
import { UsersHome } from "./_components/users-home";

const UsersPage = async () => {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) redirect("/admin");
    return (
        <div className="p-5 bg-gray-50 h-screen w-full overflow-y-auto">
            <UsersHome />
        </div>
    );
};

export default UsersPage;
