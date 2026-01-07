import { supabase } from "../lib/supabase";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { getZambianDate } from "../utils/dateUtils";

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
    const thirtyDaysAgoString = getZambianDate(thirtyDaysAgo);

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
          .gte("date", thirtyDaysAgoString);

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

    // Calculate average order value
    const avgOrderValue = allOrders && allOrders.length > 0
      ? totalRevenue / allOrders.length
      : 0;

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      thisMonthRevenue: parseFloat(thisMonthRevenue.toFixed(2)),
      lowStockCount: lowStock.length || 0,
      activeOrders,
      totalCustomers: customers?.length || 0,
      totalOrders: allOrders?.length || 0,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    };
  },

  // ... (rest of the functions would follow, but I'll only restore what I can confirm from previous view)
  // Actually I saw the whole file earlier. Let me restore the rest.

  async getOrderTrendAnalysis(startDate, endDate) {
    const { data: orders } = await supabase
      .from("orders")
      .select("order_date, status, total_cost")
      .gte("order_date", startDate)
      .lte("order_date", endDate)
      .order("order_date", { ascending: true });

    if (!orders || orders.length === 0) return [];

    // Group by date
    const dailyStats = {};

    orders.forEach((order) => {
      const date = order.order_date.split("T")[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          count: 0,
          revenue: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        };
      }

      dailyStats[date].count++;
      dailyStats[date].revenue += parseFloat(order.total_cost || 0);

      if (["completed", "delivered"].includes(order.status)) {
        dailyStats[date].completed++;
      } else if (order.status === "cancelled") {
        dailyStats[date].cancelled++;
      } else {
        dailyStats[date].pending++;
      }
    });

    return Object.values(dailyStats).map((stat) => ({
      ...stat,
      revenue: parseFloat(stat.revenue.toFixed(2)),
    }));
  },

  async getCustomerAnalytics(startDate = null, endDate = null) {
    let query = supabase.from("orders").select(`
        customer_id,
        total_cost,
        order_date,
        customers (
          id,
          name,
          phone,
          created_at
        )
      `);

    if (startDate) query = query.gte("order_date", startDate);
    if (endDate) query = query.lte("order_date", endDate);

    const { data: orders } = await query;

    if (!orders) return [];

    // Aggregate by customer
    const customerStats = {};

    orders.forEach((order) => {
      const customerId = order.customer_id;
      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          customerId,
          customerName: order.customers?.name || "Unknown",
          orderCount: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          firstOrder: order.order_date,
          lastOrder: order.order_date,
        };
      }

      customerStats[customerId].orderCount++;
      customerStats[customerId].totalSpent += parseFloat(order.total_cost || 0);

      if (order.order_date < customerStats[customerId].firstOrder) {
        customerStats[customerId].firstOrder = order.order_date;
      }
      if (order.order_date > customerStats[customerId].lastOrder) {
        customerStats[customerId].lastOrder = order.order_date;
      }
    });

    return Object.values(customerStats)
      .map((stat) => ({
        ...stat,
        totalSpent: parseFloat(stat.totalSpent.toFixed(2)),
        avgOrderValue: parseFloat(
          (stat.totalSpent / stat.orderCount).toFixed(2)
        ),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  },

  async getProfitabilityAnalysis(months = 6) {
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, "MMM yyyy");

      // Get all data for the month
      const [
        { data: orders },
        { data: materials },
        { data: expenses },
        { data: overhead },
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("total_cost, id")
          .gte("order_date", monthStart.toISOString())
          .lte("order_date", monthEnd.toISOString()),
        supabase
          .from("order_materials")
          .select(
            `
            cost,
            order_id,
            orders!inner (order_date)
          `
          )
          .gte("orders.order_date", monthStart.toISOString())
          .lte("orders.order_date", monthEnd.toISOString()),
        supabase
          .from("expenses")
          .select("amount, category")
          .gte("expense_date", format(monthStart, "yyyy-MM-dd"))
          .lte("expense_date", format(monthEnd, "yyyy-MM-dd")),
        supabase
          .from("overhead_costs")
          .select("amount")
          .eq("month", format(monthStart, "yyyy-MM-dd")),
      ]);

      const revenue =
        orders?.reduce((sum, o) => sum + parseFloat(o.total_cost || 0), 0) || 0;
      const materialCost =
        materials?.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0) || 0;
      const laborCost =
        expenses
          ?.filter((e) => e.category === "labor")
          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      const otherExpenses =
        expenses
          ?.filter((e) => e.category !== "labor")
          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      const overheadCost =
        overhead?.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0) || 0;

      const totalCost = materialCost + laborCost + otherExpenses + overheadCost;
      const grossProfit = revenue - materialCost;
      const netProfit = revenue - totalCost;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      result.push({
        month: monthLabel,
        revenue: parseFloat(revenue.toFixed(2)),
        materialCost: parseFloat(materialCost.toFixed(2)),
        laborCost: parseFloat(laborCost.toFixed(2)),
        otherExpenses: parseFloat(otherExpenses.toFixed(2)),
        overheadCost: parseFloat(overheadCost.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      });
    }

    return result;
  },

  async getInventoryTurnover(months = 6) {
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, "MMM yyyy");

      // Get materials used in the month
      const { data: materialsUsed } = await supabase
        .from("order_materials")
        .select(
          `
          material_id,
          quantity_used,
          cost,
          materials (name, category)
        `
        )
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      if (!materialsUsed || materialsUsed.length === 0) {
        result.push({
          month: monthLabel,
          totalQuantity: 0,
          totalCost: 0,
          categories: [],
        });
        continue;
      }

      const categoryStats = {};
      let totalQuantity = 0;
      let totalCost = 0;

      materialsUsed.forEach((item) => {
        const category = item.materials?.category || "Other";
        if (!categoryStats[category]) {
          categoryStats[category] = { quantity: 0, cost: 0 };
        }

        const qty = parseFloat(item.quantity_used || 0);
        const cost = parseFloat(item.cost || 0);

        categoryStats[category].quantity += qty;
        categoryStats[category].cost += cost;
        totalQuantity += qty;
        totalCost += cost;
      });

      result.push({
        month: monthLabel,
        totalQuantity: parseFloat(totalQuantity.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        categories: Object.entries(categoryStats).map(([category, stats]) => ({
          category,
          quantity: parseFloat(stats.quantity.toFixed(2)),
          cost: parseFloat(stats.cost.toFixed(2)),
        })),
      });
    }

    return result;
  },

  /**
   * Calculate average duration for each production stage
   */
  async getAverageStageDurations() {
    try {
      const { data, error } = await supabase
        .from("production_stages")
        .select("stage_name, started_at, completed_at")
        .eq("status", "completed")
        .not("started_at", "is", null)
        .not("completed_at", "is", null);

      if (error) throw error;

      const durations = {};
      const counts = {};

      data.forEach((stage) => {
        const start = new Date(stage.started_at);
        const end = new Date(stage.completed_at);
        const durationHrs = (end - start) / (1000 * 60 * 60);

        if (!durations[stage.stage_name]) {
          durations[stage.stage_name] = 0;
          counts[stage.stage_name] = 0;
        }

        durations[stage.stage_name] += durationHrs;
        counts[stage.stage_name] += 1;
      });

      const averages = {};
      Object.keys(durations).forEach((stage) => {
        averages[stage] = durations[stage] / counts[stage];
      });

      return averages;
    } catch (error) {
      console.error("Error calculating average durations:", error);
      return {};
    }
  },

  /**
   * Identify batches that are taking longer than average for their current stage
   */
  async getBottlenecks() {
    try {
      const averages = await this.getAverageStageDurations();

      const { data: activeStages, error } = await supabase
        .from("production_stages")
        .select(`
            id,
            stage_name,
            started_at,
            batch_id,
            production_batches!inner (batch_number, status)
          `)
        .eq("status", "in_progress")
        .not("started_at", "is", null);

      if (error) throw error;

      const now = new Date();
      return activeStages
        .map((stage) => {
          const startedAt = new Date(stage.started_at);
          const currentDuration = (now - startedAt) / (1000 * 60 * 60);
          const avgDuration = averages[stage.stage_name] || 0;

          // Mark as bottleneck if it takes 50% longer than average (min 24h threshold if no avg)
          const threshold = avgDuration > 0 ? avgDuration * 1.5 : 24;

          return {
            ...stage,
            current_duration: parseFloat(currentDuration.toFixed(1)),
            average_duration: parseFloat(avgDuration.toFixed(1)),
            is_delayed: currentDuration > threshold,
            delay_ratio: avgDuration > 0 ? currentDuration / avgDuration : 1,
            batch_number: stage.production_batches?.batch_number,
          };
        })
        .filter((s) => s.is_delayed);
    } catch (error) {
      console.error("Error fetching bottlenecks:", error);
      return [];
    }
  },

  /**
   * Forecast material stock based on active production requirements
   */
  async getStockForecasting() {
    try {
      // 1. Get current stock
      const { data: materials } = await supabase
        .from("materials")
        .select("id, name, stock_quantity, min_stock_level, unit");

      // 2. Get requirements from active production batches
      const { data: requirements } = await supabase
        .from("production_materials")
        .select(`
            quantity_used,
            material_id,
            production_batches!inner (status)
          `)
        .neq("production_batches.status", "completed");

      const bookings = {};
      requirements?.forEach((req) => {
        bookings[req.material_id] =
          (bookings[req.material_id] || 0) + parseFloat(req.quantity_used || 0);
      });

      // 3. Compare and forecast
      return (materials || [])
        .map((m) => {
          const booked = bookings[m.id] || 0;
          const forecasted = parseFloat(m.stock_quantity || 0) - booked;
          return {
            ...m,
            booked,
            forecasted: parseFloat(forecasted.toFixed(2)),
            at_risk: forecasted <= parseFloat(m.min_stock_level || 0),
          };
        })
        .filter((m) => m.at_risk || m.booked > 0);
    } catch (error) {
      console.error("Error calculating stock forecasting:", error);
      return [];
    }
  },
};

