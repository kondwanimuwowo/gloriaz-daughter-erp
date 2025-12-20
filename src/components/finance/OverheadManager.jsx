import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building2, DollarSign } from "lucide-react";
import { useFinancialStore } from "../../store/useFinancialStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";

export default function OverheadManager({ selectedMonth, onDataChange }) {
  const {
    overheadCosts,
    fetchOverheadCosts,
    addOverheadCost,
    updateOverheadCost,
    deleteOverheadCost,
    loading,
  } = useFinancialStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCost, setEditingCost] = useState(null);

  useEffect(() => {
    fetchOverheadCosts(selectedMonth);
  }, [selectedMonth, fetchOverheadCosts]);

  const totalOverhead = overheadCosts.reduce(
    (sum, cost) => sum + parseFloat(cost.amount || 0),
    0
  );

  const handleAdd = () => {
    setEditingCost(null);
    setShowModal(true);
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this overhead cost?")) {
      await deleteOverheadCost(id);
      if (onDataChange) onDataChange();
    }
  };

  const handleSubmitForm = async (data) => {
    if (editingCost) {
      await updateOverheadCost(editingCost.id, data);
    } else {
      await addOverheadCost(data);
    }
    setShowModal(false);
    if (onDataChange) onDataChange();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Overhead</h2>
          <p className="text-muted-foreground mt-1">
            Fixed monthly business costs for{" "}
            {format(selectedMonth, "MMMM yyyy")}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cost
        </Button>
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-purple-50 border-2 border-primary/20">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Monthly Overhead</p>
            <p className="text-4xl font-bold text-primary">
              K{totalOverhead.toFixed(2)}
            </p>
          </div>
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-lg text-primary">
            <Building2 size={40} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : overheadCosts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground mb-6">No overhead costs for this month</p>
            <Button onClick={handleAdd}>Add Your First Cost</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                      Recurring
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {overheadCosts.map((cost) => (
                    <tr key={cost.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {cost.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {cost.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        K{parseFloat(cost.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cost.is_recurring ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cost)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cost.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 border-t border-border">
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-sm font-bold text-foreground"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      K{totalOverhead.toFixed(2)}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCost ? "Edit Overhead Cost" : "Add Overhead Cost"}
            </DialogTitle>
          </DialogHeader>
          <OverheadCostForm
            cost={editingCost}
            selectedMonth={selectedMonth}
            onSubmit={handleSubmitForm}
            onCancel={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverheadCostForm({ cost, selectedMonth, onSubmit, onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: cost || {
      month: format(selectedMonth, "yyyy-MM-dd"),
      category: "Other",
      description: "",
      amount: 0,
      is_recurring: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="month">Month</Label>
        <Input
          id="month"
          type="date"
          {...register("month", { required: "Month is required" })}
        />
        {errors.month && (
          <span className="text-sm text-red-500">{errors.month.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Controller
          name="category"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {["Rent", "Utilities", "Salaries", "Transport", "Marketing", "Supplies", "Maintenance", "Insurance", "Other"].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Brief description..."
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (K)</Label>
        <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            id="amount"
            type="number"
            step="0.01"
            className="pl-9"
            {...register("amount", { required: "Amount is required", min: 0 })}
            />
        </div>
        {errors.amount && (
            <span className="text-sm text-red-500">{errors.amount.message}</span>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Controller
            name="is_recurring"
            control={control}
            render={({ field }) => (
            <Checkbox
                id="is_recurring"
                checked={field.value}
                onCheckedChange={field.onChange}
            />
            )}
        />
        <Label htmlFor="is_recurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Recurring monthly expense
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {cost ? "Update" : "Add"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

