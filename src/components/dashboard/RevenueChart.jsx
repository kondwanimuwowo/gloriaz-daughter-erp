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
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="text-center py-8 text-muted-foreground">
                No revenue data available
             </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `K${value ?? 0}`}
                />
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                }}
                formatter={(value) => {
                    const n = Number(value);
                    const num = Number.isFinite(n) ? n : 0;
                    return [`K${num.toFixed(2)}`, "Revenue"];
                }}
                />
                <Legend />
                <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
                activeDot={{ r: 7 }}
                name="Revenue"
                />
            </LineChart>
            </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}

