import React, { useState, useEffect } from "react";
import { X, Clock, Package, CheckCircle, AlertTriangle, Plus, Trash2, User, Calendar, Save, Edit2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const BatchDetailsModal = ({ isOpen, onClose, batch, onStatusUpdate }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("timeline");
    const [logs, setLogs] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [materialQuantity, setMaterialQuantity] = useState("");
    const [loading, setLoading] = useState(false);
    const [stageComment, setStageComment] = useState("");
    const [isEditingLabor, setIsEditingLabor] = useState(false);
    const [tempLaborCost, setTempLaborCost] = useState("");

    useEffect(() => {
        if (isOpen && batch) {
            fetchLogs();
            fetchMaterials();
            fetchAvailableMaterials();
        }
    }, [isOpen, batch]);

    const fetchLogs = async () => {
        try {
            // Fetch logs without foreign key join
            const { data: logsData, error: logsError } = await supabase
                .from("production_logs")
                .select("*")
                .eq("batch_id", batch.id)
                .order("created_at", { ascending: false });

            if (logsError) throw logsError;

            // Fetch user profiles separately
            const userIds = [...new Set(logsData.map(log => log.user_id).filter(Boolean))];
            if (userIds.length > 0) {
                const { data: usersData } = await supabase
                    .from("user_profiles")
                    .select("id, full_name")
                    .in("id", userIds);

                // Map users to logs
                const logsWithUsers = logsData.map(log => ({
                    ...log,
                    user: usersData?.find(u => u.id === log.user_id) || null
                }));
                setLogs(logsWithUsers);
            } else {
                setLogs(logsData || []);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    const fetchMaterials = async () => {
        try {
            const { data, error } = await supabase
                .from("production_materials")
                .select(`
                    *,
                    material:materials(name, unit, cost_per_unit)
                `)
                .eq("batch_id", batch.id);

            if (error) throw error;
            setMaterials(data || []);
        } catch (error) {
            console.error("Error fetching materials:", error);
        }
    };

    const fetchAvailableMaterials = async () => {
        try {
            const { data, error } = await supabase
                .from("materials")
                .select("*")
                .eq("material_type", "raw_material")
                .gt("stock_quantity", 0)
                .order("name");

            if (error) throw error;
            setAvailableMaterials(data || []);
        } catch (error) {
            console.error("Error fetching available materials:", error);
        }
    };

    const addMaterial = async () => {
        if (!selectedMaterial || !materialQuantity || parseFloat(materialQuantity) <= 0) {
            toast.error("Please select a material and enter a valid quantity");
            return;
        }

        try {
            setLoading(true);
            const material = availableMaterials.find(m => m.id === selectedMaterial);
            const quantity = parseFloat(materialQuantity);

            if (quantity > material.stock_quantity) {
                toast.error(`Insufficient stock. Available: ${material.stock_quantity} ${material.unit}`);
                return;
            }

            const cost = quantity * material.cost_per_unit;

            // Add to production_materials
            const { error: materialError } = await supabase
                .from("production_materials")
                .insert({
                    batch_id: batch.id,
                    material_id: material.id,
                    quantity_used: quantity,
                    cost: cost
                });

            if (materialError) throw materialError;

            // Deduct from inventory
            const { error: inventoryError } = await supabase
                .from("materials")
                .update({ stock_quantity: material.stock_quantity - quantity })
                .eq("id", material.id);

            if (inventoryError) throw inventoryError;

            // Log the action
            await supabase.from("production_logs").insert({
                batch_id: batch.id,
                user_id: user?.id,
                action: "material_added",
                details: `Added ${quantity} ${material.unit} of ${material.name}`,
                metadata: { material_id: material.id, quantity, cost }
            });

            // Update batch material_cost
            const totalMaterialCost = materials.reduce((sum, m) => sum + parseFloat(m.cost), 0) + cost;
            await supabase
                .from("production_batches")
                .update({ material_cost: totalMaterialCost })
                .eq("id", batch.id);

            toast.success("Material added successfully");
            setSelectedMaterial("");
            setMaterialQuantity("");
            fetchMaterials();
            fetchAvailableMaterials();
            fetchLogs();
        } catch (error) {
            console.error("Error adding material:", error);
            toast.error("Failed to add material");
        } finally {
            setLoading(false);
        }
    };

    const removeMaterial = async (materialRecord) => {
        try {
            setLoading(true);

            // Return to inventory
            const { error: inventoryError } = await supabase
                .from("materials")
                .update({
                    stock_quantity: supabase.raw(`stock_quantity + ${materialRecord.quantity_used}`)
                })
                .eq("id", materialRecord.material_id);

            if (inventoryError) throw inventoryError;

            // Remove from production_materials
            const { error: deleteError } = await supabase
                .from("production_materials")
                .delete()
                .eq("id", materialRecord.id);

            if (deleteError) throw deleteError;

            // Log the action
            await supabase.from("production_logs").insert({
                batch_id: batch.id,
                user_id: user?.id,
                action: "material_removed",
                details: `Removed ${materialRecord.quantity_used} ${materialRecord.material?.unit} of ${materialRecord.material?.name}`,
                metadata: { material_id: materialRecord.material_id, quantity: materialRecord.quantity_used }
            });

            // Update batch material_cost
            const totalMaterialCost = materials.reduce((sum, m) => sum + parseFloat(m.cost), 0) - parseFloat(materialRecord.cost);
            await supabase
                .from("production_batches")
                .update({ material_cost: Math.max(0, totalMaterialCost) })
                .eq("id", batch.id);

            toast.success("Material removed");
            fetchMaterials();
            fetchAvailableMaterials();
            fetchLogs();
        } catch (error) {
            console.error("Error removing material:", error);
            toast.error("Failed to remove material");
        } finally {
            setLoading(false);
        }
    };

    const handleNextStage = async () => {
        const stages = ["cutting", "stitching", "finishing", "quality_check", "completed"];
        const currentIndex = stages.indexOf(batch.status);
        if (currentIndex >= stages.length - 1) return;

        const nextStage = stages[currentIndex + 1];

        // Check if materials are added before allowing to start production
        if (batch.status === "cutting" && materials.length === 0) {
            toast.error("Please add materials before starting production");
            return;
        }

        try {
            // Update the current stage to completed
            const { data: currentStageData } = await supabase
                .from("production_stages")
                .select("*")
                .eq("batch_id", batch.id)
                .eq("stage_name", batch.status)
                .single();

            if (currentStageData) {
                await supabase
                    .from("production_stages")
                    .update({
                        status: "completed",
                        completed_at: new Date().toISOString()
                    })
                    .eq("id", currentStageData.id);

                // Log stage completion
                await supabase.from("production_logs").insert({
                    batch_id: batch.id,
                    user_id: user?.id,
                    action: "stage_completed",
                    details: `Completed ${getStageLabel(batch.status)}`,
                    metadata: {
                        stage: batch.status,
                        completed_at: new Date().toISOString()
                    }
                });
            }

            // Create or update next stage
            if (nextStage !== "completed") {
                const { data: nextStageData } = await supabase
                    .from("production_stages")
                    .select("*")
                    .eq("batch_id", batch.id)
                    .eq("stage_name", nextStage)
                    .single();

                if (nextStageData) {
                    await supabase
                        .from("production_stages")
                        .update({
                            status: "in_progress",
                            started_at: new Date().toISOString()
                        })
                        .eq("id", nextStageData.id);
                } else {
                    await supabase
                        .from("production_stages")
                        .insert({
                            batch_id: batch.id,
                            stage_name: nextStage,
                            status: "in_progress",
                            started_at: new Date().toISOString()
                        });
                }

                // Log stage start
                await supabase.from("production_logs").insert({
                    batch_id: batch.id,
                    user_id: user?.id,
                    action: "stage_started",
                    details: `Started ${getStageLabel(nextStage)}`,
                    metadata: {
                        stage: nextStage,
                        started_at: new Date().toISOString()
                    }
                });
            }

            // Update batch status
            onStatusUpdate(batch.id, nextStage, batch);
            fetchLogs(); // Refresh timeline
        } catch (error) {
            console.error("Error updating stage:", error);
            toast.error("Failed to update stage");
        }
    };

    const handleUpdateLaborCost = async () => {
        const newCost = parseFloat(tempLaborCost);
        if (isNaN(newCost) || newCost < 0) {
            toast.error("Invalid labor cost");
            return;
        }

        try {
            await supabase
                .from("production_batches")
                .update({ labor_cost: newCost })
                .eq("id", batch.id);

            // Log the change
            await supabase.from("production_logs").insert({
                batch_id: batch.id,
                user_id: user?.id,
                action: "cost_updated",
                details: `Updated labor cost to K${newCost}`,
                metadata: {
                    old_cost: batch.labor_cost,
                    new_cost: newCost,
                    timestamp: new Date().toISOString()
                }
            });

            // Update local batch object via onStatusUpdate callback or just force refresh
            // Since we don't have a direct way to update parent state without refetching, 
            // we'll rely on the parent to refetch or assume the user sees the change next time if we don't fix it locally.
            // But we should try to update the local batch cost for immediate feedback.
            // However, batch prop is immutable. We can trigger onStatusUpdate with same status but updated batch info?
            // Actually, best to just close edit mode and let the user know. 
            // Ideally we'd have a refresh callback.

            toast.success("Labor cost updated");
            setIsEditingLabor(false);

            // To update the visible total, we might need to update the batch prop or internal state if we had one.
            // We can trick it by calling success and maybe the parent re-renders? 
            // No, we need to manually update text or reload. The simplest way is to trigger a page refresh or ask parent to reload.
            // Reuse onStatusUpdate to pass the updated batch? 
            // onStatusUpdate(batch.id, batch.status, { ...batch, labor_cost: newCost });
            onStatusUpdate(batch.id, batch.status, { ...batch, labor_cost: newCost });

        } catch (error) {
            console.error("Error updating labor cost:", error);
            toast.error("Failed to update labor cost");
        }
    };


    const handleAddComment = async () => {
        if (!stageComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        try {
            setLoading(true);
            await supabase.from("production_logs").insert({
                batch_id: batch.id,
                user_id: user?.id,
                action: "comment_added",
                details: stageComment.trim(),
                metadata: {
                    stage: batch.status,
                    timestamp: new Date().toISOString()
                }
            });

            toast.success("Comment added");
            setStageComment("");
            fetchLogs();
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        } finally {
            setLoading(false);
        }
    };

    const getStageIcon = (stage) => {
        switch (stage) {
            case "cutting": return "✂️";
            case "stitching": return "🧵";
            case "finishing": return "✨";
            case "quality_check": return "🔍";
            case "completed": return "✅";
            default: return "📦";
        }
    };

    const getStageLabel = (stage) => {
        return stage.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    const totalMaterialCost = materials.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);
    const estimatedLaborCost = batch?.labor_cost || 0;
    const totalCost = totalMaterialCost + estimatedLaborCost;

    if (!batch) return null;

    const stages = ["cutting", "stitching", "finishing", "quality_check", "completed"];
    const currentStageIndex = stages.indexOf(batch.status);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                {batch.product?.name || "Production Batch"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                Batch #{batch.batch_number} • Quantity: {batch.quantity}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Stage Progression Indicator */}
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                        {stages.map((stage, index) => (
                            <React.Fragment key={stage}>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${index === currentStageIndex
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : index < currentStageIndex
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-400"
                                    }`}>
                                    <span>{getStageIcon(stage)}</span>
                                    <span className="text-sm whitespace-nowrap">{getStageLabel(stage)}</span>
                                </div>
                                {index < stages.length - 1 && (
                                    <div className={`h-0.5 w-8 ${index < currentStageIndex ? "bg-green-500" : "bg-gray-300"}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="mx-6 mt-4">
                        <TabsTrigger value="timeline">
                            <Clock className="mr-2" size={16} />
                            Timeline & History
                        </TabsTrigger>
                        <TabsTrigger value="materials">
                            <Package className="mr-2" size={16} />
                            Materials & Costing
                        </TabsTrigger>
                        <TabsTrigger value="quality">
                            <CheckCircle className="mr-2" size={16} />
                            Quality & Notes
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <TabsContent value="timeline" className="mt-4 space-y-4">
                            {/* Add Comment Section */}
                            {batch.status !== "completed" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <Clock size={16} />
                                        Add Note for Current Stage ({getStageLabel(batch.status)})
                                    </h3>
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={stageComment}
                                            onChange={(e) => setStageComment(e.target.value)}
                                            placeholder="e.g., Used special stitching technique, found minor defect..."
                                            className="flex-1 min-h-[60px]"
                                            disabled={loading}
                                        />
                                        <Button
                                            onClick={handleAddComment}
                                            disabled={loading || !stageComment.trim()}
                                            className="self-end"
                                        >
                                            Add Note
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Timeline History */}
                            {logs.length > 0 ? (
                                <div className="space-y-3">
                                    {logs.map((log) => {
                                        const isStageEvent = log.action.includes("stage");
                                        const isCompletion = log.action === "stage_completed";

                                        return (
                                            <div key={log.id} className={`flex gap-3 p-3 rounded-lg border ${isCompletion ? "bg-green-50 border-green-200" : "bg-gray-50"
                                                }`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompletion ? "bg-green-100" :
                                                    isStageEvent ? "bg-blue-100" :
                                                        "bg-primary/10"
                                                    }`}>
                                                    {log.action.includes("material") ? (
                                                        <Package size={18} className="text-primary" />
                                                    ) : log.action === "batch_created" ? (
                                                        <Plus size={18} className="text-primary" />
                                                    ) : isCompletion ? (
                                                        <CheckCircle size={18} className="text-green-600" />
                                                    ) : (
                                                        <Clock size={18} className="text-blue-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${isCompletion ? "text-green-900" : "text-gray-900"
                                                        }`}>
                                                        {log.details}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        {log.user?.full_name && (
                                                            <>
                                                                <User size={12} />
                                                                <span>{log.user.full_name}</span>
                                                                <span>•</span>
                                                            </>
                                                        )}
                                                        <Calendar size={12} />
                                                        <span className={isCompletion ? "font-semibold text-green-700" : ""}>
                                                            {format(new Date(log.created_at), "MMM d, h:mm a")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="mx-auto mb-3 text-gray-300" size={48} />
                                    <p>No activity logged yet</p>
                                    <p className="text-sm mt-1">Actions will appear here as the batch progresses</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="materials" className="mt-4 space-y-4">
                            {/* Add Material Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <Plus size={18} />
                                    Add Materials
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <Label>Material</Label>
                                        <select
                                            value={selectedMaterial}
                                            onChange={(e) => setSelectedMaterial(e.target.value)}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                            disabled={loading}
                                        >
                                            <option value="">Select material...</option>
                                            {availableMaterials.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} (Stock: {m.stock_quantity} {m.unit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Quantity</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                type="number"
                                                value={materialQuantity}
                                                onChange={(e) => setMaterialQuantity(e.target.value)}
                                                placeholder="0"
                                                disabled={loading}
                                                min="0"
                                                step="0.01"
                                            />
                                            <Button onClick={addMaterial} disabled={loading}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Materials List */}
                            <div>
                                <h3 className="font-semibold mb-3">Materials Used</h3>
                                {materials.length > 0 ? (
                                    <div className="space-y-2">
                                        {materials.map((m) => (
                                            <div key={m.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium">{m.material?.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {m.quantity_used} {m.material?.unit} × K{parseFloat(m.material?.cost_per_unit || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-primary">K{parseFloat(m.cost).toFixed(2)}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeMaterial(m)}
                                                        disabled={loading}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertTriangle className="mx-auto mb-2 text-yellow-600" size={32} />
                                        <p className="font-medium text-yellow-900">No materials added yet</p>
                                        <p className="text-sm text-yellow-700 mt-1">Production cannot start without materials</p>
                                    </div>
                                )}
                            </div>

                            {/* Cost Summary */}
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Cost Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Materials:</span>
                                        <span className="font-medium">K{totalMaterialCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-600">Labor (Est.):</span>
                                        {isEditingLabor ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={tempLaborCost}
                                                    onChange={(e) => setTempLaborCost(e.target.value)}
                                                    className="w-24 h-8 text-right"
                                                    min="0"
                                                />
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleUpdateLaborCost}>
                                                    <Save size={14} className="text-green-600" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsEditingLabor(false)}>
                                                    <X size={14} className="text-red-500" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">K{estimatedLaborCost.toFixed(2)}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-primary"
                                                    onClick={() => {
                                                        setTempLaborCost(estimatedLaborCost);
                                                        setIsEditingLabor(true);
                                                    }}
                                                >
                                                    <Edit2 size={12} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                        <span>Total Production Cost:</span>
                                        <span className="text-primary">K{totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="quality" className="mt-4 space-y-4">
                            <div>
                                <Label>Quality Notes</Label>
                                <Textarea
                                    placeholder="Add quality check notes, issues, or observations..."
                                    className="mt-2 min-h-[120px]"
                                    defaultValue={batch.notes || ""}
                                />
                            </div>
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Batch Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Started:</span>
                                        <p className="font-medium">{batch.started_at ? format(new Date(batch.started_at), "MMM d, yyyy") : "Not started"}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Completed:</span>
                                        <p className="font-medium">{batch.completed_at ? format(new Date(batch.completed_at), "MMM d, yyyy") : "In progress"}</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="border-t p-4 flex justify-between items-center bg-gray-50">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {batch.status !== "completed" && (
                        <Button onClick={handleNextStage} className="gap-2">
                            {batch.status === "cutting" && materials.length === 0 ? (
                                <>
                                    <AlertTriangle size={18} />
                                    Add Materials First
                                </>
                            ) : (
                                <>
                                    Next Stage: {getStageLabel(stages[currentStageIndex + 1])} {getStageIcon(stages[currentStageIndex + 1])}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BatchDetailsModal;
