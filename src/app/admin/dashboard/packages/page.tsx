import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";
import { PackagesHome } from "./_components/packages-home";

export default async function PackagesPage() {
    const verified = await verifyAuth();
    if (!verified.isValid) redirect("/admin");
    return (
        <div className="p-5 bg-gray-50 min-h-screen w-full overflow-y-auto">
            <PackagesHome />
        </div>
    );
}
