import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfitabilityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Profitability Analysis</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="text-center py-8 text-muted-foreground">
                No profitability data available
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profitability Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
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
                    if (name === "profitMargin")
                    return [`${Number(value).toFixed(1)}%`, "Profit Margin"];
                    return [`K${Number(value).toLocaleString()}`, name];
                }}
                />
                <Legend />
                <Bar dataKey="revenue" stackId="a" fill="#10b981" name="Revenue" />
                <Bar
                dataKey="materialCost"
                stackId="b"
                fill="#ef4444"
                name="Materials"
                />
                <Bar dataKey="laborCost" stackId="b" fill="#f59e0b" name="Labor" />
                <Bar
                dataKey="overheadCost"
                stackId="b"
                fill="#8b5cf6"
                name="Overhead"
                />
                <Line
                type="monotone"
                dataKey="netProfit"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: "#ec4899", r: 5 }}
                name="Net Profit"
                />
                <Line
                type="monotone"
                dataKey="profitMargin"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#3b82f6", r: 4 }}
                name="Profit Margin %"
                yAxisId="right"
                />
            </ComposedChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            {data.length > 0 &&
                (() => {
                const latest = data[data.length - 1];
                return (
                    <>
                    <div>
                        <p className="text-xs text-muted-foreground">Gross Profit</p>
                        <p className="text-lg font-bold text-green-600">
                        K{latest.grossProfit.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Net Profit</p>
                        <p className="text-lg font-bold text-primary">
                        K{latest.netProfit.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Profit Margin</p>
                        <p className="text-lg font-bold text-blue-600">
                        {latest.profitMargin.toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Costs</p>
                        <p className="text-lg font-bold text-red-600">
                        K{latest.totalCost.toLocaleString()}
                        </p>
                    </div>
                    </>
                );
                })()}
            </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

