import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import Card from "../components/common/Card";
import RevenueChart from "../components/dashboard/RevenueChart";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import MaterialUsageChart from "../components/dashboard/MaterialUsageChart";
import EmployeeProductivityChart from "../components/dashboard/EmployeeProductivityChart";
import { analyticsService } from "../services/analyticsService";
import { orderService } from "../services/orderService";
import { inventoryService } from "../services/inventoryService";
import { employeeService } from "../services/employeeService";
import { format } from "date-fns";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    revenueData: [],
    orderStatusData: [],
    materialUsageData: [],
    employeeProductivityData: [],
    recentOrders: [],
    lowStock: [],
    todayAttendance: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
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

      setDashboardData({
        stats,
        revenueData,
        orderStatusData,
        materialUsageData,
        employeeProductivityData,
        recentOrders: allOrders.slice(0, 5),
        lowStock: lowStockMaterials,
        todayAttendance,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;
  const clockedInToday = dashboardData.todayAttendance.filter(
    (a) => !a.clock_out
  ).length;
  const revenueGrowth =
    stats.thisMonthRevenue > 0
      ? ((stats.thisMonthRevenue / stats.totalRevenue) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-900">
                  K{stats.totalRevenue.toFixed(0)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  K{stats.thisMonthRevenue.toFixed(0)} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.totalOrders}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.activeOrders} active
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-green-600" size={24} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Customers</p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.totalCustomers}
                </p>
                <p className="text-xs text-purple-600 mt-1">Total registered</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            className={`bg-gradient-to-br ${
              stats.lowStockCount > 0
                ? "from-red-50 to-white"
                : "from-green-50 to-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm mb-1 ${
                    stats.lowStockCount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Low Stock Items
                </p>
                <p
                  className={`text-3xl font-bold ${
                    stats.lowStockCount > 0 ? "text-red-900" : "text-green-900"
                  }`}
                >
                  {stats.lowStockCount}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    stats.lowStockCount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {stats.lowStockCount > 0 ? "Needs attention" : "All good!"}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stats.lowStockCount > 0 ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {stats.lowStockCount > 0 ? (
                  <AlertCircle className="text-red-600" size={24} />
                ) : (
                  <Package className="text-green-600" size={24} />
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RevenueChart data={dashboardData.revenueData} />
        <OrderStatusChart data={dashboardData.orderStatusData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <MaterialUsageChart data={dashboardData.materialUsageData} />
        <EmployeeProductivityChart
          data={dashboardData.employeeProductivityData}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <a
              href="/orders"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all →
            </a>
          </div>
          {dashboardData.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">
                        {order.order_number}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.customers?.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {format(new Date(order.order_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      K{parseFloat(order.total_cost).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Alerts & Today's Attendance */}
        <div className="space-y-6">
          {/* Low Stock */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {stats.lowStockCount > 0 && (
                  <AlertCircle className="text-red-600" size={20} />
                )}
                Low Stock Alerts
              </h2>
              <a
                href="/inventory"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all →
              </a>
            </div>
            {dashboardData.lowStock.length === 0 ? (
              <div className="text-center py-6">
                <Package className="mx-auto text-green-500 mb-2" size={32} />
                <p className="text-green-600 font-medium">
                  All materials well stocked!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData.lowStock.slice(0, 3).map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {material.name}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {material.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-sm">
                        {parseFloat(material.stock_quantity).toFixed(1)}{" "}
                        {material.unit}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Today's Attendance */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Today's Attendance
              </h2>
              <span className="text-sm font-medium text-gray-600">
                {clockedInToday} clocked in
              </span>
            </div>
            {dashboardData.todayAttendance.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No attendance today
              </p>
            ) : (
              <div className="space-y-2">
                {dashboardData.todayAttendance
                  .slice(0, 4)
                  .map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        record.clock_out ? "bg-gray-50" : "bg-green-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {record.employees.name}
                      </span>
                      {record.clock_out ? (
                        <span className="text-xs text-gray-600">
                          {parseFloat(record.hours_worked).toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-600">
                          Active
                        </span>
                      )}
                    </motion.div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
