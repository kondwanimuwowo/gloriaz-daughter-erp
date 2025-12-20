import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, RefreshCw, TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import AdvancedFilters from "../components/analytics/AdvancedFilters";
import CustomerAnalyticsChart from "../components/analytics/CustomerAnalyticsChart";
import OrderTrendChart from "../components/analytics/OrderTrendChart";
import ProfitabilityChart from "../components/analytics/ProfitabilityChart";
import InventoryTurnoverChart from "../components/analytics/InventoryTurnoverChart";
import StatsCard from "../components/dashboard/StatsCard";

import { analyticsService } from "../services/analyticsService";
import { customerService } from "../services/customerService";
import { employeeService } from "../services/employeeService";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    customerId: "",
    employeeId: "",
    status: "",
    minAmount: "",
    maxAmount: "",
  });

  const [analyticsData, setAnalyticsData] = useState({
    customerAnalytics: [],
    orderTrends: [],
    profitability: [],
    inventoryTurnover: [],
  });

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topCustomer: null,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load customers and employees for filters
      const [customersData, employeesData] = await Promise.all([
        customerService.getAllCustomers(),
        employeeService.getAllEmployees(),
      ]);

      setCustomers(customersData || []);
      setEmployees(employeesData || []);

      // Load analytics data
      await loadAnalyticsData(filters);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async (currentFilters) => {
    setLoading(true);
    try {
      const [customerData, orderTrendData, profitabilityData, inventoryData] =
        await Promise.all([
          analyticsService.getCustomerAnalytics(
            currentFilters.startDate,
            currentFilters.endDate
          ),
          analyticsService.getOrderTrendAnalysis(
            currentFilters.startDate,
            currentFilters.endDate
          ),
          analyticsService.getProfitabilityAnalysis(6),
          analyticsService.getInventoryTurnover(6),
        ]);

      // Apply additional filters
      let filteredCustomerData = customerData;
      if (currentFilters.customerId) {
        filteredCustomerData = customerData.filter(
          (c) => c.customerId === currentFilters.customerId
        );
      }

      // Calculate summary
      const totalRevenue = filteredCustomerData.reduce(
        (sum, c) => sum + c.totalSpent,
        0
      );
      const totalOrders = filteredCustomerData.reduce(
        (sum, c) => sum + c.orderCount,
        0
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const topCustomer =
        filteredCustomerData.length > 0 ? filteredCustomerData[0] : null;

      setSummary({
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        topCustomer,
      });

      setAnalyticsData({
        customerAnalytics: filteredCustomerData,
        orderTrends: orderTrendData,
        profitability: profitabilityData,
        inventoryTurnover: inventoryData,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    loadAnalyticsData(newFilters);
  };

  const handleRefresh = () => {
    loadAnalyticsData(filters);
    toast.success("Analytics refreshed!");
  };

  const handleExport = () => {
    // Create CSV export
    const csvData = analyticsData.customerAnalytics.map((customer) => ({
      Customer: customer.customerName,
      "Total Orders": customer.orderCount,
      "Total Spent": customer.totalSpent,
      "Average Order Value": customer.avgOrderValue,
      "First Order": customer.firstOrder,
      "Last Order": customer.lastOrder,
    }));

    const headers = Object.keys(csvData[0] || {});
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Advanced business intelligence and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`K${summary.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
          delay={0.1}
        />

        <StatsCard
          title="Total Orders"
          value={summary.totalOrders}
          icon={BarChart3}
          color="green"
          delay={0.2}
        />

        <StatsCard
          title="Avg Order Value"
          value={`K${summary.avgOrderValue.toLocaleString()}`}
          icon={RefreshCw}
          color="purple"
          delay={0.3}
        />

        <StatsCard
          title="Top Customer"
          value={summary.topCustomer?.customerName || "N/A"}
          subtitle={summary.topCustomer ? `K${summary.topCustomer.totalSpent.toLocaleString()} spent` : ""}
          icon={BarChart3}
          color="yellow"
          delay={0.4}
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        onApplyFilters={handleApplyFilters}
        customers={customers}
        employees={employees}
      />

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Customer Analytics */}
          <Card>
              <CardHeader>
                  <CardTitle>Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                  <CustomerAnalyticsChart data={analyticsData.customerAnalytics} />
              </CardContent>
          </Card>

          {/* Order Trends */}
          <Card>
              <CardHeader>
                  <CardTitle>Order Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTrendChart data={analyticsData.orderTrends} />
              </CardContent>
          </Card>

          {/* Profitability & Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                   <CardHeader>
                       <CardTitle>Profitability Analysis</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <ProfitabilityChart data={analyticsData.profitability} />
                   </CardContent>
               </Card>
               <Card>
                   <CardHeader>
                       <CardTitle>Inventory Turnover</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <InventoryTurnoverChart data={analyticsData.inventoryTurnover} />
                   </CardContent>
               </Card>
          </div>

          {/* Additional Insights Card */}
          <Card>
            <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Automated business insights based on your data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Customer Insights */}
                {analyticsData.customerAnalytics.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                        Customer Base
                    </h4>
                    <p className="text-sm text-blue-700">
                        You have{" "}
                        <strong>{analyticsData.customerAnalytics.length}</strong>{" "}
                        active customers in this period.
                    </p>
                    {summary.topCustomer && (
                        <p className="text-xs text-blue-600 mt-2">
                        Top customer:{" "}
                        <strong>{summary.topCustomer.customerName}</strong> with{" "}
                        {summary.topCustomer.orderCount} orders
                        </p>
                    )}
                    </div>
                )}

                {/* Order Insights */}
                {analyticsData.orderTrends.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">
                        Order Performance
                    </h4>
                    <p className="text-sm text-green-700">
                        Average of{" "}
                        <strong>
                        {(
                            summary.totalOrders / analyticsData.orderTrends.length
                        ).toFixed(1)}
                        </strong>{" "}
                        orders per day
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                        Based on {analyticsData.orderTrends.length} days of data
                    </p>
                    </div>
                )}

                {/* Profitability Insights */}
                {analyticsData.profitability.length > 0 &&
                    (() => {
                    const latest =
                        analyticsData.profitability[
                        analyticsData.profitability.length - 1
                        ];
                    return (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">
                            Profitability
                        </h4>
                        <p className="text-sm text-purple-700">
                            Current profit margin:{" "}
                            <strong>{latest.profitMargin.toFixed(1)}%</strong>
                        </p>
                        <p className="text-xs text-purple-600 mt-2">
                            Latest month: {latest.month}
                        </p>
                        </div>
                    );
                    })()}

                {/* Revenue Insights */}
                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-semibold text-pink-900 mb-2">
                    Revenue Analysis
                    </h4>
                    <p className="text-sm text-pink-700">
                    Average order value:{" "}
                    <strong>K{summary.avgOrderValue.toLocaleString()}</strong>
                    </p>
                    <p className="text-xs text-pink-600 mt-2">
                    Total revenue: K{summary.totalRevenue.toLocaleString()}
                    </p>
                </div>

                {/* Inventory Insights */}
                {analyticsData.inventoryTurnover.length > 0 &&
                    (() => {
                    const totalMaterialCost =
                        analyticsData.inventoryTurnover.reduce(
                        (sum, item) => sum + item.totalCost,
                        0
                        );
                    return (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2">
                            Material Usage
                        </h4>
                        <p className="text-sm text-orange-700">
                            Total material cost:{" "}
                            <strong>K{totalMaterialCost.toLocaleString()}</strong>
                        </p>
                        <p className="text-xs text-orange-600 mt-2">
                            Over {analyticsData.inventoryTurnover.length} months
                        </p>
                        </div>
                    );
                    })()}

                {/* Growth Potential */}
                {analyticsData.customerAnalytics.length > 0 && (
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-2">
                        Growth Potential
                    </h4>
                    <p className="text-sm text-indigo-700">
                        {
                        analyticsData.customerAnalytics.filter(
                            (c) => c.orderCount === 1
                        ).length
                        }{" "}
                        customers with only 1 order
                    </p>
                    <p className="text-xs text-indigo-600 mt-2">
                        Opportunity for retention campaigns
                    </p>
                    </div>
                )}
                </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

