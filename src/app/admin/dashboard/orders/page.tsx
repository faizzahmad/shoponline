import { verifyAuth } from "@/utils/verifyToken";
import { redirect } from "next/navigation";
import { OrdersHome } from "./_components/orders-home";

const OrdersPage = async () => {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) redirect("/admin");
    return (
        <div className="p-5 bg-gray-50 h-screen w-full overflow-y-auto">
            <OrdersHome />
        </div>
    );
};

export default OrdersPage;
