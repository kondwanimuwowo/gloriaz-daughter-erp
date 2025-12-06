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

export default function MaterialUsageChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Materials Used
        </h3>
        <div className="text-center py-8 text-gray-500">
          No material usage data available
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Materials Used
      </h3>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              stroke="#666"
              style={{ fontSize: "11px" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#666" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                const n = Number(value);
                const isNum = Number.isFinite(n);
                const lname = String(name || "").toLowerCase();
                if (isNum) {
                  if (lname.includes("quantity"))
                    return [n.toFixed(2), "Quantity Used"];
                  if (lname.includes("cost"))
                    return [`K${n.toFixed(2)}`, "Total Cost"];
                  return [n, name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar
              dataKey="quantity"
              fill="#ec4899"
              name="Quantity Used"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="cost"
              fill="#8b5cf6"
              name="Total Cost"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
