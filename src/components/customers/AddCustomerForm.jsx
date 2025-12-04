import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Button from "../common/Button";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            placeholder="e.g., Martha Mumba"
            icon={User}
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
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

        {/* Email */}
        <div>
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="customer@email.com"
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

        {/* Address */}
        <div className="md:col-span-2">
          <Input
            label="Address (Optional)"
            placeholder="Street address, city, area"
            icon={MapPin}
            {...register("address")}
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Any additional information about the customer..."
            {...register("notes")}
          />
        </div>
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
          {customer ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}
