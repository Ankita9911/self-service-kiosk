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
        activeFranchises: number;
        inactiveFranchises: number;
        totalOutlets: number;
        activeOutlets: number;
        inactiveOutlets: number;
        totalDevices: number;
        activeDevices: number;
        inactiveDevices: number;
        totalUsers: number;
        usersByRole: Record<string, number>;
    };
    franchiseGrowth: Array<{ _id: string; count: number }>;
    outletsByFranchise: Array<{
        franchiseId: string;
        name: string;
        brandCode: string;
        outletCount: number;
    }>;
    devicesByOutlet: Array<{
        outletId: string;
        name: string;
        outletCode: string;
        deviceCount: number;
    }>;
    recentFranchises: Array<{
        _id: string;
        name: string;
        brandCode: string;
        status: string;
        createdAt: string;
    }>;
    recentOutlets: Array<{
        _id: string;
        name: string;
        outletCode: string;
        status: string;
        createdAt: string;
    }>;
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
    summary: {
        revenue: number;
        orders: number;
        avgOrderValue: number;
        cancellationRate: number;
        peakHour: number | null;
    };
    statusBreakdown: Record<string, number>;
    ordersPerHour: HourPoint[];
    revenueTrend: TrendPoint[];
    topItems: TopItem[];
    categoryRevenue: CategoryRevenue[];
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
