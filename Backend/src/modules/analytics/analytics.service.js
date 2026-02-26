import mongoose from "mongoose";
import Order from "../orders/order.model.js";
import User from "../users/user.model.js";
import Franchise from "../franchises/franchise.model.js";
import Outlet from "../outlets/outlet.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";

const TTL = {
    SUPER_ADMIN: 900,
    FRANCHISE_ADMIN: 300,
    OUTLET_MANAGER: 120,
    KITCHEN_STAFF: 60,
    PICKUP_STAFF: 60,
};

async function withCache(key, ttl, fn) {
    let redis;
    try {
        redis = getRedisClient();
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached);
    } catch (_) {
    }

    const result = await fn();

    try {
        if (redis) await redis.setex(key, ttl, JSON.stringify(result));
    } catch (_) {
        // Silently ignore cache write failures
    }

    return result;
}

async function getSuperAdminAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfWeek - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
        totalFranchises,
        totalOutlets,
        usersByRole,
        overallStats,
        revenueTrend,
        ordersTrend,
        topFranchises,
        topOutlets,
        topItems,
        weekComparison,
        thisMonthRevenue,
        lastMonthRevenue,
    ] = await Promise.all([
        Franchise.countDocuments({ isDeleted: false }),
        Outlet.countDocuments({ isDeleted: false }),

        User.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]),

        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalAmount" },
                },
            },
        ]),

        // Revenue trend last 30 days
        Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // Orders trend last 30 days (same as above, keeping semantic clarity)
        Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // Top 5 franchises by revenue
        Order.aggregate([
            {
                $group: {
                    _id: "$franchiseId",
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "franchises",
                    localField: "_id",
                    foreignField: "_id",
                    as: "franchise",
                },
            },
            { $unwind: { path: "$franchise", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    franchiseId: "$_id",
                    name: "$franchise.name",
                    brandCode: "$franchise.brandCode",
                    revenue: 1,
                    orders: 1,
                },
            },
        ]),

        // Top 5 outlets by revenue
        Order.aggregate([
            {
                $group: {
                    _id: "$outletId",
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "outlets",
                    localField: "_id",
                    foreignField: "_id",
                    as: "outlet",
                },
            },
            { $unwind: { path: "$outlet", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    outletId: "$_id",
                    name: "$outlet.name",
                    outletCode: "$outlet.outletCode",
                    revenue: 1,
                    orders: 1,
                },
            },
        ]),

        // Top 10 selling items (global)
        Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.itemId",
                    name: { $first: "$items.nameSnapshot" },
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.lineTotal" },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ]),

        // This week vs last week revenue
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastWeek },
                },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gte: ["$createdAt", startOfWeek] },
                            "thisWeek",
                            "lastWeek",
                        ],
                    },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
        ]),

        // This month revenue
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
        ]),

        // Last month revenue
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
        ]),
    ]);

    const stats = overallStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const usersByRoleMap = Object.fromEntries(usersByRole.map((r) => [r._id, r.count]));

    const thisWeekData = weekComparison.find((w) => w._id === "thisWeek") || { revenue: 0, orders: 0 };
    const lastWeekData = weekComparison.find((w) => w._id === "lastWeek") || { revenue: 0, orders: 0 };

    const thisMonthRev = thisMonthRevenue[0]?.revenue || 0;
    const lastMonthRev = lastMonthRevenue[0]?.revenue || 0;
    const monthlyGrowth = lastMonthRev === 0
        ? 100
        : parseFloat((((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(2));

    return {
        role: "SUPER_ADMIN",
        summary: {
            totalFranchises,
            totalOutlets,
            usersByRole: usersByRoleMap,
            totalRevenue: stats.totalRevenue,
            totalOrders: stats.totalOrders,
            avgOrderValue: parseFloat((stats.avgOrderValue || 0).toFixed(2)),
        },
        trends: {
            revenueLast30Days: revenueTrend,
            ordersLast30Days: ordersTrend,
        },
        weekComparison: {
            thisWeek: thisWeekData,
            lastWeek: lastWeekData,
            revenueGrowth:
                lastWeekData.revenue === 0
                    ? 100
                    : parseFloat((((thisWeekData.revenue - lastWeekData.revenue) / lastWeekData.revenue) * 100).toFixed(2)),
        },
        monthlyGrowth,
        topFranchises,
        topOutlets,
        topItems,
    };
}

async function getFranchiseAdminAnalytics(tenant) {
    const franchiseId = new mongoose.Types.ObjectId(tenant.franchiseId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
        totalOutlets,
        totalUsers,
        overallStats,
        revenuePerOutlet,
        revenueTrend,
        topItems,
        categoryRevenue,
        cancellationData,
    ] = await Promise.all([
        Outlet.countDocuments({ franchiseId, isDeleted: false }),
        User.countDocuments({ franchiseId, isDeleted: false }),

        Order.aggregate([
            { $match: { franchiseId } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalAmount" },
                },
            },
        ]),

        // Revenue and orders per outlet
        Order.aggregate([
            { $match: { franchiseId } },
            {
                $group: {
                    _id: "$outletId",
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "outlets",
                    localField: "_id",
                    foreignField: "_id",
                    as: "outlet",
                },
            },
            { $unwind: { path: "$outlet", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    outletId: "$_id",
                    name: "$outlet.name",
                    outletCode: "$outlet.outletCode",
                    revenue: 1,
                    orders: 1,
                },
            },
            { $sort: { revenue: -1 } },
        ]),

        // Revenue trend last 30 days
        Order.aggregate([
            { $match: { franchiseId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // Top 5 selling items in franchise
        Order.aggregate([
            { $match: { franchiseId } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.itemId",
                    name: { $first: "$items.nameSnapshot" },
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.lineTotal" },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
        ]),

        // Category-wise revenue (via items lookup)
        Order.aggregate([
            { $match: { franchiseId } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "menuitems",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "menuItem",
                },
            },
            { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "menuItem.categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    revenue: { $sum: "$items.lineTotal" },
                    itemsSold: { $sum: "$items.quantity" },
                },
            },
            { $sort: { revenue: -1 } },
        ]),

        // Cancellation rate (CREATED orders that never progressed — we'll use total vs completed)
        Order.aggregate([
            { $match: { franchiseId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);

    const stats = overallStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const totalRev = stats.totalRevenue;

    // Outlet revenue contribution %
    const outletContribution = revenuePerOutlet.map((o) => ({
        ...o,
        contributionPercent: totalRev > 0 ? parseFloat(((o.revenue / totalRev) * 100).toFixed(2)) : 0,
    }));

    const statusMap = Object.fromEntries(cancellationData.map((s) => [s._id, s.count]));
    const totalOrders = stats.totalOrders;
    const cancelledOrders = statusMap["CREATED"] || 0; // orders stuck at CREATED are stale/cancelled-equivalent
    const cancellationRate = totalOrders > 0 ? parseFloat(((cancelledOrders / totalOrders) * 100).toFixed(2)) : 0;

    return {
        role: "FRANCHISE_ADMIN",
        summary: {
            totalOutlets,
            totalUsers,
            totalRevenue: stats.totalRevenue,
            totalOrders,
            avgOrderValue: parseFloat((stats.avgOrderValue || 0).toFixed(2)),
            cancellationRate,
        },
        revenueTrend,
        outletBreakdown: outletContribution,
        topItems,
        categoryRevenue,
        statusBreakdown: statusMap,
    };
}

async function getOutletManagerAnalytics(tenant) {
    const outletId = new mongoose.Types.ObjectId(tenant.outletId);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
        todayStats,
        statusBreakdown,
        ordersPerHour,
        revenueLast7Days,
        topItems,
        categoryRevenue,
        allTimeStats,
    ] = await Promise.all([
        // Today summary
        Order.aggregate([
            { $match: { outletId, createdAt: { $gte: todayStart } } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalAmount" },
                },
            },
        ]),

        // Status breakdown (all time for outlet)
        Order.aggregate([
            { $match: { outletId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // Orders per hour today
        Order.aggregate([
            { $match: { outletId, createdAt: { $gte: todayStart } } },
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // Revenue last 7 days
        Order.aggregate([
            { $match: { outletId, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // Top 5 items
        Order.aggregate([
            { $match: { outletId } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.itemId",
                    name: { $first: "$items.nameSnapshot" },
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.lineTotal" },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
        ]),

        // Category revenue
        Order.aggregate([
            { $match: { outletId } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "menuitems",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "menuItem",
                },
            },
            { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "menuItem.categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    revenue: { $sum: "$items.lineTotal" },
                    itemsSold: { $sum: "$items.quantity" },
                },
            },
            { $sort: { revenue: -1 } },
        ]),

        // All-time stats for cancellation rate
        Order.aggregate([
            { $match: { outletId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
    ]);

    const today = todayStats[0] || { revenue: 0, orders: 0, avgOrderValue: 0 };
    const statusMap = Object.fromEntries(statusBreakdown.map((s) => [s._id, s.count]));
    const allTimeStatusMap = Object.fromEntries(allTimeStats.map((s) => [s._id, s.count]));
    const totalAllTime = Object.values(allTimeStatusMap).reduce((a, b) => a + b, 0);
    const cancelledCount = allTimeStatusMap["CREATED"] || 0;
    const cancellationRate = totalAllTime > 0 ? parseFloat(((cancelledCount / totalAllTime) * 100).toFixed(2)) : 0;

    // Peak hour today
    const peakHour = ordersPerHour.reduce(
        (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
        null
    );

    return {
        role: "OUTLET_MANAGER",
        today: {
            revenue: today.revenue,
            orders: today.orders,
            avgOrderValue: parseFloat((today.avgOrderValue || 0).toFixed(2)),
        },
        statusBreakdown: statusMap,
        ordersPerHour,
        revenueLast7Days,
        topItems,
        categoryRevenue,
        cancellationRate,
        peakHour: peakHour ? peakHour._id : null,
    };
}

async function getKitchenStaffAnalytics(tenant) {
    const outletId = new mongoose.Types.ObjectId(tenant.outletId);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [queue, completedToday, ordersPerHour, oldestPending] = await Promise.all([
        Order.countDocuments({ outletId, status: "IN_KITCHEN" }),
        Order.countDocuments({ outletId, status: { $in: ["READY", "COMPLETED", "PICKED_UP"] }, updatedAt: { $gte: todayStart } }),

        Order.aggregate([
            { $match: { outletId, createdAt: { $gte: todayStart } } },
            { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),

        Order.findOne({ outletId, status: "IN_KITCHEN" }).sort({ createdAt: 1 }).select("createdAt orderNumber").lean(),
    ]);

    const peakHour = ordersPerHour.reduce(
        (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
        null
    );

    const avgPrepTime = oldestPending
        ? Math.round((now - new Date(oldestPending.createdAt)) / 60000)
        : null;

    return {
        role: "KITCHEN_STAFF",
        queueCount: queue,
        completedToday,
        peakHour: peakHour ? peakHour._id : null,
        ordersPerHour,
        oldestPendingOrder: oldestPending
            ? {
                orderNumber: oldestPending.orderNumber,
                createdAt: oldestPending.createdAt,
                waitingMinutes: Math.round((now - new Date(oldestPending.createdAt)) / 60000),
            }
            : null,
        avgPrepTimeMinutes: avgPrepTime,
    };
}

async function getPickupStaffAnalytics(tenant) {
    const outletId = new mongoose.Types.ObjectId(tenant.outletId);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [readyOrders, handedOverToday, ordersPerHour] = await Promise.all([
        Order.find({ outletId, status: "READY" }).select("orderNumber createdAt").lean(),
        Order.countDocuments({ outletId, status: "PICKED_UP", updatedAt: { $gte: todayStart } }),

        Order.aggregate([
            { $match: { outletId, createdAt: { $gte: todayStart } } },
            { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const peakHour = ordersPerHour.reduce(
        (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
        null
    );

    // Average pickup delay = average time READY orders have been waiting
    let avgPickupDelay = null;
    if (readyOrders.length > 0) {
        const totalWait = readyOrders.reduce((acc, o) => acc + (now - new Date(o.createdAt)), 0);
        avgPickupDelay = Math.round(totalWait / readyOrders.length / 60000);
    }

    return {
        role: "PICKUP_STAFF",
        readyCount: readyOrders.length,
        readyOrders: readyOrders.slice(0, 10), // show up to 10
        handedOverToday,
        peakHour: peakHour ? peakHour._id : null,
        ordersPerHour,
        avgPickupDelayMinutes: avgPickupDelay,
    };
}

export async function getAnalyticsOverview(tenant) {
    const { role, franchiseId, outletId } = tenant;
    const ttl = TTL[role] || 300;

    const cacheKey = buildTenantKey(`analytics:overview:${role}`, { franchiseId, outletId });

    return withCache(cacheKey, ttl, async () => {
        switch (role) {
            case "SUPER_ADMIN":
                return getSuperAdminAnalytics();
            case "FRANCHISE_ADMIN":
                return getFranchiseAdminAnalytics(tenant);
            case "OUTLET_MANAGER":
                return getOutletManagerAnalytics(tenant);
            case "KITCHEN_STAFF":
                return getKitchenStaffAnalytics(tenant);
            case "PICKUP_STAFF":
                return getPickupStaffAnalytics(tenant);
            default:
                throw new Error(`Unsupported role for analytics: ${role}`);
        }
    });
}
