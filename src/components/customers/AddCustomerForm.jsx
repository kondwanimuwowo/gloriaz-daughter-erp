import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MapPin } from "lucide-react";

export default function AddCustomerForm({ customer, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: customer || {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (customer) {
      reset(customer);
    }
  }, [customer, reset]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
      if (!customer) {
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
                    placeholder="e.g., Martha Mumba"
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                    {...register("name", { required: "Name is required" })}
                />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
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

        {/* Email */}
        <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    id="email"
                    type="email"
                    placeholder="customer@email.com"
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

        {/* Address */}
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    id="address"
                    placeholder="Street address, city, area"
                    className="pl-10"
                    {...register("address")}
                />
            </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            className="resize-none"
            placeholder="Any additional information about the customer..."
            {...register("notes")}
          />
        </div>
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
          {customer ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}

