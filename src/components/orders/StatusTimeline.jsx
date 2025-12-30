import { motion } from "framer-motion";
import {
    CheckCircle2,
    Circle,
    Clock,
    Scissors,
    Languages,
    Truck,
    ShoppingBag,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = [
    { id: "enquiry", label: "Enquiry", icon: Clock, description: "Customer initial request" },
    { id: "measurements", label: "Measurements", icon: Languages, description: "Tailoring details recorded" },
    { id: "cutting", label: "Cutting", icon: Scissors, description: "Fabric preparation started" },
    { id: "stitching", label: "Stitching", icon: Circle, description: "Garment assembly in progress" },
    { id: "fitting", label: "Fitting", icon: AlertCircle, description: "Customer trial and adjustments" },
    { id: "completed", label: "Ready", icon: CheckCircle2, description: "Final quality check passed" },
    { id: "delivered", label: "Delivered", icon: Truck, description: "Order collected by customer" }
];

export function StatusTimeline({ currentStatus, className = "" }) {
    const currentIndex = statuses.findIndex(s => s.id === currentStatus);

    return (
        <div className={cn("space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent", className)}>
            {statuses.map((status, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                    <motion.div
                        key={status.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active",
                            isPending && "opacity-50"
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300",
                            isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary text-white scale-110 z-10 ring-4 ring-primary/20" : "bg-slate-200 text-slate-500"
                        )}>
                            <status.icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900">{status.label}</div>
                                {isActive && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                                )}
                            </div>
                            <div className="text-slate-500 text-sm">{status.description}</div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
