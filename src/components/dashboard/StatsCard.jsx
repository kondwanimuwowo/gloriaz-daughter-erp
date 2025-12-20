import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const iconColorClasses = {
  blue: "bg-blue-50 text-blue-500",
  green: "bg-emerald-50 text-emerald-500",
  red: "bg-red-50 text-red-500",
  yellow: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-500",
  orange: "bg-orange-50 text-orange-500",
  pink: "bg-pink-50 text-pink-500",
  indigo: "bg-indigo-50 text-indigo-500",
  cyan: "bg-cyan-50 text-cyan-500",
  default: "bg-muted/30 text-muted-foreground/60",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "default",
  trend,
  delay = 0,
}) {
  const iconClasses = iconColorClasses[color] || iconColorClasses.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card className="hover:shadow-md transition-all duration-200 h-full relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <p className="text-sm text-muted-foreground mb-1 font-medium">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-auto">{subtitle}</p>}
            {trend && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  parseFloat(trend) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {parseFloat(trend) >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span>{Math.abs(parseFloat(trend))}% vs last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center",
            iconClasses
          )}>
            <Icon size={20} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

