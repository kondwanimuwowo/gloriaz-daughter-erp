import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Button from "../common/Button";
import { User, Mail, Phone, DollarSign, Briefcase } from "lucide-react";

const ROLES = ["tailor", "cutter", "designer", "manager", "assistant", "other"];

export default function AddEmployeeForm({ employee, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: employee || {
      name: "",
      role: "tailor",
      email: "",
      phone: "",
      hire_date: new Date().toISOString().split("T")[0],
      hourly_rate: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (employee) {
      reset(employee);
    }
  }, [employee, reset]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
      if (!employee) {
        reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            placeholder="e.g., Jane Phiri"
            icon={User}
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="relative">
            <Briefcase
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              className="input-field pl-10"
              {...register("role", { required: "Role is required" })}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Hire Date */}
        <div>
          <Input
            label="Hire Date"
            type="date"
            error={errors.hire_date?.message}
            {...register("hire_date", { required: "Hire date is required" })}
          />
        </div>

        {/* Email */}
        <div>
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="jane@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register("email", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
        </div>

        {/* Phone */}
        <div>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+260 XXX XXX XXX"
            icon={Phone}
            error={errors.phone?.message}
            {...register("phone", { required: "Phone number is required" })}
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <Input
            label="Hourly Rate (K) - Optional"
            type="number"
            step="0.01"
            placeholder="0.00"
            icon={DollarSign}
            error={errors.hourly_rate?.message}
            {...register("hourly_rate", {
              min: { value: 0, message: "Must be 0 or greater" },
            })}
          />
        </div>

        {/* Active Status */}
        {employee && (
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                {...register("active")}
              />
              <span className="text-sm font-medium text-gray-700">
                Employee is active
              </span>
            </label>
          </div>
        )}
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
          {employee ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}
