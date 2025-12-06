import { supabase } from "../lib/supabase";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const analyticsService = {
  // Get revenue data for the last 6 months
  async getRevenueData() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const { data: orders } = await supabase
        .from("orders")
        .select("total_cost")
        .gte("order_date", start.toISOString())
        .lte("order_date", end.toISOString());

      const revenue =
        orders?.reduce(
          (sum, order) => sum + parseFloat(order.total_cost || 0),
          0
        ) || 0;

      months.push({
        month: format(date, "MMM yyyy"),
        revenue: parseFloat(revenue.toFixed(2)),
      });
    }

    return months;
  },

  // Get order status distribution
  async getOrderStatusData() {
    const { data: orders } = await supabase.from("orders").select("status");

    if (!orders) return [];

    const statusCount = {};
    orders.forEach((order) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    }));
  },

  // Get top materials used
  async getTopMaterialsUsed(limit = 10) {
    const { data: orderMaterials } = await supabase.from("order_materials")
      .select(`
        material_id,
        quantity_used,
        cost,
        materials (
          name,
          unit
        )
      `);

    if (!orderMaterials) return [];

    // Aggregate by material
    const materialMap = {};
    orderMaterials.forEach((item) => {
      const id = item.material_id;
      if (!materialMap[id]) {
        materialMap[id] = {
          name: item.materials?.name || "Unknown",
          unit: item.materials?.unit || "",
          quantity: 0,
          cost: 0,
        };
      }
      materialMap[id].quantity += parseFloat(item.quantity_used || 0);
      materialMap[id].cost += parseFloat(item.cost || 0);
    });

    // Convert to array and sort by quantity
    return Object.values(materialMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map((m) => ({
        name: m.name,
        quantity: parseFloat(m.quantity.toFixed(2)),
        cost: parseFloat(m.cost.toFixed(2)),
      }));
  },

  // Get employee productivity
  async getEmployeeProductivity() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get employees
    const { data: employees } = await supabase
      .from("employees")
      .select("id, name, role")
      .eq("active", true);

    if (!employees) return [];

    const productivity = await Promise.all(
      employees.map(async (employee) => {
        // Get total hours
        const { data: attendance } = await supabase
          .from("attendance")
          .select("hours_worked")
          .eq("employee_id", employee.id)
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

        const totalHours =
          attendance?.reduce(
            (sum, record) => sum + parseFloat(record.hours_worked || 0),
            0
          ) || 0;

        // Get completed orders (if tailor)
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .eq("assigned_tailor_id", employee.id)
          .in("status", ["completed", "delivered"]);

        return {
          name: employee.name,
          hours: parseFloat(totalHours.toFixed(1)),
          orders: orders?.length || 0,
        };
      })
    );

    return productivity.filter((p) => p.hours > 0 || p.orders > 0);
  },

  // Get overall dashboard stats
  async getDashboardStats() {
    // Total revenue
    const { data: allOrders } = await supabase
      .from("orders")
      .select("total_cost, status, order_date");

    const totalRevenue =
      allOrders?.reduce(
        (sum, order) => sum + parseFloat(order.total_cost || 0),
        0
      ) || 0;

    // This month's revenue
    const thisMonthStart = startOfMonth(new Date());
    const thisMonthOrders =
      allOrders?.filter(
        (order) => new Date(order.order_date) >= thisMonthStart
      ) || [];
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_cost || 0),
      0
    );

    // Low stock count
    // Low stock count: fetch materials and compute client-side since supabase filters don't support column-to-column comparison
    const { data: materials } = await supabase
      .from("materials")
      .select("id, stock_quantity, min_stock_level");
    const lowStock = (materials || []).filter(
      (m) =>
        parseFloat(m.stock_quantity || 0) <= parseFloat(m.min_stock_level || 0)
    );

    // Active orders
    const activeOrders =
      allOrders?.filter(
        (order) => !["delivered", "cancelled"].includes(order.status)
      ).length || 0;

    // Customer count
    const { data: customers } = await supabase.from("customers").select("id");

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      thisMonthRevenue: parseFloat(thisMonthRevenue.toFixed(2)),
      lowStockCount: lowStock.length || 0,
      activeOrders,
      totalCustomers: customers?.length || 0,
      totalOrders: allOrders?.length || 0,
    };
  },
};
