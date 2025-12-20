import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerAnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-center py-8 text-muted-foreground">
            No customer data available
            </div>
        </CardContent>
      </Card>
    );
  }

  // Take top 10 customers
  const topCustomers = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis
                type="category"
                dataKey="customerName"
                width={150}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                />
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                }}
                formatter={(value, name) => {
                    if (name === "totalSpent")
                    return [`K${Number(value).toLocaleString()}`, "Total Spent"];
                    if (name === "orderCount") return [value, "Orders"];
                    if (name === "avgOrderValue")
                    return [`K${Number(value).toLocaleString()}`, "Avg Order"];
                    return [value, name];
                }}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill="#ec4899" name="Total Spent" />
                <Bar dataKey="orderCount" fill="#8b5cf6" name="Order Count" />
            </BarChart>
            </ResponsiveContainer>

            {/* Customer Details Table */}
            <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                <tr>
                    <th className="px-4 py-2 text-left font-semibold">
                    Customer
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                    Orders
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                    Total Spent
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                    Avg Order
                    </th>
                </tr>
                </thead>
                <tbody>
                {topCustomers.map((customer, index) => (
                    <tr
                    key={customer.customerId}
                    className="border-t hover:bg-muted/50 transition-colors"
                    >
                    <td className="px-4 py-2">{customer.customerName}</td>
                    <td className="px-4 py-2 text-right">
                        {customer.orderCount}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-primary">
                        K{customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                        K{customer.avgOrderValue.toLocaleString()}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

