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
    const progressPercentage = Math.max(0, (currentIndex / (statuses.length - 1)) * 100);

    return (
        <div className={cn("relative space-y-8", className)}>
            {/* Main Progress Line Background (Gray) */}
            <div className="absolute left-5 top-2 bottom-6 w-0.5 bg-slate-200 -translate-x-1/2 md:left-1/2 md:-translate-x-0.5" />

            {/* Active Progress Line (Colored) - Animated Height */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute left-5 top-2 w-0.5 bg-primary -translate-x-1/2 md:left-1/2 md:-translate-x-0.5 origin-top max-h-[calc(100%-2rem)]"
            />

            {statuses.map((status, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                    <motion.div
                        key={status.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className={cn(
                            "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
                            isPending && "opacity-60 grayscale"
                        )}
                    >
                        {/* Start Point for Line Context (Hidden but structural) */}
                        <div className="absolute md:left-1/2 md:-ml-px h-full w-px" />

                        {/* Icon Badge */}
                        <motion.div
                            initial={false}
                            animate={{
                                scale: isActive ? 1.2 : 1,
                                backgroundColor: isCompleted || isActive ? "var(--primary)" : "#e2e8f0",
                                borderColor: isActive ? "var(--primary)" : "#ffffff"
                            }}
                            className={cn(
                                "z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 shadow-sm shrink-0 md:group-odd:translate-x-[50%] md:group-even:-translate-x-[50%] md:absolute md:left-1/2 md:-ml-5 transition-colors duration-500",
                                isCompleted || isActive ? "text-white bg-primary" : "text-slate-400 bg-slate-200"
                            )}
                        >
                            <status.icon className="w-5 h-5" />
                        </motion.div>

                        {/* Content Card with Connector Arrow */}
                        <div className={cn(
                            "w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border transition-all duration-300 relative",
                            isActive ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20" : "border-slate-200 bg-white shadow-sm hover:shadow-md"
                        )}>
                            {/* Connector Arrow (Desktop Only) */}
                            <div className={cn(
                                "hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 border-t border-r bg-inherit",
                                index % 2 === 0 ? "-left-2 border-l border-b border-t-0 border-r-0" : "-right-2 border-l-0 border-b-0"
                            )} />

                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className={cn("font-bold", isActive ? "text-primary" : "text-slate-900")}>
                                    {status.label}
                                </div>
                                {isActive && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                                )}
                            </div>
                            <div className="text-slate-500 text-sm leading-relaxed">{status.description}</div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
