import mongoose from "mongoose";
import AnalyticsDailyAggregate from "../model/analyticsDailyAggregate.model.js";
import MenuItem from "../../menu/model/menuItem.model.js";
import Category from "../../menu/model/category.model.js";
import Outlet from "../../outlets/model/outlet.model.js";

function toDateBucket(inputDate) {
  const date = new Date(inputDate || Date.now());
  const bucket = new Date(date);
  bucket.setHours(0, 0, 0, 0);

  return {
    date: bucket,
    dateKey: bucket.toISOString().slice(0, 10),
    hour: String(date.getHours()),
  };
}

function normalizeMap(value) {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries());
  return value;
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

async function getItemCategoryMeta(items, franchiseId, outletId) {
  const itemIds = [
    ...new Set((items || []).map((item) => String(item.itemId)).filter(Boolean)),
  ].map((id) => new mongoose.Types.ObjectId(id));

  if (itemIds.length === 0) {
    return new Map();
  }

  const menuItems = await MenuItem.find({
    _id: { $in: itemIds },
    franchiseId,
    outletId,
    isDeleted: false,
  })
    .select("_id categoryId")
    .lean();

  const categoryIds = [
    ...new Set(menuItems.map((item) => String(item.categoryId)).filter(Boolean)),
  ].map((id) => new mongoose.Types.ObjectId(id));

  const categories = await Category.find({
    _id: { $in: categoryIds },
    franchiseId,
    outletId,
    isDeleted: false,
  })
    .select("_id name")
    .lean();

  const categoryMap = new Map(categories.map((c) => [String(c._id), c.name]));

  return new Map(
    menuItems.map((item) => {
      const categoryId = String(item.categoryId || "uncategorized");
      return [String(item._id), { categoryId, categoryName: categoryMap.get(categoryId) || "Uncategorized" }];
    }),
  );
}

export async function recordOrderPlacedAggregate(payload) {
  const {
    franchiseId,
    outletId,
    createdAt,
    totalAmount,
    status = "CREATED",
    items = [],
  } = payload;

  if (!franchiseId || !outletId) return;

  const ids = {
    franchiseId: new mongoose.Types.ObjectId(franchiseId),
    outletId: new mongoose.Types.ObjectId(outletId),
  };

  const { date, dateKey, hour } = toDateBucket(createdAt);
  const categoryMeta = await getItemCategoryMeta(items, ids.franchiseId, ids.outletId);

  const inc = {
    ordersCount: 1,
    revenueTotal: totalAmount || 0,
    avgOrderValueSum: totalAmount || 0,
    [`statusCounts.${status}`]: 1,
    [`hourlyOrderCounts.${hour}`]: 1,
    [`hourlyRevenue.${hour}`]: totalAmount || 0,
  };

  const set = {};

  for (const item of items) {
    const itemId = String(item.itemId);
    if (!itemId) continue;

    inc[`itemSalesQty.${itemId}`] = (inc[`itemSalesQty.${itemId}`] || 0) + (item.quantity || 0);
    inc[`itemSalesRevenue.${itemId}`] =
      (inc[`itemSalesRevenue.${itemId}`] || 0) + (item.lineTotal || 0);
    set[`itemSalesName.${itemId}`] = item.nameSnapshot || "Item";

    const meta = categoryMeta.get(itemId) || {
      categoryId: "uncategorized",
      categoryName: "Uncategorized",
    };

    inc[`categorySalesQty.${meta.categoryId}`] =
      (inc[`categorySalesQty.${meta.categoryId}`] || 0) + (item.quantity || 0);
    inc[`categorySalesRevenue.${meta.categoryId}`] =
      (inc[`categorySalesRevenue.${meta.categoryId}`] || 0) + (item.lineTotal || 0);
    set[`categorySalesName.${meta.categoryId}`] = meta.categoryName;
  }

  await AnalyticsDailyAggregate.findOneAndUpdate(
    {
      franchiseId: ids.franchiseId,
      outletId: ids.outletId,
      dateKey,
    },
    {
      $setOnInsert: {
        franchiseId: ids.franchiseId,
        outletId: ids.outletId,
        date,
        dateKey,
      },
      $inc: inc,
      $set: set,
    },
    { upsert: true },
  );
}

export async function recordOrderStatusChangeAggregate(payload) {
  const { franchiseId, outletId, createdAt, fromStatus, toStatus } = payload;

  if (!franchiseId || !outletId || !fromStatus || !toStatus || fromStatus === toStatus) {
    return;
  }

  const ids = {
    franchiseId: new mongoose.Types.ObjectId(franchiseId),
    outletId: new mongoose.Types.ObjectId(outletId),
  };

  const { dateKey } = toDateBucket(createdAt);

  await AnalyticsDailyAggregate.findOneAndUpdate(
    {
      franchiseId: ids.franchiseId,
      outletId: ids.outletId,
      dateKey,
    },
    {
      $inc: {
        [`statusCounts.${fromStatus}`]: -1,
        [`statusCounts.${toStatus}`]: 1,
      },
    },
    { upsert: false },
  );
}

function mergeMapIntoCounter(counter, mapValue) {
  const mapObject = normalizeMap(mapValue);
  for (const [key, value] of Object.entries(mapObject)) {
    counter.set(key, (counter.get(key) || 0) + (value || 0));
  }
}

function mergeNameMap(nameMap, mapValue) {
  const mapObject = normalizeMap(mapValue);
  for (const [key, value] of Object.entries(mapObject)) {
    if (value) nameMap.set(key, value);
  }
}

function sortTopEntries(valueMap, valueNameMap, qtyMap, limit = 5) {
  return [...valueMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, revenue]) => ({
      _id: id,
      name: valueNameMap.get(id) || "Unknown",
      totalSold: qtyMap.get(id) || 0,
      totalRevenue: revenue,
    }));
}

export async function getOutletManagerAnalyticsFromAggregates(tenant, period = "7d") {
  const franchiseId = new mongoose.Types.ObjectId(tenant.franchiseId);
  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const periodStart = getPeriodStart(period);
  const isToday = period === "today";

  const docs = await AnalyticsDailyAggregate.find({
    franchiseId,
    outletId,
    date: { $gte: periodStart },
  })
    .sort({ date: 1 })
    .lean();

  if (docs.length === 0) return null;

  const summary = { revenue: 0, orders: 0, avgOrderValueSum: 0 };
  const statusCounter = new Map();
  const topQty = new Map();
  const topRevenue = new Map();
  const topNames = new Map();
  const categoryQty = new Map();
  const categoryRevenue = new Map();
  const categoryNames = new Map();
  const ordersPerHourMap = new Map();
  const revenueTrend = [];

  for (const doc of docs) {
    summary.revenue += doc.revenueTotal || 0;
    summary.orders += doc.ordersCount || 0;
    summary.avgOrderValueSum += doc.avgOrderValueSum || 0;

    mergeMapIntoCounter(statusCounter, doc.statusCounts);
    mergeMapIntoCounter(topQty, doc.itemSalesQty);
    mergeMapIntoCounter(topRevenue, doc.itemSalesRevenue);
    mergeNameMap(topNames, doc.itemSalesName);
    mergeMapIntoCounter(categoryQty, doc.categorySalesQty);
    mergeMapIntoCounter(categoryRevenue, doc.categorySalesRevenue);
    mergeNameMap(categoryNames, doc.categorySalesName);

    if (isToday) {
      mergeMapIntoCounter(ordersPerHourMap, doc.hourlyOrderCounts);
    } else {
      revenueTrend.push({
        _id: doc.dateKey,
        revenue: doc.revenueTotal || 0,
        orders: doc.ordersCount || 0,
      });
    }
  }

  const ordersPerHour = isToday
    ? [...ordersPerHourMap.entries()]
        .map(([hour, count]) => ({ _id: Number(hour), count, revenue: 0 }))
        .sort((a, b) => a._id - b._id)
    : [];

  const peakHour = ordersPerHour.reduce(
    (peak, h) => (h.count > (peak?.count || 0) ? h : peak),
    null,
  );

  const statusBreakdown = Object.fromEntries(statusCounter.entries());
  const cancelledOrders = statusBreakdown.CREATED || 0;
  const cancellationRate =
    summary.orders > 0
      ? parseFloat(((cancelledOrders / summary.orders) * 100).toFixed(2))
      : 0;

  const topItems = sortTopEntries(topRevenue, topNames, topQty, 5);
  const categoryRevenueRows = [...categoryRevenue.entries()]
    .map(([categoryId, revenue]) => ({
      _id: categoryId,
      categoryName: categoryNames.get(categoryId) || "Uncategorized",
      revenue,
      itemsSold: categoryQty.get(categoryId) || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    role: "OUTLET_MANAGER",
    summary: {
      revenue: summary.revenue,
      orders: summary.orders,
      avgOrderValue:
        summary.orders > 0
          ? parseFloat((summary.avgOrderValueSum / summary.orders).toFixed(2))
          : 0,
      cancellationRate,
      peakHour: peakHour ? peakHour._id : null,
    },
    statusBreakdown,
    ordersPerHour,
    revenueTrend,
    topItems,
    categoryRevenue: categoryRevenueRows,
  };
}

export async function getFranchiseAdminAnalyticsFromAggregates(
  tenant,
  period = "30d",
) {
  const franchiseId = new mongoose.Types.ObjectId(tenant.franchiseId);
  const periodStart = getPeriodStart(period);

  const docs = await AnalyticsDailyAggregate.find({
    franchiseId,
    date: { $gte: periodStart },
  })
    .sort({ date: 1 })
    .lean();

  if (docs.length === 0) return null;

  const summary = { revenue: 0, orders: 0, avgOrderValueSum: 0 };
  const outletCounter = new Map();
  const statusCounter = new Map();
  const topQty = new Map();
  const topRevenue = new Map();
  const topNames = new Map();
  const categoryQty = new Map();
  const categoryRevenue = new Map();
  const categoryNames = new Map();
  const trendMap = new Map();

  for (const doc of docs) {
    summary.revenue += doc.revenueTotal || 0;
    summary.orders += doc.ordersCount || 0;
    summary.avgOrderValueSum += doc.avgOrderValueSum || 0;

    const outletId = String(doc.outletId);
    const prev = outletCounter.get(outletId) || { revenue: 0, orders: 0 };
    outletCounter.set(outletId, {
      revenue: prev.revenue + (doc.revenueTotal || 0),
      orders: prev.orders + (doc.ordersCount || 0),
    });

    const trend = trendMap.get(doc.dateKey) || { revenue: 0, orders: 0 };
    trendMap.set(doc.dateKey, {
      revenue: trend.revenue + (doc.revenueTotal || 0),
      orders: trend.orders + (doc.ordersCount || 0),
    });

    mergeMapIntoCounter(statusCounter, doc.statusCounts);
    mergeMapIntoCounter(topQty, doc.itemSalesQty);
    mergeMapIntoCounter(topRevenue, doc.itemSalesRevenue);
    mergeNameMap(topNames, doc.itemSalesName);
    mergeMapIntoCounter(categoryQty, doc.categorySalesQty);
    mergeMapIntoCounter(categoryRevenue, doc.categorySalesRevenue);
    mergeNameMap(categoryNames, doc.categorySalesName);
  }

  const totalOutlets = await Outlet.countDocuments({ franchiseId, isDeleted: false });

  const outletIds = [...outletCounter.keys()].map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const outletDetails = await Outlet.find({
    _id: { $in: outletIds },
    franchiseId,
    isDeleted: false,
  })
    .select("_id name outletCode")
    .lean();

  const outletNameMap = new Map(
    outletDetails.map((o) => [String(o._id), { name: o.name, outletCode: o.outletCode }]),
  );

  const outletBreakdown = [...outletCounter.entries()]
    .map(([outletId, value]) => ({
      outletId,
      name: outletNameMap.get(outletId)?.name || "Unknown Outlet",
      outletCode: outletNameMap.get(outletId)?.outletCode || "N/A",
      revenue: value.revenue,
      orders: value.orders,
      contributionPercent:
        summary.revenue > 0
          ? parseFloat(((value.revenue / summary.revenue) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const revenueTrend = [...trendMap.entries()]
    .map(([dateKey, value]) => ({ _id: dateKey, ...value }))
    .sort((a, b) => (a._id > b._id ? 1 : -1));

  const topItems = sortTopEntries(topRevenue, topNames, topQty, 5);
  const categoryRevenueRows = [...categoryRevenue.entries()]
    .map(([categoryId, revenue]) => ({
      _id: categoryId,
      categoryName: categoryNames.get(categoryId) || "Uncategorized",
      revenue,
      itemsSold: categoryQty.get(categoryId) || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const statusBreakdown = Object.fromEntries(statusCounter.entries());
  const cancelledOrders = statusBreakdown.CREATED || 0;
  const cancellationRate =
    summary.orders > 0
      ? parseFloat(((cancelledOrders / summary.orders) * 100).toFixed(2))
      : 0;

  return {
    role: "FRANCHISE_ADMIN",
    summary: {
      totalOutlets,
      totalUsers: 0,
      totalRevenue: summary.revenue,
      totalOrders: summary.orders,
      avgOrderValue:
        summary.orders > 0
          ? parseFloat((summary.avgOrderValueSum / summary.orders).toFixed(2))
          : 0,
      cancellationRate,
    },
    revenueTrend,
    outletBreakdown,
    topItems,
    categoryRevenue: categoryRevenueRows,
    statusBreakdown,
  };
}

export async function resetDailyAggregate(dateKey) {
  await AnalyticsDailyAggregate.deleteMany({ dateKey });
}

export function toAnalyticsDateKey(inputDate) {
  return toDateBucket(inputDate).dateKey;
}
