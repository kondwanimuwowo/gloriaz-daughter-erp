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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeProductivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Employee Productivity</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-center py-8 text-muted-foreground">
            No productivity data available
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                width={100}
                />
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
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
      </CardContent>
    </Card>
  );
}

