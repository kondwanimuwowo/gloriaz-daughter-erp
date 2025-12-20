import { supabase } from "../lib/supabase";
import { getZambianDate } from "../utils/dateUtils";

export const dashboardService = {
  async getDashboardStats() {
    try {
      const todayString = getZambianDate();

      const [
        { data: orders },
        { data: customers },
        { data: materials },
        { data: employees },
        { data: todayAttendance },
      ] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("customers").select("*"),
        supabase.from("materials").select("*"),
        supabase.from("employees").select("*").eq("active", true),
        supabase
          .from("attendance")
          .select("*, employees(name, role)")
          .eq("date", todayString),
      ]);

      const orderStats = this.calculateOrderStats(orders || []);
      const inventoryStats = this.calculateInventoryStats(materials || []);
      const employeeStats = this.calculateEmployeeStats(todayAttendance || []);
      const revenueStats = this.calculateRevenueStats(orders || []);

      return {
        orders: orderStats,
        inventory: inventoryStats,
        employees: employeeStats,
        revenue: revenueStats,
        customers: {
          total: customers?.length || 0,
          withMeasurements:
            customers?.filter((c) => c.measurements).length || 0,
          newThisMonth:
            customers?.filter((c) => {
              const created = new Date(c.created_at);
              const now = new Date();
              return (
                created.getMonth() === now.getMonth() &&
                created.getFullYear() === now.getFullYear()
              );
            }).length || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  calculateOrderStats(orders) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const statusCounts = {
      enquiry: 0,
      contacted: 0,
      measurements: 0,
      production: 0,
      fitting: 0,
      completed: 0,
      delivered: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;
    let thisMonthOrders = 0;
    let lastMonthOrders = 0;
    let thisMonthRevenue = 0;
    let pendingBalance = 0;

    orders.forEach((order) => {
      const status = order.status?.toLowerCase() || "enquiry";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      totalRevenue += parseFloat(order.total_cost || 0);
      pendingBalance += parseFloat(order.balance || 0);

      const orderDate = new Date(order.created_at);
      if (
        orderDate.getMonth() === thisMonth &&
        orderDate.getFullYear() === thisYear
      ) {
        thisMonthOrders++;
        thisMonthRevenue += parseFloat(order.total_cost || 0);
      }
      if (
        orderDate.getMonth() === lastMonth &&
        orderDate.getFullYear() === lastMonthYear
      ) {
        lastMonthOrders++;
      }
    });

    const orderGrowth =
      lastMonthOrders === 0
        ? 0
        : ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

    const activeOrders = orders.filter(
      (o) => !["delivered", "cancelled"].includes(o.status?.toLowerCase())
    ).length;

    return {
      total: orders.length,
      byStatus: statusCounts,
      totalRevenue,
      thisMonthOrders,
      thisMonthRevenue,
      pendingBalance,
      orderGrowth: orderGrowth.toFixed(1),
      activeOrders,
    };
  },

  calculateInventoryStats(materials) {
    let totalValue = 0;
    let lowStockCount = 0;
    const categories = {};

    materials.forEach((material) => {
      const stockQty = parseFloat(material.stock_quantity || 0);
      const minStock = parseFloat(material.min_stock_level || 0);
      const costPerUnit = parseFloat(material.cost_per_unit || 0);

      totalValue += stockQty * costPerUnit;

      if (stockQty <= minStock) {
        lowStockCount++;
      }

      categories[material.category] = (categories[material.category] || 0) + 1;
    });

    return {
      totalMaterials: materials.length,
      totalValue,
      lowStockCount,
      categories,
    };
  },

  calculateEmployeeStats(attendance) {
    const clockedIn = attendance.filter(
      (a) => a.clock_in && !a.clock_out
    ).length;
    const completed = attendance.filter((a) => a.clock_out).length;
    const totalHours = attendance.reduce(
      (sum, a) => sum + parseFloat(a.hours_worked || 0),
      0
    );

    return {
      clockedIn,
      completed,
      totalToday: attendance.length,
      totalHours: totalHours.toFixed(1),
    };
  },

  calculateRevenueStats(orders) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthlyRevenue = Array(12).fill(0);

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.getMonth();
        monthlyRevenue[month] += parseFloat(order.total_cost || 0);
      }
    });

    const revenueByStatus = {};
    orders.forEach((order) => {
      const status = order.status?.toLowerCase() || "enquiry";
      if (!revenueByStatus[status]) {
        revenueByStatus[status] = 0;
      }
      revenueByStatus[status] += parseFloat(order.total_cost || 0);
    });

    return {
      monthlyRevenue,
      revenueByStatus,
      currentMonthRevenue: monthlyRevenue[currentMonth],
    };
  },

  async getRecentActivity() {
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(
        `
        *,
        customers (name, phone)
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: allMaterials } = await supabase.from("materials").select("*");

    const lowStockMaterials = (allMaterials || [])
      .filter(
        (m) => parseFloat(m.stock_quantity) <= parseFloat(m.min_stock_level)
      )
      .slice(0, 5);

    return {
      recentOrders: recentOrders || [],
      lowStockMaterials: lowStockMaterials || [],
    };
  },
};
