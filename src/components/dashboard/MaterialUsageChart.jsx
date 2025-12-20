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

export default function MaterialUsageChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Top Materials Used</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-center py-8 text-muted-foreground">
            No material usage data available
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Materials Used</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "11px" }}
                angle={-45}
                textAnchor="end"
                height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
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
      </CardContent>
    </Card>
  );
}

