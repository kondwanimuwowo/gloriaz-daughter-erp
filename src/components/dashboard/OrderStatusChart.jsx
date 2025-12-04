import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import Card from "../common/Card";
import { ShoppingCart } from "lucide-react";

const STATUS_COLORS = {
  enquiry: "#9ca3af",
  contacted: "#3b82f6",
  measurements: "#a855f7",
  production: "#eab308",
  fitting: "#f97316",
  completed: "#22c55e",
  delivered: "#10b981",
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

export default function OrderStatusChart({ ordersByStatus = {} }) {
  const data = Object.entries(ordersByStatus)
    .filter(([_, value]) => value > 0)
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "#9ca3af",
    }));

  if (data.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-primary-600" size={24} />
          Order Distribution
        </h2>
        <div className="text-center py-12 text-gray-500">
          No orders to display
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingCart className="text-primary-600" size={24} />
        Order Distribution
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
