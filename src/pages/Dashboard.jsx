import { motion } from "framer-motion";
import {
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    AlertCircle,
    DollarSign,
    Calendar,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useQueryRecovery } from "../hooks/useQueryRecovery";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import { useAuthStore } from "../store/useAuthStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import RevenueChart from "../components/dashboard/RevenueChart";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import MaterialUsageChart from "../components/dashboard/MaterialUsageChart";
import EmployeeProductivityChart from "../components/dashboard/EmployeeProductivityChart";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import StatsCard from "../components/dashboard/StatsCard";

import { analyticsService } from "../services/analyticsService";
import { orderService } from "../services/orderService";
import { inventoryService } from "../services/inventoryService";
import { employeeService } from "../services/employeeService";

export default function Dashboard() {
    const navigate = useNavigate();

    // 1. HARD RECOVERY ORCHESTRATION
    useQueryRecovery();
    useDashboardRealtime();

    // 2. DATA QUERIES (Marked as erpCritical for automated recovery)
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-data'],
        queryFn: async () => {
            const [
                stats,
                revenueData,
                orderStatusData,
                materialUsageData,
                employeeProductivityData,
                allOrders,
                lowStockMaterials,
                todayAttendance,
            ] = await Promise.all([
                analyticsService.getDashboardStats(),
                analyticsService.getRevenueData(),
                analyticsService.getOrderStatusData(),
                analyticsService.getTopMaterialsUsed(8),
                analyticsService.getEmployeeProductivity(),
                orderService.getAllOrders(),
                inventoryService.getLowStockMaterials(),
                employeeService.getTodayAttendance(),
            ]);

            return {
                stats,
                revenueData,
                orderStatusData,
                materialUsageData,
                employeeProductivityData,
                recentOrders: allOrders.slice(0, 5),
                lowStock: lowStockMaterials,
                todayAttendance,
            };
        },
        meta: { erpCritical: true },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!dashboardData?.stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Failed to load dashboard</h2>
                    <p className="text-muted-foreground">Please wait a moment for the sync to recover</p>
                </div>
            </div>
        );
    }

    const { stats, todayAttendance, recentOrders, lowStock } = dashboardData;
    const clockedInToday = todayAttendance.filter((a) => !a.clock_out).length;

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's what's happening with your business.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`K${stats.totalRevenue.toFixed(0)}`}
                    subtitle={`K${stats.thisMonthRevenue.toFixed(0)} this month`}
                    icon={DollarSign}
                    color="blue"
                    delay={0.1}
                />

                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    subtitle={`${stats.activeOrders} active`}
                    icon={ShoppingCart}
                    color="green"
                    delay={0.2}
                />

                <StatsCard
                    title="Avg Order Value"
                    value={`K${stats.avgOrderValue.toFixed(0)}`}
                    icon={TrendingUp}
                    color="yellow"
                    delay={0.3}
                />

                <StatsCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    subtitle={stats.lowStockCount > 0 ? "Needs attention" : "All good!"}
                    icon={stats.lowStockCount > 0 ? AlertCircle : Package}
                    color={stats.lowStockCount > 0 ? "red" : "green"}
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <RevenueChart data={dashboardData.revenueData} />
                <OrderStatusChart data={dashboardData.orderStatusData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <MaterialUsageChart data={dashboardData.materialUsageData} />
                <EmployeeProductivityChart data={dashboardData.employeeProductivityData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Recent Orders</CardTitle>
                        <Link to="/orders">
                            <Button variant="link" size="sm">View all →</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate("/orders", { state: { openOrderId: order.id } })}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="font-semibold text-sm">{order.order_number}</p>
                                                <OrderStatusBadge status={order.status} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{order.customers?.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Calendar size={12} />
                                                {format(new Date(order.order_date), "MMM dd, yyyy")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">K{parseFloat(order.total_cost).toFixed(2)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                {stats.lowStockCount > 0 && <AlertCircle className="text-red-500 h-5 w-5" />}
                                <CardTitle>Low Stock Alerts</CardTitle>
                            </div>
                            <Link to="/inventory">
                                <Button variant="link" size="sm">View all →</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {lowStock.length === 0 ? (
                                <div className="text-center py-6">
                                    <Package className="mx-auto text-green-500 mb-2 h-8 w-8" />
                                    <p className="text-green-600 font-medium">All materials well stocked!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lowStock.slice(0, 3).map((material, index) => (
                                        <motion.div
                                            key={material.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => navigate("/inventory", { state: { openMaterialId: material.id } })}
                                            className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                                        >
                                            <div>
                                                <p className="font-semibold text-sm">{material.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{material.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600 text-sm">{parseFloat(material.stock_quantity).toFixed(1)} {material.unit}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Today's Attendance</CardTitle>
                            <Badge variant="outline">{clockedInToday} clocked in</Badge>
                        </CardHeader>
                        <CardContent>
                            {todayAttendance.length === 0 ? (
                                <p className="text-muted-foreground text-center py-6">No attendance today</p>
                            ) : (
                                <div className="space-y-2">
                                    {todayAttendance.slice(0, 4).map((record, index) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => navigate("/employees", { state: { openEmployeeId: record.employee_id || record.employees?.id } })}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors ${record.clock_out ? "bg-muted/50" : "bg-green-50"}`}
                                        >
                                            <span className="text-sm font-medium">{record.employees?.name}</span>
                                            {record.clock_out ? (
                                                <span className="text-xs text-muted-foreground">{parseFloat(record.hours_worked).toFixed(1)}h</span>
                                            ) : (
                                                <span className="text-xs font-medium text-green-600">Active</span>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
