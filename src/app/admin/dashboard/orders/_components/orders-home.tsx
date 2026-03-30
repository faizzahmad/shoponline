"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { fetchData, updateDataWithData } from "@/utils/apiCall";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { buildOrderColumns, type OrderRow } from "./columns";
import { OrdersDataTable } from "./orders-table";

type PutOrderResponse = {
    message?: string;
    error?: string;
};

export const OrdersHome = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [detail, setDetail] = useState<OrderRow | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchData<OrderRow[]>("order");
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch {
            toast.error("Could not load orders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const patchOrder = useCallback(
        async (
            orderId: string,
            field: "orderStatus" | "deliveryStatus" | "paymentStatus",
            value: string
        ) => {
            setUpdatingId(orderId);
            try {
                const res = await updateDataWithData<
                    { orderId: string } & Record<string, string>,
                    PutOrderResponse
                >("order", { orderId, [field]: value });
                if (res.error) {
                    toast.error(res.error);
                    return;
                }
                toast.success("Order updated");
                await loadOrders();
            } catch {
                toast.error("Failed to update order");
            } finally {
                setUpdatingId(null);
            }
        },
        [loadOrders]
    );

    const columns = useMemo(
        () =>
            buildOrderColumns({
                updatingId,
                onOrderStatusChange: (id, v) => patchOrder(id, "orderStatus", v),
                onDeliveryStatusChange: (id, v) => patchOrder(id, "deliveryStatus", v),
                onPaymentStatusChange: (id, v) => patchOrder(id, "paymentStatus", v),
                onViewDetails: setDetail,
            }),
        [updatingId, patchOrder]
    );

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Orders</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review and update order, delivery, and payment status.
                </p>
            </div>
            <div className="w-full bg-white shadow-sm border border-neutral-200 rounded-lg p-5">
                {loading ? (
                    <div className="w-full h-[50vh] flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader className="size-8 animate-spin" />
                        Loading orders…
                    </div>
                ) : (
                    <OrdersDataTable data={orders} columns={columns} />
                )}
            </div>

            <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order details</DialogTitle>
                    </DialogHeader>
                    {detail && (
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Customer</p>
                                <p className="font-medium">
                                    {detail.username} · {detail.userPhone}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Delivery address</p>
                                <p className="whitespace-pre-wrap">{detail.deliveryAddress}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-muted-foreground">Payment</p>
                                    <p>{detail.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Coupon</p>
                                    <p>{detail.couponCode || "—"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-2">Line items</p>
                                <ul className="border rounded-md divide-y">
                                    {(detail.items ?? []).map((line, i) => (
                                        <li key={`${line.productId}-${i}`} className="p-3">
                                            <div className="font-medium">{line.productName}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Qty {line.quantity} · ₹
                                                {Number(line.discountPrice).toLocaleString("en-IN")}{" "}
                                                each
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pt-2 border-t font-medium">
                                Total: ₹{Number(detail.totalAmount).toLocaleString("en-IN")}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
