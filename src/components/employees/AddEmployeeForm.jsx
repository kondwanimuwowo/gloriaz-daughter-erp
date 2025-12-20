import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, DollarSign, Briefcase } from "lucide-react";

import { getZambianDate } from "../../utils/dateUtils";

const ROLES = ["tailor", "cutter", "designer", "manager", "assistant", "other"];

export default function AddEmployeeForm({ employee, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: employee || {
      name: "",
      role: "tailor",
      email: "",
      phone: "",
      hire_date: getZambianDate(),
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
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    id="name"
                    placeholder="e.g., Jane Phiri"
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                    {...register("name", { required: "Name is required" })}
                />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <div className="relative">
             <Controller
                control={control}
                name="role"
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="pl-10">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Hire Date */}
        <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input
                id="hire_date"
                type="date"
                className={errors.hire_date ? "border-red-500" : ""}
                {...register("hire_date", { required: "Hire date is required" })}
            />
            {errors.hire_date && <p className="text-xs text-red-500">{errors.hire_date.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    {...register("email", {
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                    },
                    })}
                />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+260 XXX XXX XXX"
                    className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    {...register("phone", { required: "Phone number is required" })}
                />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Hourly Rate */}
        <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (K) - Optional</Label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`pl-10 ${errors.hourly_rate ? "border-red-500" : ""}`}
                    {...register("hourly_rate", {
                    min: { value: 0, message: "Must be 0 or greater" },
                    })}
                />
            </div>
            {errors.hourly_rate && <p className="text-xs text-red-500">{errors.hourly_rate.message}</p>}
        </div>

        {/* Active Status */}
        {employee && (
          <div className="md:col-span-2">
             <Controller
                control={control}
                name="active"
                render={({ field }) => (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="active"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="active" className="font-medium cursor-pointer">
                            Employee is active
                        </Label>
                    </div>
                )}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
            {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {employee ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}

