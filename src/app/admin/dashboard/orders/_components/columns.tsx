"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type OrderItemLine = {
    productId: string;
    variantId?: string;
    variantAttributes?: Array<{ name: string; value: string }>;
    variantImage?: string;
    quantity: number;
    originalPrice: number;
    discountPrice: number;
    productName: string;
    images: string[];
    productCategory: string;
    productCategoryId: string;
    productSubCategory: string;
    productSubCategoryId: string;
    shortDescription: string;
    longDescription: string;
};

export type OrderRow = {
    _id: string;
    userPhone: string;
    userEmail?: string;
    username: string;
    items: OrderItemLine[];
    totalAmount: number;
    orderDateTime: string;
    couponCode: string | null;
    deliveryAddress: string;
    paymentMethod: string;
    orderStatus: string;
    deliveryStatus: string;
    paymentStatus: string;
    createdAt?: string;
    shiprocketOrderId?: string | null;
    shiprocketShipmentId?: string | number | null;
    shiprocketSyncedAt?: string | null;
    shiprocketSyncError?: string | null;
    awbCode?: string | null;
    courierName?: string | null;
    courierCompanyId?: string | number | null;
    awbAssignedAt?: string | null;
};

export const ORDER_STATUS_OPTIONS = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
] as const;

export const DELIVERY_STATUS_OPTIONS = [
    "Pending",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
] as const;

export const PAYMENT_STATUS_OPTIONS = ["Pending", "Paid", "Failed", "Refunded"] as const;

function mergeOptions(options: readonly string[], current: string): string[] {
    const list = [...options];
    if (current && !list.includes(current)) list.push(current);
    return list;
}

type ColumnParams = {
    updatingId: string | null;
    onOrderStatusChange: (orderId: string, value: string) => void;
    onDeliveryStatusChange: (orderId: string, value: string) => void;
    onPaymentStatusChange: (orderId: string, value: string) => void;
    onViewDetails: (order: OrderRow) => void;
};

export function buildOrderColumns({
    updatingId,
    onOrderStatusChange,
    onDeliveryStatusChange,
    onPaymentStatusChange,
    onViewDetails,
}: ColumnParams): ColumnDef<OrderRow>[] {
    return [
        {
            id: "serial",
            header: "S.No",
            cell: ({ row }) => <span className="pl-2">{row.index + 1}</span>,
        },
        {
            accessorKey: "username",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="pl-2 max-w-[180px]">
                    <div className="font-medium truncate">{row.original.username}</div>
                    <div className="text-xs text-muted-foreground truncate" title={row.original.userPhone}>
                        {row.original.userPhone}
                    </div>
                    {row.original.userEmail ? (
                        <div className="text-xs text-muted-foreground truncate" title={row.original.userEmail}>
                            {row.original.userEmail}
                        </div>
                    ) : null}
                </div>
            ),
        },
        {
            accessorKey: "totalAmount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="pl-2">₹{Number(row.original.totalAmount).toLocaleString("en-IN")}</span>
            ),
        },
        {
            id: "itemsCount",
            header: "Items",
            cell: ({ row }) => <span className="pl-2">{row.original.items?.length ?? 0}</span>,
        },
        {
            accessorKey: "paymentMethod",
            header: "Payment",
            cell: ({ row }) => (
                <span className="pl-2 text-sm">{row.original.paymentMethod}</span>
            ),
        },
        {
            accessorKey: "orderStatus",
            header: "Order status",
            cell: ({ row }) => {
                const id = row.original._id;
                const value = row.original.orderStatus || "Pending";
                const opts = mergeOptions(ORDER_STATUS_OPTIONS, value);
                const busy = updatingId === id;
                return (
                    <Select
                        value={value}
                        disabled={busy}
                        onValueChange={(v) => onOrderStatusChange(id, v)}
                    >
                        <SelectTrigger className="h-9 w-[140px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {opts.map((o) => (
                                <SelectItem key={o} value={o}>
                                    {o}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "deliveryStatus",
            header: "Delivery",
            cell: ({ row }) => {
                const id = row.original._id;
                const value = row.original.deliveryStatus || "Pending";
                const opts = mergeOptions(DELIVERY_STATUS_OPTIONS, value);
                const busy = updatingId === id;
                return (
                    <Select
                        value={value}
                        disabled={busy}
                        onValueChange={(v) => onDeliveryStatusChange(id, v)}
                    >
                        <SelectTrigger className="h-9 w-[140px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {opts.map((o) => (
                                <SelectItem key={o} value={o}>
                                    {o}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "paymentStatus",
            header: "Payment status",
            cell: ({ row }) => {
                const id = row.original._id;
                const value = row.original.paymentStatus || "Pending";
                const opts = mergeOptions(PAYMENT_STATUS_OPTIONS, value);
                const busy = updatingId === id;
                return (
                    <Select
                        value={value}
                        disabled={busy}
                        onValueChange={(v) => onPaymentStatusChange(id, v)}
                    >
                        <SelectTrigger className="h-9 w-[130px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {opts.map((o) => (
                                <SelectItem key={o} value={o}>
                                    {o}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Placed
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const raw = row.original.createdAt || row.original.orderDateTime;
                const d = raw ? new Date(raw) : null;
                return (
                    <span className="pl-2 text-sm whitespace-nowrap">
                        {d && !Number.isNaN(d.getTime()) ? format(d, "dd/MM/yyyy HH:mm") : "—"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button variant="outline" size="sm" onClick={() => onViewDetails(row.original)}>
                    View
                </Button>
            ),
        },
    ];
}
