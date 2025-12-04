import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  Scissors,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import StatsCard from "../components/dashboard/StatsCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import { dashboardService } from "../services/dashboardService";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log("Fetching dashboard data...");
      const [dashStats, activity] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
      ]);

      setStats(dashStats);
      setRecentActivity(activity);

      if (!loading) {
        toast.success("Dashboard refreshed!");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to Gloriaz Daughter ERP System -{" "}
            {format(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          loading={refreshing}
          icon={RefreshCw}
          variant="secondary"
        >
          Refresh
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          subtitle={`${stats?.orders?.thisMonthOrders || 0} this month`}
          icon={ShoppingCart}
          color="blue"
          trend={stats?.orders?.orderGrowth}
          delay={0.1}
        />

        <StatsCard
          title="Active Orders"
          value={stats?.orders?.activeOrders || 0}
          subtitle={`${stats?.orders?.byStatus?.production || 0} in production`}
          icon={Clock}
          color="yellow"
          delay={0.2}
        />

        <StatsCard
          title="Total Customers"
          value={stats?.customers?.total || 0}
          subtitle={`${stats?.customers?.newThisMonth || 0} new this month`}
          icon={Users}
          color="green"
          delay={0.3}
        />

        <StatsCard
          title="Total Revenue"
          value={`K${stats?.orders?.totalRevenue?.toFixed(0) || 0}`}
          subtitle={`K${stats?.orders?.thisMonthRevenue?.toFixed(0) || 0} this month`}
          icon={DollarSign}
          color="purple"
          delay={0.4}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Materials in Stock"
          value={stats?.inventory?.totalMaterials || 0}
          subtitle={`Worth K${stats?.inventory?.totalValue?.toFixed(0) || 0}`}
          icon={Package}
          color="primary"
          delay={0.5}
        />

        <StatsCard
          title="Low Stock Items"
          value={stats?.inventory?.lowStockCount || 0}
          subtitle="Need restocking"
          icon={AlertCircle}
          color="red"
          delay={0.6}
        />

        <StatsCard
          title="Clocked In Today"
          value={stats?.employees?.clockedIn || 0}
          subtitle={`${stats?.employees?.totalToday || 0} total today`}
          icon={Scissors}
          color="green"
          delay={0.7}
        />

        <StatsCard
          title="Hours Today"
          value={stats?.employees?.totalHours || "0.0"}
          subtitle="Total work hours"
          icon={Clock}
          color="blue"
          delay={0.8}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart monthlyRevenue={stats?.revenue?.monthlyRevenue || []} />
        <OrderStatusChart ordersByStatus={stats?.orders?.byStatus || {}} />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Orders
          </h2>
          {!recentActivity?.recentOrders ||
          recentActivity.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">
                        {order.order_number}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {order.customers?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.created_at), "MMM dd, hh:mm a")}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">
                      K{parseFloat(order.total_cost).toFixed(2)}
                    </p>
                    {order.balance > 0 && (
                      <p className="text-xs text-red-600">
                        Bal: K{parseFloat(order.balance).toFixed(2)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Low Stock Alerts
          </h2>
          {!recentActivity?.lowStockMaterials ||
          recentActivity.lowStockMaterials.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-green-600 font-medium">
                All materials well stocked!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.lowStockMaterials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {material.name}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {material.category}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-red-600">
                      {parseFloat(material.stock_quantity).toFixed(2)}{" "}
                      {material.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {parseFloat(material.min_stock_level).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-gradient-to-br from-primary-50 to-white">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Financial Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-primary-600">
              K{stats?.orders?.totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Pending Balance</p>
            <p className="text-3xl font-bold text-orange-600">
              K{stats?.orders?.pendingBalance?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Inventory Value</p>
            <p className="text-3xl font-bold text-green-600">
              K{stats?.inventory?.totalValue?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
