"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    AlertTriangle,
    IndianRupee,
    Loader,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";
import { fetchData } from "@/utils/apiCall";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DashboardStats = {
    summary: {
        revenuePaid: number;
        revenuePending: number;
        totalOrderValue: number;
        totalOrders: number;
        paidOrders: number;
        averageOrderValuePaid: number;
        totalUnitsSold: number;
        totalUsers: number;
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
    revenueByDay: { date: string; label: string; revenue: number; orders: number }[];
    ordersByStatus: { status: string; count: number }[];
    paymentByStatus: { status: string; count: number }[];
    lowStockProducts: {
        _id: string;
        productName: string;
        productId: string;
        productStock: number;
        productCategory: string;
        images?: string[];
    }[];
};

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#64748b"];

function formatINR(n: number) {
    return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function StatCard({
    title,
    value,
    hint,
    icon: Icon,
}: {
    title: string;
    value: string;
    hint?: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-tight text-neutral-900">{value}</div>
                {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
            </CardContent>
        </Card>
    );
}

export function DashboardHome() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchData<DashboardStats>("dashboard-stats");
                if (!cancelled) setData(res);
            } catch {
                if (!cancelled) setError("Could not load dashboard data.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted-foreground">
                <Loader className="h-8 w-8 animate-spin" />
                Loading dashboard…
            </div>
        );
    }

    if (error || !data) {
        return (
            <Alert variant="destructive" className="max-w-lg">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error ?? "Unknown error"}</AlertDescription>
            </Alert>
        );
    }

    const { summary } = data;
    const stockAlert =
        summary.outOfStockCount > 0 || summary.lowStockCount > 0 || data.lowStockProducts.length > 0;

    return (
        <div className="space-y-8 max-w-[1600px]">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Revenue, orders, inventory alerts, and trends for your store.
                </p>
            </div>

            {stockAlert ? (
                <Alert
                    className="border-amber-200 bg-amber-50/80 text-amber-950 [&>svg]:text-amber-700"
                    variant="default"
                >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Inventory attention</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                        {summary.outOfStockCount > 0 ? (
                            <span>
                                <strong>{summary.outOfStockCount}</strong> product
                                {summary.outOfStockCount !== 1 ? "s" : ""} out of stock
                            </span>
                        ) : null}
                        {summary.lowStockCount > 0 ? (
                            <span>
                                <strong>{summary.lowStockCount}</strong> with stock under 10 units
                            </span>
                        ) : null}
                        <Button asChild variant="outline" size="sm" className="shrink-0 border-amber-300">
                            <Link href="/admin/dashboard/products">Manage products</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Revenue (paid)"
                    value={formatINR(summary.revenuePaid)}
                    hint={`${summary.paidOrders} paid orders`}
                    icon={IndianRupee}
                />
                <StatCard
                    title="Total orders"
                    value={summary.totalOrders.toLocaleString("en-IN")}
                    hint="All payment statuses"
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Units sold"
                    value={summary.totalUnitsSold.toLocaleString("en-IN")}
                    hint="Sum of quantities across orders"
                    icon={Package}
                />
                <StatCard
                    title="Avg. order (paid)"
                    value={formatINR(summary.averageOrderValuePaid)}
                    hint={summary.paidOrders === 0 ? "No paid orders yet" : undefined}
                    icon={TrendingUp}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total order value"
                    value={formatINR(summary.totalOrderValue)}
                    hint="Gross of all orders"
                    icon={IndianRupee}
                />
                <StatCard
                    title="Pending payments"
                    value={formatINR(summary.revenuePending)}
                    hint="Unpaid / non-paid orders"
                    icon={Wallet}
                />
                <StatCard
                    title="Customers"
                    value={summary.totalUsers.toLocaleString("en-IN")}
                    hint="Users in database"
                    icon={Users}
                />
                <StatCard
                    title="Products"
                    value={summary.totalProducts.toLocaleString("en-IN")}
                    hint="Active catalog size"
                    icon={Package}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-neutral-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Revenue (paid)</CardTitle>
                        <CardDescription>Last 14 days, UTC</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {data.revenueByDay.some((d) => d.revenue > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.revenueByDay}>
                                    <defs>
                                        <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v) => {
                                            const n = Number(v);
                                            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
                                            if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
                                            return `₹${n}`;
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [formatINR(value), "Revenue"]}
                                        labelFormatter={(_, payload) =>
                                            payload?.[0]?.payload?.date ?? ""
                                        }
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#4f46e5"
                                        fill="url(#fillRev)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No paid revenue in the last 14 days.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Payment status</CardTitle>
                        <CardDescription>Order count by payment state</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {data.paymentByStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.paymentByStatus}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={96}
                                        label={({ name, percent }) =>
                                            `${String(name)} ${((percent ?? 0) * 100).toFixed(0)}%`
                                        }
                                    >
                                        {data.paymentByStatus.map((_, i) => (
                                            <Cell
                                                key={`cell-${i}`}
                                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No orders yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-neutral-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Orders by status</CardTitle>
                    <CardDescription>Fulfillment pipeline</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                    {data.ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.ordersByStatus} layout="vertical" margin={{ left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis
                                    type="category"
                                    dataKey="status"
                                    width={100}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No orders yet.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-neutral-200 shadow-sm">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                    <div>
                        <CardTitle>Low stock &amp; out of stock</CardTitle>
                        <CardDescription>Products with stock below 10 units</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/dashboard/products">Open products</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {data.lowStockProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                            All products are at 10+ units. Nothing to restock here.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left">
                                        <th className="p-3 font-medium">Product</th>
                                        <th className="p-3 font-medium">Category</th>
                                        <th className="p-3 font-medium">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lowStockProducts.map((p) => (
                                        <tr key={p._id} className="border-b last:border-0">
                                            <td className="p-3">
                                                <div className="font-medium text-neutral-900">
                                                    {p.productName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {p.productId}
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground">
                                                {p.productCategory}
                                            </td>
                                            <td className="p-3">
                                                {p.productStock === 0 ? (
                                                    <Badge variant="destructive">Out of stock</Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-amber-100 text-amber-950 hover:bg-amber-100"
                                                    >
                                                        {p.productStock} left
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
