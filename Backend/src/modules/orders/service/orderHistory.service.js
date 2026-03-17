import mongoose from "mongoose";
import Order from "../model/order.model.js";
import { encodeCursor, decodeCursor, toBoundedLimit } from "../../../shared/utils/pagination.js";
import AppError from "../../../shared/errors/AppError.js";
import env from "../../../config/env.js";

const TZ = env.TIMEZONE || "Asia/Kolkata";

const VALID_PERIODS   = ["today", "yesterday", "7d", "30d", "90d"];
const VALID_STATUSES  = ["CREATED", "IN_KITCHEN", "READY", "COMPLETED", "PICKED_UP"];
const VALID_PAYMENTS  = ["CASH", "CARD", "UPI"];


function localMidnightToUtc(dateStr, tz) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const approxUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(approxUtc);

  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  const localY  = get("year");
  const localM  = get("month");
  const localD  = get("day");
  const localH  = get("hour") % 24;   
  const localMin = get("minute");
  const localS  = get("second");

  // Offset = approxUtc - local representation of approxUtc (in ms)
  const localAsUtc = Date.UTC(localY, localM - 1, localD, localH, localMin, localS);
  const offsetMs   = approxUtc.getTime() - localAsUtc;

  // Midnight UTC for the desired local date
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) + offsetMs);
}

function getPeriodRange(period, dateStr) {
  if (dateStr) {
    // Specific calendar date — full day in local timezone
    const start = localMidnightToUtc(dateStr, TZ);
    const end   = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { start, end, isDateSpecific: true };
  }

  // Rolling period relative to now
  const now = new Date();

  if (period === "today") {
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
    const start    = localMidnightToUtc(todayStr, TZ);
    return { start, end: now, isDateSpecific: true };
  }

  if (period === "yesterday") {
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
    const todayMidnight     = localMidnightToUtc(todayStr, TZ);
    const yesterdayMidnight = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);
    return { start: yesterdayMidnight, end: new Date(todayMidnight.getTime() - 1), isDateSpecific: true };
  }

  const days  = parseInt(period.replace("d", ""), 10);
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end: now, isDateSpecific: false };
}

function buildBaseMatch(tenant, filters) {
  const { role, franchiseId, outletId } = tenant;
  const match = {};

  if (role === "SUPER_ADMIN") {
    if (filters.franchiseId) match.franchiseId = new mongoose.Types.ObjectId(filters.franchiseId);
    if (filters.outletId)    match.outletId    = new mongoose.Types.ObjectId(filters.outletId);
  } else if (role === "FRANCHISE_ADMIN") {
    match.franchiseId = new mongoose.Types.ObjectId(franchiseId);
    if (filters.outletId) match.outletId = new mongoose.Types.ObjectId(filters.outletId);
  } else {
    if (!outletId) throw new AppError("Outlet context required", 403, "OUTLET_REQUIRED");
    match.outletId = new mongoose.Types.ObjectId(outletId);
  }

  const validPeriod = VALID_PERIODS.includes(filters.period) ? filters.period : "7d";
  const { start, end, isDateSpecific } = getPeriodRange(validPeriod, filters.date || null);
  match.createdAt = { $gte: start, $lte: end };

  if (filters.status      && VALID_STATUSES.includes(filters.status))   match.status        = filters.status;
  if (filters.paymentMethod && VALID_PAYMENTS.includes(filters.paymentMethod)) match.paymentMethod = filters.paymentMethod;

  if (filters.search) {
    const num = parseInt(filters.search, 10);
    if (!Number.isNaN(num)) match.orderNumber = num;
  }

  return { match, period: validPeriod, isDateSpecific };
}

export async function getOrdersPage(tenant, filters, cursorStr, limit) {
  const boundedLimit = toBoundedLimit(limit, 20);
  const { match } = buildBaseMatch(tenant, filters);

  const cursor = decodeCursor(cursorStr);
  if (cursor) {
    match.$or = [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: new mongoose.Types.ObjectId(cursor._id) } },
    ];
  }

  const orders = await Order.find(match)
    .sort({ createdAt: -1, _id: -1 })
    .limit(boundedLimit + 1)
    .lean();

  const hasNext = orders.length > boundedLimit;
  const items   = hasNext ? orders.slice(0, boundedLimit) : orders;

  const nextCursor = hasNext
    ? encodeCursor({ createdAt: items[items.length - 1].createdAt, _id: items[items.length - 1]._id })
    : null;

  const baseMatch = { ...match };
  delete baseMatch.$or;
  const totalMatching = await Order.countDocuments(baseMatch);

  return {
    items,
    pagination: { limit: boundedLimit, hasNext, nextCursor, totalMatching },
  };
}

export async function getOrderById(orderId, tenant) {
  const { role, franchiseId, outletId } = tenant;
  const query = { _id: new mongoose.Types.ObjectId(orderId) };

  if (role === "FRANCHISE_ADMIN") {
    query.franchiseId = new mongoose.Types.ObjectId(franchiseId);
  } else if (role !== "SUPER_ADMIN") {
    if (!outletId) throw new AppError("Outlet context required", 403, "OUTLET_REQUIRED");
    query.outletId = new mongoose.Types.ObjectId(outletId);
  }

  const order = await Order.findOne(query).lean();
  if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  return order;
}

export async function getOrderStats(tenant, filters) {
  const { match, isDateSpecific } = buildBaseMatch(tenant, filters);
  const { role } = tenant;

  // Timezone-aware hour (0–23 in local time)
  const hourExpr = { $hour: { date: "$createdAt", timezone: TZ } };

  // Trend: "HH:00" labels for single-day views, "YYYY-MM-DD" for multi-day
  const trendExpr = isDateSpecific
    ? { $dateToString: { format: "%H:00", date: "$createdAt", timezone: TZ } }
    : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } };

  const [summary, statusBreakdown, paymentBreakdown, peakData, trend] = await Promise.all([
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id:           null,
          totalOrders:   { $sum: 1 },
          totalRevenue:  { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          minOrderValue: { $min: "$totalAmount" },
          maxOrderValue: { $max: "$totalAmount" },
        },
      },
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
    ]),
    // Peak hour — numeric 0–23 in local time
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id:     hourExpr,
          count:   { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Trend — string labels ("HH:00" or "YYYY-MM-DD") in local time
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id:     trendExpr,
          count:   { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const s = summary[0] ?? { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, minOrderValue: 0, maxOrderValue: 0 };

  const statusMap  = Object.fromEntries(statusBreakdown.map((x) => [x._id, { count: x.count, revenue: x.revenue }]));
  const paymentMap = Object.fromEntries(paymentBreakdown.map((x) => [x._id, { count: x.count, revenue: x.revenue }]));
  const peakEntry  = peakData.length > 0 ? peakData.reduce((best, h) => (h.count > best.count ? h : best)) : null;

  const statsPayload = {
    summary: {
      totalOrders:   s.totalOrders,
      totalRevenue:  parseFloat(s.totalRevenue.toFixed(2)),
      avgOrderValue: parseFloat((s.avgOrderValue ?? 0).toFixed(2)),
      minOrderValue: parseFloat((s.minOrderValue ?? 0).toFixed(2)),
      maxOrderValue: parseFloat((s.maxOrderValue ?? 0).toFixed(2)),
      // peakHour is an integer 0–23 (local time)
      peakHour: peakEntry ? peakEntry._id : null,
    },
    statusBreakdown:  statusMap,
    paymentBreakdown: paymentMap,
    ordersPerHour:    peakData,   // [{_id: 8, count: 12, revenue: 4200}, ...]
    trend,                        // [{_id: "08:00", count: 12}, ...] or [{_id: "2025-01-15", ...}]
    isDateSpecific,
  };

  if (["SUPER_ADMIN", "FRANCHISE_ADMIN", "OUTLET_MANAGER"].includes(role)) {
    const [topItems, topCategories] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $group: {
            _id:          "$items.itemId",
            name:         { $first: "$items.nameSnapshot" },
            totalSold:    { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.lineTotal" },
            orderCount:   { $sum: 1 },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $lookup: { from: "menuitems", localField: "items.itemId", foreignField: "_id", as: "menuItem" },
        },
        { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
        {
          $lookup: { from: "categories", localField: "menuItem.categoryId", foreignField: "_id", as: "category" },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id:          "$category._id",
            categoryName: { $first: { $ifNull: ["$category.name", "Uncategorized"] } },
            totalSold:    { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.lineTotal" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 8 },
      ]),
    ]);

    statsPayload.topItems      = topItems;
    statsPayload.topCategories = topCategories;
  }

  if (["SUPER_ADMIN", "FRANCHISE_ADMIN"].includes(role) && !filters.outletId) {
    const outletBreakdown = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id:          "$outletId",
          totalOrders:  { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: "outlets", localField: "_id", foreignField: "_id", as: "outlet" } },
      { $unwind: { path: "$outlet", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          outletId:     "$_id",
          name:         { $ifNull: ["$outlet.name", "Unknown"] },
          outletCode:   { $ifNull: ["$outlet.outletCode", ""] },
          totalOrders:  1,
          totalRevenue: 1,
        },
      },
    ]);

    statsPayload.outletBreakdown = outletBreakdown;
  }

  return statsPayload;
}
