"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader, RefreshCcw, Truck } from "lucide-react";
import { toast } from "sonner";
import { fetchData, postData, updateDataWithData } from "@/utils/apiCall";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildOrderColumns, type OrderRow } from "./columns";
import { OrdersDataTable } from "./orders-table";

type PutOrderResponse = {
    message?: string;
    error?: string;
};

type ShiprocketActionResponse = {
    message?: string;
    error?: string;
    awbCode?: string;
    courierName?: string;
    courierCompanyId?: string | number | null;
};

export const OrdersHome = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [detail, setDetail] = useState<OrderRow | null>(null);
    const [shipping, setShipping] = useState<"sync" | "awb" | null>(null);
    const [courierIdInput, setCourierIdInput] = useState("");

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
                onViewDetails: (row) => {
                    setDetail(row);
                    setCourierIdInput("");
                },
            }),
        [updatingId, patchOrder]
    );

    const refreshDetailFromOrders = useCallback(
        (id: string, fallback: OrderRow): OrderRow => {
            return orders.find((o) => o._id === id) ?? fallback;
        },
        [orders]
    );

    const handleRetrySync = useCallback(async () => {
        if (!detail) return;
        setShipping("sync");
        try {
            const res = await postData<
                { orderId: string; action: "retry-sync" },
                ShiprocketActionResponse
            >("order/shiprocket", { orderId: detail._id, action: "retry-sync" });
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.message || "Synced to Shiprocket");
            }
            await loadOrders();
            setDetail((prev) => (prev ? refreshDetailFromOrders(prev._id, prev) : prev));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Sync failed";
            toast.error(msg);
        } finally {
            setShipping(null);
        }
    }, [detail, loadOrders, refreshDetailFromOrders]);

    const handleAssignAwb = useCallback(async () => {
        if (!detail) return;
        setShipping("awb");
        try {
            const trimmed = courierIdInput.trim();
            const courierCompanyId = trimmed === "" ? undefined : Number(trimmed);
            if (trimmed && (!Number.isFinite(courierCompanyId) || (courierCompanyId as number) <= 0)) {
                toast.error("Courier id must be a positive number, or leave empty for cheapest");
                return;
            }
            const res = await postData<
                {
                    orderId: string;
                    action: "assign-awb";
                    courierCompanyId?: number;
                },
                ShiprocketActionResponse
            >("order/shiprocket", {
                orderId: detail._id,
                action: "assign-awb",
                ...(courierCompanyId !== undefined ? { courierCompanyId: courierCompanyId as number } : {}),
            });
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(
                    `AWB ${res.awbCode}${res.courierName ? ` · ${res.courierName}` : ""}`
                );
            }
            await loadOrders();
            setDetail((prev) => (prev ? refreshDetailFromOrders(prev._id, prev) : prev));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "AWB assignment failed";
            toast.error(msg);
        } finally {
            setShipping(null);
        }
    }, [detail, courierIdInput, loadOrders, refreshDetailFromOrders]);

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
                                    {detail.userEmail ? ` · ${detail.userEmail}` : ""}
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
                                    {(detail.items ?? []).map((line, i) => {
                                        const attrs = line.variantAttributes ?? [];
                                        const thumb = line.variantImage || line.images?.[0];
                                        return (
                                        <li key={`${line.productId}-${line.variantId ?? ""}-${i}`} className="p-3 flex gap-3">
                                            {thumb ? (
                                                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-neutral-50">
                                                    <Image
                                                        src={thumb}
                                                        alt={line.productName}
                                                        fill
                                                        sizes="64px"
                                                        className="object-cover object-center"
                                                    />
                                                </div>
                                            ) : null}
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium">{line.productName}</div>
                                                {attrs.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {attrs.map((attr) => (
                                                            <span
                                                                key={`${line.productId}-${i}-${attr.name}`}
                                                                className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700"
                                                            >
                                                                <span className="capitalize text-neutral-500">{attr.name}:</span>
                                                                <span className="font-medium capitalize text-neutral-800">{attr.value}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Qty {line.quantity} · ₹
                                                    {Number(line.discountPrice).toLocaleString("en-IN")}{" "}
                                                    each
                                                </div>
                                            </div>
                                        </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div className="pt-2 border-t font-medium">
                                Total: ₹{Number(detail.totalAmount).toLocaleString("en-IN")}
                            </div>

                            <div className="pt-3 border-t space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium flex items-center gap-1.5">
                                        <Truck className="size-4 text-rose-600" />
                                        Shiprocket
                                    </p>
                                    <span
                                        className={
                                            "text-xs px-2 py-0.5 rounded-full " +
                                            (detail.shiprocketOrderId
                                                ? "bg-emerald-100 text-emerald-700"
                                                : detail.shiprocketSyncError
                                                  ? "bg-rose-100 text-rose-700"
                                                  : "bg-neutral-100 text-neutral-600")
                                        }
                                    >
                                        {detail.shiprocketOrderId
                                            ? "Synced"
                                            : detail.shiprocketSyncError
                                              ? "Failed"
                                              : "Not synced"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-muted-foreground">Order ID</p>
                                        <p className="font-mono break-all">
                                            {detail.shiprocketOrderId || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Shipment ID</p>
                                        <p className="font-mono break-all">
                                            {detail.shiprocketShipmentId
                                                ? String(detail.shiprocketShipmentId)
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">AWB</p>
                                        <p className="font-mono break-all">
                                            {detail.awbCode || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Courier</p>
                                        <p className="break-all">
                                            {detail.courierName || "—"}
                                        </p>
                                    </div>
                                </div>

                                {detail.shiprocketSyncError ? (
                                    <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1.5 break-words">
                                        {detail.shiprocketSyncError}
                                    </p>
                                ) : null}

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={shipping !== null}
                                        onClick={handleRetrySync}
                                    >
                                        {shipping === "sync" ? (
                                            <Loader className="size-3.5 animate-spin mr-1.5" />
                                        ) : (
                                            <RefreshCcw className="size-3.5 mr-1.5" />
                                        )}
                                        {detail.shiprocketOrderId ? "Re-sync" : "Retry Shiprocket"}
                                    </Button>
                                </div>

                                <div className="rounded-md border bg-neutral-50/60 p-3 space-y-2">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="awb-courier-id"
                                                className="text-xs text-muted-foreground"
                                            >
                                                Courier company id (optional)
                                            </Label>
                                            <Input
                                                id="awb-courier-id"
                                                inputMode="numeric"
                                                placeholder="Leave empty for cheapest courier"
                                                value={courierIdInput}
                                                onChange={(e) =>
                                                    setCourierIdInput(
                                                        e.target.value.replace(/\D/g, "")
                                                    )
                                                }
                                                disabled={
                                                    shipping !== null || !detail.shiprocketShipmentId
                                                }
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={
                                                shipping !== null ||
                                                !detail.shiprocketShipmentId ||
                                                Boolean(detail.awbCode)
                                            }
                                            onClick={handleAssignAwb}
                                        >
                                            {shipping === "awb" ? (
                                                <Loader className="size-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            {detail.awbCode ? "AWB assigned" : "Assign AWB"}
                                        </Button>
                                    </div>
                                    {!detail.shiprocketShipmentId ? (
                                        <p className="text-[11px] text-muted-foreground">
                                            Sync the order to Shiprocket first to enable AWB
                                            assignment.
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
