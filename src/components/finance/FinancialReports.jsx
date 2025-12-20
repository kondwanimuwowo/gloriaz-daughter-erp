import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { financialService } from "../../services/financialService";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function FinancialReports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYearlyData();
  }, [selectedYear]);

  const loadYearlyData = async () => {
    setLoading(true);
    try {
      const data =
        await financialService.getYearlyFinancialSummary(selectedYear);
      setYearlyData(data);
    } catch (error) {
      toast.error("Failed to load yearly data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Month",
      "Orders",
      "Revenue",
      "Material Cost",
      "Labour Cost",
      "Overhead",
      "Profit",
      "Profit %",
    ];
    const rows = yearlyData.map((month) => [
      month.month,
      month.totalOrders,
      month.totalRevenue.toFixed(2),
      month.totalMaterialCost.toFixed(2),
      month.totalLabourCost.toFixed(2),
      month.totalOverhead.toFixed(2),
      month.totalProfit.toFixed(2),
      month.avgProfitMargin.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${selectedYear}.csv`;
    a.click();

    toast.success("Report exported successfully!");
  };

  const yearlyTotals = yearlyData.reduce(
    (acc, month) => ({
      orders: acc.orders + month.totalOrders,
      revenue: acc.revenue + month.totalRevenue,
      materialCost: acc.materialCost + month.totalMaterialCost,
      labourCost: acc.labourCost + month.totalLabourCost,
      overhead: acc.overhead + month.totalOverhead,
      profit: acc.profit + month.totalProfit,
    }),
    {
      orders: 0,
      revenue: 0,
      materialCost: 0,
      labourCost: 0,
      overhead: 0,
      profit: 0,
    }
  );

  const avgProfitMargin =
    yearlyTotals.revenue > 0
      ? (yearlyTotals.profit / yearlyTotals.revenue) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Financial Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive yearly financial analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <Button onClick={exportToCSV} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Yearly Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
                K{yearlyTotals.revenue.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
                {yearlyTotals.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Profit</p>
            <p className="text-3xl font-bold text-blue-600">
                K{yearlyTotals.profit.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
                {avgProfitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Costs</p>
            <p className="text-3xl font-bold text-orange-600">
                K
                {(
                yearlyTotals.materialCost +
                yearlyTotals.labourCost +
                yearlyTotals.overhead
                ).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">All expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Avg Monthly Revenue</p>
            <p className="text-3xl font-bold text-purple-600">
                K{(yearlyTotals.revenue / 12).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Month
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                        Orders
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Revenue
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Material
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Labour
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Overhead
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Profit
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Margin %
                    </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {yearlyData.map((month, index) => (
                    <motion.tr
                        key={month.month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/50 transition-colors"
                    >
                        <td className="px-4 py-3 font-medium text-foreground">
                        {month.month}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                        {month.totalOrders}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                        K{month.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                        K{month.totalMaterialCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                        K{month.totalLabourCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                        K{month.totalOverhead.toFixed(2)}
                        </td>
                        <td
                        className={`px-4 py-3 text-right font-bold ${
                            month.totalProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                        >
                        K{month.totalProfit.toFixed(2)}
                        </td>
                        <td
                        className={`px-4 py-3 text-right font-semibold ${
                            month.avgProfitMargin >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                        >
                        {month.avgProfitMargin.toFixed(1)}%
                        </td>
                    </motion.tr>
                    ))}
                </tbody>
                <tfoot className="bg-muted/50 border-t-2 border-border">
                    <tr className="font-bold">
                    <td className="px-4 py-4 text-foreground">TOTAL</td>
                    <td className="px-4 py-4 text-center text-foreground">
                        {yearlyTotals.orders}
                    </td>
                    <td className="px-4 py-4 text-right text-primary">
                        K{yearlyTotals.revenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-foreground">
                        K{yearlyTotals.materialCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-foreground">
                        K{yearlyTotals.labourCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-foreground">
                        K{yearlyTotals.overhead.toFixed(2)}
                    </td>
                    <td
                        className={`px-4 py-4 text-right ${
                        yearlyTotals.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                    >
                        K{yearlyTotals.profit.toFixed(2)}
                    </td>
                    <td
                        className={`px-4 py-4 text-right ${
                        avgProfitMargin >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {avgProfitMargin.toFixed(1)}%
                    </td>
                    </tr>
                </tfoot>
                </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

