import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
    Scissors,
    Calendar,
    Package,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
    { id: "cutting", label: "Cutting", icon: Scissors, color: "text-orange-600", bg: "bg-orange-100" },
    { id: "stitching", label: "Stitching", icon: Circle, color: "text-yellow-600", bg: "bg-yellow-100" },
    { id: "finishing", label: "Finishing", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
    { id: "quality_check", label: "Quality Check", icon: AlertCircle, color: "text-purple-600", bg: "bg-purple-100" },
    { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" }
];

const BatchDetailsModal = ({ isOpen, onClose, batch, onStatusUpdate }) => {
    if (!batch) return null;

    const currentStageIndex = STAGES.findIndex(s => s.id === batch.status);
    const progress = Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100);

    const getNextStatus = () => {
        if (currentStageIndex < STAGES.length - 1) {
            return STAGES[currentStageIndex + 1].id;
        }
        return null;
    };

    const nextStatusId = getNextStatus();
    const nextStage = nextStatusId ? STAGES.find(s => s.id === nextStatusId) : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                                {batch.product?.image_url ? (
                                    <img
                                        src={batch.product.image_url}
                                        alt={batch.product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={cn(
                                    "w-full h-full flex items-center justify-center text-slate-400",
                                    batch.product?.image_url ? "hidden" : "flex"
                                )}>
                                    <Scissors size={24} />
                                </div>
                            </div>

                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    {batch.product?.name || "Unknown Product"}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {batch.batch_number}
                                    </Badge>
                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                        <Package size={14} />
                                        Qty: {batch.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Badge className={cn(
                            "px-3 py-1 capitalize",
                            STAGES.find(s => s.id === batch.status)?.bg,
                            STAGES.find(s => s.id === batch.status)?.color
                        )}>
                            {STAGES.find(s => s.id === batch.status)?.label || batch.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <Separator />

                <div className="space-y-6 p-6 py-4 overflow-y-auto">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-600">Production Progress</span>
                            <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Timeline Stages */}
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                        <div className="space-y-6 relative">
                            {STAGES.map((stage, index) => {
                                const isCompleted = index <= currentStageIndex;
                                const isCurrent = index === currentStageIndex;

                                return (
                                    <div key={stage.id} className={cn(
                                        "flex items-center gap-4 group",
                                        isCompleted ? "opacity-100" : "opacity-40"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-all",
                                            isCurrent ? "border-primary text-primary shadow-md scale-110" :
                                                isCompleted ? "border-green-500 text-green-600" : "border-slate-200 text-slate-300"
                                        )}>
                                            <stage.icon size={20} />
                                        </div>
                                        <div className={cn(
                                            "flex-1 p-3 rounded-xl border transition-all",
                                            isCurrent ? "bg-white border-primary/30 shadow-sm" : "border-transparent"
                                        )}>
                                            <p className={cn("font-bold text-sm", isCurrent ? "text-slate-900" : "text-slate-600")}>
                                                {stage.label}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-xs text-primary font-medium mt-0.5 animate-pulse">
                                                    In Progress...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase font-bold">Started On</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar size={14} className="text-slate-400" />
                                {format(new Date(batch.created_at), "PPP")}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase font-bold">Estimated Completion</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock size={14} className="text-slate-400" />
                                {format(new Date(new Date(batch.created_at).setDate(new Date(batch.created_at).getDate() + 7)), "PPP")}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 border-t mt-auto">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {nextStage && (
                        <Button
                            onClick={() => onStatusUpdate(batch.id, nextStage.id, batch)}
                            className="bg-primary hover:bg-primary/90 gap-2"
                        >
                            Move to {nextStage.label}
                            <ArrowRight size={16} />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BatchDetailsModal;
