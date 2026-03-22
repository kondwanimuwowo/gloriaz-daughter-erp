import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, RefreshCw, TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryRecovery } from "../hooks/useQueryRecovery";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import AdvancedFilters from "../components/analytics/AdvancedFilters";
import CustomerAnalyticsChart from "../components/analytics/CustomerAnalyticsChart";
import OrderTrendChart from "../components/analytics/OrderTrendChart";
import ProfitabilityChart from "../components/analytics/ProfitabilityChart";
import InventoryTurnoverChart from "../components/analytics/InventoryTurnoverChart";
import StatsCard from "../components/dashboard/StatsCard";
import { PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/PageSkeleton";

import { analyticsService } from "../services/analyticsService";
import { customerService } from "../services/customerService";
import { employeeService } from "../services/employeeService";

export default function Analytics() {
    const queryClient = useQueryClient();

    // 1. HARD RECOVERY ORCHESTRATION
    useQueryRecovery();

    const [filters, setFilters] = useState({
        startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        customerId: "",
        employeeId: "",
        status: "",
        minAmount: "",
        maxAmount: "",
    });

    // 2. DATA QUERIES (Marked as erpCritical)
    const { data: customers = [] } = useQuery({
        queryKey: ['customers-list'],
        queryFn: () => customerService.getAllCustomers(),
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees-list'],
        queryFn: () => employeeService.getAllEmployees(),
    });

    const { data: analyticsResults, isLoading: loading } = useQuery({
        queryKey: ['analytics-data', filters],
        queryFn: async () => {
            const [customerData, orderTrendData, profitabilityData, inventoryData] =
                await Promise.all([
                    analyticsService.getCustomerAnalytics(filters.startDate, filters.endDate),
                    analyticsService.getOrderTrendAnalysis(filters.startDate, filters.endDate),
                    analyticsService.getProfitabilityAnalysis(6),
                    analyticsService.getInventoryTurnover(6),
                ]);

            // Apply filters locally
            let filteredCustomerData = customerData || [];
            if (filters.customerId) {
                filteredCustomerData = filteredCustomerData.filter(c => c.customerId === filters.customerId);
            }
            if (filters.employeeId) {
                filteredCustomerData = filteredCustomerData.filter(c => c.assignedTailorId === filters.employeeId);
            }

            // Calculate summary
            const totalRevenue = customerData?.reduce((sum, c) => sum + (c.totalSpent || 0), 0) || 0;
            const totalOrders = customerData?.reduce((sum, c) => sum + (c.orderCount || 0), 0) || 0;
            const topCustomer = customerData?.length > 0
                ? [...customerData].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0]
                : null;

            return {
                analyticsData: {
                    customerAnalytics: filteredCustomerData,
                    orderTrends: orderTrendData || [],
                    profitability: profitabilityData || [],
                    inventoryTurnover: inventoryData || [],
                },
                summary: {
                    totalRevenue,
                    totalOrders,
                    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                    topCustomer
                }
            };
        },
        meta: { erpCritical: true },
    });

    const analyticsData = analyticsResults?.analyticsData || {
        customerAnalytics: [],
        orderTrends: [],
        profitability: [],
        inventoryTurnover: [],
    };

    const summary = analyticsResults?.summary || {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        topCustomer: null,
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['analytics-data'] });
        toast.success("Analytics refreshed!");
    };

    const handleExport = () => {
        if (!analyticsData.customerAnalytics.length) return;
        const csvData = analyticsData.customerAnalytics.map((customer) => ({
            Customer: customer.customerName,
            "Total Orders": customer.orderCount,
            "Total Spent": customer.totalSpent,
            "Average Order Value": customer.avgOrderValue,
            "First Order": customer.firstOrder,
            "Last Order": customer.lastOrder,
        }));

        const headers = Object.keys(csvData[0]);
        const csv = [
            headers.join(","),
            ...csvData.map((row) => headers.map((h) => row[h]).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        toast.success("Report exported successfully!");
    };

    if (loading) {
        return <PageSkeleton layout="charts" statsCount={4} />;
    }

    return (
        <div className="space-y-5">
            <PageHeader title="Analytics" description="Business intelligence insights">
                <Button variant="outline" onClick={handleRefresh}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
                <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Data</Button>
            </PageHeader>

            <AdvancedFilters
                filters={filters}
                onApply={handleApplyFilters}
                customers={customers}
                employees={employees}
            />

            <div className="flex flex-wrap gap-3">
                <StatsCard title="Total Revenue" value={`K${summary.totalRevenue.toFixed(2)}`} icon={TrendingUp} color="blue" />
                <StatsCard title="Total Orders" value={summary.totalOrders} icon={BarChart3} color="green" />
                <StatsCard title="Avg Order Value" value={`K${summary.avgOrderValue.toFixed(2)}`} icon={TrendingUp} color="yellow" />
                <StatsCard title="Top Customer" value={summary.topCustomer?.customerName || "N/A"} subtitle={`K${summary.topCustomer?.totalSpent?.toFixed(2) || 0} spent`} icon={TrendingUp} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <OrderTrendChart data={analyticsData.orderTrends} />
                <ProfitabilityChart data={analyticsData.profitability} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CustomerAnalyticsChart data={analyticsData.customerAnalytics} />
                <InventoryTurnoverChart data={analyticsData.inventoryTurnover} />
            </div>
        </div>
    );
}
