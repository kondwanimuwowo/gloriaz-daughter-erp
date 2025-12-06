import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Calendar, DollarSign, FileText, Scissors } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";
import MaterialSelector from "./MaterialSelector";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export default function CreateOrderForm({ order, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: order || {
      customer_id: "",
      due_date: "",
      total_cost: 0,
      deposit: 0,
      description: "",
      notes: "",
      assigned_tailor_id: "",
    },
  });

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (order) {
      reset(order);
    }
  }, [order, reset]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, email")
      .order("name");

    if (!error) {
      setCustomers(data || []);
    }
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, role")
      .eq("active", true)
      .eq("role", "tailor")
      .order("name");

    if (!error) {
      setEmployees(data || []);
    }
  };

  // Watch for material cost changes
  useEffect(() => {
    const materialCost = selectedMaterials.reduce(
      (sum, m) => sum + parseFloat(m.cost || 0),
      0
    );
    const currentTotal = parseFloat(watch("total_cost") || 0);

    // Only auto-update if it's a new order
    if (!order && materialCost > 0) {
      setValue("total_cost", materialCost.toFixed(2));
    }
  }, [selectedMaterials, order, watch, setValue]);

  // Calculate balance
  const totalCost = watch("total_cost") || 0;
  const deposit = watch("deposit") || 0;
  const balance = parseFloat(totalCost) - parseFloat(deposit);

  const handleFormSubmit = async (data) => {
    if (selectedMaterials.length === 0) {
      toast.error("Please add at least one material");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...data,
        materials: selectedMaterials,
      };
      await onSubmit(orderData);
      if (!order) {
        reset();
        setSelectedMaterials([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              className="input-field pl-10"
              {...register("customer_id", { required: "Customer is required" })}
            >
              <option value="">Select customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowNewCustomer(true)}
          >
            New
          </Button>
        </div>
        {errors.customer_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.customer_id.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Due Date */}
        <div>
          <Input
            label="Due Date"
            type="date"
            icon={Calendar}
            error={errors.due_date?.message}
            {...register("due_date", { required: "Due date is required" })}
          />
        </div>

        {/* Assigned Tailor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Tailor (Optional)
          </label>
          <div className="relative">
            <Scissors
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              className="input-field pl-10"
              {...register("assigned_tailor_id")}
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline mr-2" size={16} />
          Order Description
        </label>
        <textarea
          rows={4}
          className="input-field resize-none"
          placeholder="Describe the garment(s) to be made, style, color, special requirements, etc."
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Materials Section */}
      <MaterialSelector
        selectedMaterials={selectedMaterials}
        onChange={setSelectedMaterials}
      />

      {/* Pricing */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Cost */}
          <div>
            <Input
              label="Total Cost (K)"
              type="number"
              step="0.01"
              placeholder="0.00"
              icon={DollarSign}
              error={errors.total_cost?.message}
              {...register("total_cost", {
                required: "Total cost is required",
                min: { value: 0, message: "Must be 0 or greater" },
              })}
            />
          </div>

          {/* Deposit */}
          <div>
            <Input
              label="Deposit (K)"
              type="number"
              step="0.01"
              placeholder="0.00"
              icon={DollarSign}
              error={errors.deposit?.message}
              {...register("deposit", {
                min: { value: 0, message: "Must be 0 or greater" },
              })}
            />
          </div>

          {/* Balance (Calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Balance (K)
            </label>
            <div
              className={`input-field bg-gray-50 font-bold ${
                balance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {balance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          rows={3}
          className="input-field resize-none"
          placeholder="Any additional information, special instructions, or reminders..."
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {order ? "Update Order" : "Create Order"}
        </Button>
      </div>

      {/* Warning about material deduction */}
      {!order && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Materials will be automatically deducted from
            inventory when the order status is changed to "Production".
          </p>
        </div>
      )}
    </form>
  );
}
