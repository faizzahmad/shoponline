import { connectToDb } from "@/lib/connectToDb";
import Order from "@/lib/models/order-model";
import Product from "@/lib/models/product-model";
import User from "@/lib/models/users-model";
import { verifyAuth } from "@/utils/verifyToken";

const LOW_STOCK_THRESHOLD = 10;

function startOfDayUTC(d: Date): Date {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
}

function lastNDatesUTC(n: number): string[] {
    const out: string[] = [];
    const today = startOfDayUTC(new Date());
    for (let i = n - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setUTCDate(day.getUTCDate() - i);
        out.push(day.toISOString().slice(0, 10));
    }
    return out;
}

export async function GET() {
    const isVrefied = await verifyAuth();
    if (!isVrefied.isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectToDb();

    const fourteenDaysAgo = startOfDayUTC(new Date());
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14);

    try {
        const [
            paidAgg,
            pendingAgg,
            allSumAgg,
            unitsAgg,
            revenueByDayRaw,
            ordersByStatus,
            paymentByStatus,
            totalOrders,
            paidOrders,
            totalUsers,
            totalProducts,
            lowStockProducts,
        ] = await Promise.all([
            Order.aggregate<{ _id: null; total: number }>([
                { $match: { paymentStatus: "Paid" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Order.aggregate<{ _id: null; total: number }>([
                { $match: { paymentStatus: { $ne: "Paid" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Order.aggregate<{ _id: null; total: number }>([
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Order.aggregate<{ _id: null; qty: number }>([
                { $unwind: "$items" },
                { $group: { _id: null, qty: { $sum: "$items.quantity" } } },
            ]),
            Order.aggregate<{ _id: string; revenue: number; orders: number }>([
                {
                    $match: {
                        paymentStatus: "Paid",
                        createdAt: { $gte: fourteenDaysAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" },
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Order.aggregate<{ _id: string; count: number }>([
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Order.aggregate<{ _id: string; count: number }>([
                { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Order.countDocuments(),
            Order.countDocuments({ paymentStatus: "Paid" }),
            User.countDocuments(),
            Product.countDocuments(),
            Product.find({ productStock: { $lt: LOW_STOCK_THRESHOLD } })
                .select("productName productId productStock productCategory images")
                .sort({ productStock: 1 })
                .limit(80)
                .lean(),
        ]);

        const revenuePaid = paidAgg[0]?.total ?? 0;
        const revenuePending = pendingAgg[0]?.total ?? 0;
        const totalOrderValue = allSumAgg[0]?.total ?? 0;
        const totalUnitsSold = unitsAgg[0]?.qty ?? 0;
        const averageOrderValuePaid =
            paidOrders > 0 ? Math.round((revenuePaid / paidOrders) * 100) / 100 : 0;

        const byDayMap = new Map(revenueByDayRaw.map((r) => [r._id, r]));
        const dateKeys = lastNDatesUTC(14);
        const revenueByDay = dateKeys.map((date) => {
            const row = byDayMap.get(date);
            const d = new Date(date + "T12:00:00.000Z");
            const label = d.toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
            });
            return {
                date,
                label,
                revenue: row?.revenue ?? 0,
                orders: row?.orders ?? 0,
            };
        });

        const mappedOrdersByStatus = ordersByStatus.map((r) => ({
            status: r._id || "Unknown",
            count: r.count,
        }));
        const mappedPaymentByStatus = paymentByStatus.map((r) => ({
            status: r._id || "Unknown",
            count: r.count,
        }));

        const outOfStockCount = lowStockProducts.filter((p) => p.productStock === 0).length;
        const lowStockCount = lowStockProducts.filter(
            (p) => p.productStock > 0 && p.productStock < LOW_STOCK_THRESHOLD
        ).length;

        const body = {
            summary: {
                revenuePaid,
                revenuePending,
                totalOrderValue,
                totalOrders,
                paidOrders,
                averageOrderValuePaid,
                totalUnitsSold,
                totalUsers,
                totalProducts,
                lowStockCount,
                outOfStockCount,
            },
            revenueByDay,
            ordersByStatus: mappedOrdersByStatus,
            paymentByStatus: mappedPaymentByStatus,
            lowStockProducts: lowStockProducts.map((p) => ({
                _id: String(p._id),
                productName: p.productName,
                productId: p.productId ?? "",
                productStock: p.productStock ?? 0,
                productCategory: p.productCategory,
                images: p.images,
            })),
        };

        return new Response(JSON.stringify(body), { status: 200 });
    } catch (error) {
        console.error("dashboard-stats error:", error);
        return new Response(JSON.stringify({ error: "Failed to load dashboard stats" }), {
            status: 500,
        });
    }
}
