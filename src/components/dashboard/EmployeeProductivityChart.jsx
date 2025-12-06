import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import Card from "../common/Card";

export default function EmployeeProductivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Employee Productivity
        </h3>
        <div className="text-center py-8 text-gray-500">
          No productivity data available
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Employee Productivity
      </h3>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" style={{ fontSize: "12px" }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#666"
              style={{ fontSize: "12px" }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                if (name === "hours") return [value.toFixed(1), "Hours Worked"];
                if (name === "orders") return [value, "Orders Completed"];
                return value;
              }}
            />
            <Legend />
            <Bar
              dataKey="hours"
              fill="#10b981"
              name="Hours Worked"
              radius={[0, 8, 8, 0]}
            />
            <Bar
              dataKey="orders"
              fill="#3b82f6"
              name="Orders Completed"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
