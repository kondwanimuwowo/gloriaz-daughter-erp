import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Scissors } from "lucide-react";
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
import { useForm, Controller } from "react-hook-form";

export default function GarmentTypeManager() {
  const {
    garmentTypes,
    fetchGarmentTypes,
    addGarmentType,
    updateGarmentType,
    deleteGarmentType,
    loading,
  } = useFinancialStore();
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    fetchGarmentTypes();
  }, [fetchGarmentTypes]);

  const handleAdd = () => {
    setEditingType(null);
    setShowModal(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this garment type?")) {
      await deleteGarmentType(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Labour Rates</h2>
          <p className="text-muted-foreground mt-1">
            Standard labour costs by garment type
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Type
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Garment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Complexity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Labour Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Est. Hours
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {garmentTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Scissors size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {type.name}
                            </p>
                            {type.description && (
                              <p className="text-xs text-muted-foreground">
                                {type.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            type.complexity === "simple"
                              ? "bg-green-100 text-green-700"
                              : type.complexity === "standard"
                                ? "bg-blue-100 text-blue-700"
                                : type.complexity === "complex"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {type.complexity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        K{parseFloat(type.base_labour_cost).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-foreground">
                        {parseFloat(type.estimated_hours || 0).toFixed(1)}h
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(type)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(type.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Garment Type" : "Add Garment Type"}
            </DialogTitle>
          </DialogHeader>
          <GarmentTypeForm
            garmentType={editingType}
            onSubmit={async (data) => {
              if (editingType) {
                await updateGarmentType(editingType.id, data);
              } else {
                await addGarmentType(data);
              }
              setShowModal(false);
            }}
            onCancel={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GarmentTypeForm({ garmentType, onSubmit, onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: garmentType || {
      name: "",
      description: "",
      base_labour_cost: 0,
      estimated_hours: 0,
      complexity: "standard",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., Evening Dress"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <span className="text-sm text-red-500">{errors.name.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Brief description..."
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base_labour_cost">Labour Cost (K)</Label>
          <Input
            id="base_labour_cost"
            type="number"
            step="0.01"
            {...register("base_labour_cost", { required: true, min: 0 })}
          />
          {errors.base_labour_cost && (
            <span className="text-sm text-red-500">Required</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_hours">Est. Hours</Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.1"
            {...register("estimated_hours", { min: 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Complexity</Label>
        <Controller
          name="complexity"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {garmentType ? "Update" : "Add"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

