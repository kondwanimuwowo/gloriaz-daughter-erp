import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  enquiry: "#6b7280",
  contacted: "#3b82f6",
  measurements: "#8b5cf6",
  production: "#eab308",
  fitting: "#f97316",
  completed: "#10b981",
  delivered: "#059669",
  cancelled: "#ef4444",
};

const STATUS_LABELS = {
  enquiry: "Enquiry",
  contacted: "Contacted",
  measurements: "Measurements",
  production: "Production",
  fitting: "Fitting",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderStatusChart({ data }) {
  // Check if we have valid data
  const hasData =
    data &&
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
             <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <svg
                    className="w-16 h-16 mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
                <p className="text-sm">No orders yet</p>
                <p className="text-xs mt-1">
                    Create your first order to see the distribution
                </p>
             </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name:
      STATUS_LABELS[item.status] ||
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    status: item.status,
  }));

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
            Orders by Status
            <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({totalOrders} total)
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                >
                {chartData.map((entry, index) => (
                    <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status] || "#999"}
                    />
                ))}
                </Pie>
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                }}
                formatter={(value, name) => [`${value} orders`, name]}
                />
                <Legend />
            </PieChart>
            </ResponsiveContainer>
        </motion.div>

        {/* Legend with counts */}
        <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item) => (
            <div
                key={item.status}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded"
            >
                <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[item.status] }}
                />
                <span className="text-sm text-foreground truncate">
                {item.name}: <strong>{item.value}</strong>
                </span>
            </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

