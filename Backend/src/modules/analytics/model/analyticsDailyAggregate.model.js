import mongoose from "mongoose";

const { Schema } = mongoose;

const analyticsDailyAggregateSchema = new Schema(
  {
    franchiseId: { type: Schema.Types.ObjectId, required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, required: true, index: true },
    date: { type: Date, required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    ordersCount: { type: Number, default: 0 },
    revenueTotal: { type: Number, default: 0 },
    avgOrderValueSum: { type: Number, default: 0 },
    statusCounts: { type: Map, of: Number, default: {} },
    hourlyOrderCounts: { type: Map, of: Number, default: {} },
    hourlyRevenue: { type: Map, of: Number, default: {} },
    itemSalesQty: { type: Map, of: Number, default: {} },
    itemSalesRevenue: { type: Map, of: Number, default: {} },
    itemSalesName: { type: Map, of: String, default: {} },
    categorySalesQty: { type: Map, of: Number, default: {} },
    categorySalesRevenue: { type: Map, of: Number, default: {} },
    categorySalesName: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

analyticsDailyAggregateSchema.index(
  { franchiseId: 1, outletId: 1, dateKey: 1 },
  { unique: true },
);

const AnalyticsDailyAggregate = mongoose.model(
  "AnalyticsDailyAggregate",
  analyticsDailyAggregateSchema,
);

export default AnalyticsDailyAggregate;
