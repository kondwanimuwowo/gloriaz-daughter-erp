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

export default function InventoryTurnoverChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Inventory Turnover</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="text-center py-8 text-muted-foreground">
                No inventory turnover data available
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                }}
                formatter={(value, name) => {
                    if (name === "totalCost")
                    return [`K${Number(value).toLocaleString()}`, "Total Cost"];
                    return [Number(value).toLocaleString(), name];
                }}
                />
                <Legend />
                <Bar dataKey="totalCost" fill="#ec4899" name="Total Cost" />
            </BarChart>
            </ResponsiveContainer>

            {/* Category Breakdown for Latest Month */}
            {data.length > 0 && data[data.length - 1].categories.length > 0 && (
            <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                Latest Month Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data[data.length - 1].categories.map((cat) => (
                    <div
                    key={cat.category}
                    className="bg-muted/50 rounded-lg p-3 border"
                    >
                    <p className="text-xs text-muted-foreground capitalize">
                        {cat.category}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                        K{cat.cost.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {cat.quantity.toLocaleString()} units
                    </p>
                    </div>
                ))}
                </div>
            </div>
            )}
        </motion.div>
      </CardContent>
    </Card>
  );
}

