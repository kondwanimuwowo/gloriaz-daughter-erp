import { motion } from "framer-motion";
import Card from "../common/Card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  delay = 0,
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    primary: "bg-primary-100 text-primary-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
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
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
          >
            <Icon size={28} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
