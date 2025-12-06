import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check, Circle } from "lucide-react";

const STATUSES = [
  { key: "enquiry", label: "Enquiry" },
  { key: "contacted", label: "Contacted" },
  { key: "measurements", label: "Measurements" },
  { key: "production", label: "Production" },
  { key: "fitting", label: "Fitting" },
  { key: "completed", label: "Completed" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderTimeline({ timeline, currentStatus }) {
  const statusIndex = STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      {/* Progress Line */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${(statusIndex / (STATUSES.length - 1)) * 100}%` }}
        transition={{ duration: 0.5 }}
        className="absolute left-4 top-0 w-0.5 bg-primary-600"
      ></motion.div>

      {/* Timeline Items */}
      <div className="space-y-6">
        {STATUSES.map((status, index) => {
          const timelineEntry = timeline.find((t) => t.status === status.key);
          const isCompleted = index <= statusIndex;
          const isCurrent = index === statusIndex;

          return (
            <motion.div
              key={status.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Status Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isCompleted
                    ? "bg-primary-600 border-primary-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <Circle
                    size={8}
                    className={isCurrent ? "text-primary-600" : "text-gray-300"}
                  />
                )}
              </div>

              {/* Status Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <h3
                    className={`font-semibold ${
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {status.label}
                  </h3>
                  {timelineEntry && (
                    <span className="text-xs text-gray-500">
                      {format(
                        new Date(timelineEntry.created_at),
                        "MMM dd, hh:mm a"
                      )}
                    </span>
                  )}
                </div>
                {timelineEntry?.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {timelineEntry.notes}
                  </p>
                )}
                {isCurrent && !timelineEntry && (
                  <p className="text-sm text-primary-600 mt-1">
                    Current Status
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
