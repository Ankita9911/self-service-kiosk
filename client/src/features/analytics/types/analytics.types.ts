export interface TrendPoint {
    _id: string; 
    revenue?: number;
    orders?: number;
    count?: number;
}

export interface HourPoint {
    _id: number; 
    count: number;
    revenue?: number;
}

export interface TopItem {
    _id: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
}

export interface CategoryRevenue {
    _id: string;
    categoryName: string;
    revenue: number;
    itemsSold: number;
}

export interface SuperAdminAnalytics {
    role: "SUPER_ADMIN";
    summary: {
        totalFranchises: number;
        totalOutlets: number;
        usersByRole: Record<string, number>;
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
    };
    trends: {
        revenueLast30Days: TrendPoint[];
        ordersLast30Days: TrendPoint[];
    };
    weekComparison: {
        thisWeek: { revenue: number; orders: number };
        lastWeek: { revenue: number; orders: number };
        revenueGrowth: number;
    };
    monthlyGrowth: number;
    topFranchises: Array<{
        franchiseId: string;
        name: string;
        brandCode: string;
        revenue: number;
        orders: number;
    }>;
    topOutlets: Array<{
        outletId: string;
        name: string;
        outletCode: string;
        revenue: number;
        orders: number;
    }>;
    topItems: TopItem[];
}

export interface FranchiseAdminAnalytics {
    role: "FRANCHISE_ADMIN";
    summary: {
        totalOutlets: number;
        totalUsers: number;
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
        cancellationRate: number;
    };
    revenueTrend: TrendPoint[];
    outletBreakdown: Array<{
        outletId: string;
        name: string;
        outletCode: string;
        revenue: number;
        orders: number;
        contributionPercent: number;
    }>;
    topItems: TopItem[];
    categoryRevenue: CategoryRevenue[];
    statusBreakdown: Record<string, number>;
}

export interface OutletManagerAnalytics {
    role: "OUTLET_MANAGER";
    today: {
        revenue: number;
        orders: number;
        avgOrderValue: number;
    };
    statusBreakdown: Record<string, number>;
    ordersPerHour: HourPoint[];
    revenueLast7Days: TrendPoint[];
    topItems: TopItem[];
    categoryRevenue: CategoryRevenue[];
    cancellationRate: number;
    peakHour: number | null;
}

export interface KitchenStaffAnalytics {
    role: "KITCHEN_STAFF";
    queueCount: number;
    completedToday: number;
    peakHour: number | null;
    ordersPerHour: HourPoint[];
    oldestPendingOrder: {
        orderNumber: number;
        createdAt: string;
        waitingMinutes: number;
    } | null;
    avgPrepTimeMinutes: number | null;
}


export interface PickupStaffAnalytics {
    role: "PICKUP_STAFF";
    readyCount: number;
    readyOrders: Array<{ _id: string; orderNumber: number; createdAt: string }>;
    handedOverToday: number;
    peakHour: number | null;
    ordersPerHour: HourPoint[];
    avgPickupDelayMinutes: number | null;
}

export type AnalyticsData =
    | SuperAdminAnalytics
    | FranchiseAdminAnalytics
    | OutletManagerAnalytics
    | KitchenStaffAnalytics
    | PickupStaffAnalytics;
