import mongoose from "mongoose";
import Order from "../../orders/model/order.model.js";
import User from "../../users/user.model.js";
import Franchise from "../../franchises/model/franchise.model.js";
import Outlet from "../../outlets/model/outlet.model.js";
import Device from "../../devices/model/device.model.js";
import { getRedisClient } from "../../../core/cache/redis.client.js";
import { buildTenantKey } from "../../../core/cache/cache.utils.js";

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
  } catch {
    // non-fatal
  }

  const result = await fn();

  try {
    if (redis) await redis.setex(key, ttl, JSON.stringify(result));
  } catch {
    // non-fatal
  }

  return result;
}

function getPeriodStart(period) {
  const now = new Date();
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now - 90 * 24 * 60 * 60 * 1000);
    case "3m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "6m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "12m":
    default: {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
}

function getTrendFormat(period) {
  if (period === "12m" || period === "6m" || period === "3m") return "%Y-%m";
  return "%Y-%m-%d";
}

async function getSuperAdminAnalytics(period = "12m") {
  const periodStart = getPeriodStart(period);

  const [
    totalFranchises,
    activeFranchises,
    totalOutlets,
    activeOutlets,
    totalDevices,
    activeDevices,
    totalUsers,
    usersByRole,
    franchiseGrowth,
    outletsByFranchise,
    devicesByOutlet,
    recentFranchises,
    recentOutlets,
  ] = await Promise.all([
    Franchise.countDocuments({ isDeleted: false }),
    Franchise.countDocuments({ isDeleted: false, status: "ACTIVE" }),
    Outlet.countDocuments({ isDeleted: false }),
    Outlet.countDocuments({ isDeleted: false, status: "ACTIVE" }),
    Device.countDocuments({ isDeleted: false }),
    Device.countDocuments({ isDeleted: false, status: "ACTIVE" }),
    User.countDocuments({ isDeleted: false }),
    User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    Franchise.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Outlet.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$franchiseId", outletCount: { $sum: 1 } } },
      { $sort: { outletCount: -1 } },
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
          outletCount: 1,
        },
      },
    ]),
    Device.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$outletId", deviceCount: { $sum: 1 } } },
      { $sort: { deviceCount: -1 } },
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
          deviceCount: 1,
        },
      },
    ]),
    Franchise.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name brandCode status createdAt")
      .lean(),
    Outlet.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name outletCode status createdAt")
      .lean(),
  ]);

  const usersByRoleMap = Object.fromEntries(
    usersByRole.map((r) => [r._id, r.count]),
  );

  return {
    role: "SUPER_ADMIN",
    summary: {
      totalFranchises,
      activeFranchises,
      inactiveFranchises: totalFranchises - activeFranchises,
      totalOutlets,
      activeOutlets,
      inactiveOutlets: totalOutlets - activeOutlets,
      totalDevices,
      activeDevices,
      inactiveDevices: totalDevices - activeDevices,
      totalUsers,
      usersByRole: usersByRoleMap,
    },
    franchiseGrowth,
    outletsByFranchise,
    devicesByOutlet,
    recentFranchises,
    recentOutlets,
  };
}

async function getFranchiseAdminAnalytics(tenant, period = "30d") {
  const franchiseId = new mongoose.Types.ObjectId(tenant.franchiseId);
  const periodStart = getPeriodStart(period);
  const trendFormat = getTrendFormat(period);

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
      { $match: { franchiseId, createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { franchiseId, createdAt: { $gte: periodStart } } },
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
    Order.aggregate([
      { $match: { franchiseId, createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: { $dateToString: { format: trendFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { franchiseId, createdAt: { $gte: periodStart } } },
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
    Order.aggregate([
      { $match: { franchiseId, createdAt: { $gte: periodStart } } },
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
    Order.aggregate([
      { $match: { franchiseId, createdAt: { $gte: periodStart } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const stats = overallStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  };
  const totalRev = stats.totalRevenue;

  const outletContribution = revenuePerOutlet.map((o) => ({
    ...o,
    contributionPercent:
      totalRev > 0 ? parseFloat(((o.revenue / totalRev) * 100).toFixed(2)) : 0,
  }));

  const statusMap = Object.fromEntries(
    cancellationData.map((s) => [s._id, s.count]),
  );
  const totalOrders = stats.totalOrders;
  const cancelledOrders = statusMap["CREATED"] || 0;
  const cancellationRate =
    totalOrders > 0
      ? parseFloat(((cancelledOrders / totalOrders) * 100).toFixed(2))
      : 0;

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

async function getOutletManagerAnalytics(tenant, period = "7d") {
  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const periodStart = getPeriodStart(period);
  const trendFormat = getTrendFormat(period);
  const isToday = period === "today";

  const [
    periodStats,
    statusBreakdown,
    ordersPerHour,
    revenueTrend,
    topItems,
    categoryRevenue,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { outletId, createdAt: { $gte: periodStart } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { outletId, createdAt: { $gte: periodStart } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    isToday
      ? Order.aggregate([
          { $match: { outletId, createdAt: { $gte: todayStart } } },
          {
            $group: {
              _id: { $hour: "$createdAt" },
              count: { $sum: 1 },
              revenue: { $sum: "$totalAmount" },
            },
          },
          { $sort: { _id: 1 } },
        ])
      : Promise.resolve([]),
    isToday
      ? Promise.resolve([])
      : Order.aggregate([
          { $match: { outletId, createdAt: { $gte: periodStart } } },
          {
            $group: {
              _id: {
                $dateToString: { format: trendFormat, date: "$createdAt" },
              },
              revenue: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
    Order.aggregate([
      { $match: { outletId, createdAt: { $gte: periodStart } } },
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
    Order.aggregate([
      { $match: { outletId, createdAt: { $gte: periodStart } } },
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
  ]);

  const stats = periodStats[0] || { revenue: 0, orders: 0, avgOrderValue: 0 };
  const statusMap = Object.fromEntries(
    statusBreakdown.map((s) => [s._id, s.count]),
  );
  const totalOrders = stats.orders;
  const cancelledOrders = statusMap["CREATED"] || 0;
  const cancellationRate =
    totalOrders > 0
      ? parseFloat(((cancelledOrders / totalOrders) * 100).toFixed(2))
      : 0;
  const peakHour = isToday
    ? ordersPerHour.reduce(
        (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
        null,
      )
    : null;

  return {
    role: "OUTLET_MANAGER",
    summary: {
      revenue: stats.revenue,
      orders: stats.orders,
      avgOrderValue: parseFloat((stats.avgOrderValue || 0).toFixed(2)),
      cancellationRate,
      peakHour: peakHour ? peakHour._id : null,
    },
    statusBreakdown: statusMap,
    ordersPerHour,
    revenueTrend,
    topItems,
    categoryRevenue,
  };
}

async function getKitchenStaffAnalytics(tenant) {
  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [queue, completedToday, ordersPerHour, oldestPending] =
    await Promise.all([
      Order.countDocuments({ outletId, status: "IN_KITCHEN" }),
      Order.countDocuments({
        outletId,
        status: { $in: ["READY", "COMPLETED", "PICKED_UP"] },
        updatedAt: { $gte: todayStart },
      }),
      Order.aggregate([
        { $match: { outletId, createdAt: { $gte: todayStart } } },
        { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.findOne({ outletId, status: "IN_KITCHEN" })
        .sort({ createdAt: 1 })
        .select("createdAt orderNumber")
        .lean(),
    ]);

  const peakHour = ordersPerHour.reduce(
    (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
    null,
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
          waitingMinutes: Math.round(
            (now - new Date(oldestPending.createdAt)) / 60000,
          ),
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
    Order.find({ outletId, status: "READY" })
      .select("orderNumber createdAt")
      .lean(),
    Order.countDocuments({
      outletId,
      status: "PICKED_UP",
      updatedAt: { $gte: todayStart },
    }),
    Order.aggregate([
      { $match: { outletId, createdAt: { $gte: todayStart } } },
      { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const peakHour = ordersPerHour.reduce(
    (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
    null,
  );

  let avgPickupDelay = null;
  if (readyOrders.length > 0) {
    const totalWait = readyOrders.reduce(
      (acc, o) => acc + (now - new Date(o.createdAt)),
      0,
    );
    avgPickupDelay = Math.round(totalWait / readyOrders.length / 60000);
  }

  return {
    role: "PICKUP_STAFF",
    readyCount: readyOrders.length,
    readyOrders: readyOrders.slice(0, 10),
    handedOverToday,
    peakHour: peakHour ? peakHour._id : null,
    ordersPerHour,
    avgPickupDelayMinutes: avgPickupDelay,
  };
}

export async function getAnalyticsOverview(tenant, period) {
  const { role, franchiseId, outletId } = tenant;
  const ttl = TTL[role] || 300;
  const cacheKey = buildTenantKey(
    `analytics:overview:${role}:${period || "default"}`,
    { franchiseId, outletId },
  );

  return withCache(cacheKey, ttl, async () => {
    switch (role) {
      case "SUPER_ADMIN":
        return getSuperAdminAnalytics(period);
      case "FRANCHISE_ADMIN":
        return getFranchiseAdminAnalytics(tenant, period);
      case "OUTLET_MANAGER":
        return getOutletManagerAnalytics(tenant, period);
      case "KITCHEN_STAFF":
        return getKitchenStaffAnalytics(tenant);
      case "PICKUP_STAFF":
        return getPickupStaffAnalytics(tenant);
      default:
        throw new Error(`Unsupported role for analytics: ${role}`);
    }
  });
}
