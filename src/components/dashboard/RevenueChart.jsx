import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "../common/Card";
import { TrendingUp } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function RevenueChart({ monthlyRevenue = [] }) {
  const data = MONTHS.map((month, index) => ({
    name: month,
    revenue: monthlyRevenue[index] || 0,
  }));

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={24} />
            Revenue Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monthly revenue for {new Date().getFullYear()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total This Year</p>
          <p className="text-2xl font-bold text-primary-600">
            K{monthlyRevenue.reduce((sum, val) => sum + val, 0).toFixed(0)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `K${value}`}
          />
          <Tooltip
            formatter={(value) => [`K${value.toFixed(2)}`, "Revenue"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ec4899"
            strokeWidth={3}
            dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
