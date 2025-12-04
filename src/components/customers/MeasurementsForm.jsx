import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Button from "../common/Button";
import { Ruler } from "lucide-react";

const MEASUREMENT_FIELDS = [
  { name: "bust", label: "Bust", unit: "inches" },
  { name: "waist", label: "Waist", unit: "inches" },
  { name: "hips", label: "Hips", unit: "inches" },
  { name: "shoulder_width", label: "Shoulder Width", unit: "inches" },
  { name: "sleeve_length", label: "Sleeve Length", unit: "inches" },
  { name: "arm_circumference", label: "Arm Circumference", unit: "inches" },
  { name: "dress_length", label: "Dress Length", unit: "inches" },
  { name: "skirt_length", label: "Skirt Length", unit: "inches" },
  { name: "inseam", label: "Inseam", unit: "inches" },
  { name: "outseam", label: "Outseam", unit: "inches" },
  { name: "thigh_circumference", label: "Thigh Circumference", unit: "inches" },
  { name: "neck_circumference", label: "Neck Circumference", unit: "inches" },
];

export default function MeasurementsForm({ customer, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: customer?.measurements || {},
  });

  useEffect(() => {
    if (customer?.measurements) {
      reset(customer.measurements);
    }
  }, [customer, reset]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      // Remove empty values
      const measurements = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== "" && value !== null
        )
      );
      await onSubmit(measurements);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Ruler className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Measurement Guidelines
            </h3>
            <p className="text-sm text-blue-800">
              All measurements are in inches. Take measurements over
              undergarments for accuracy. Leave fields blank if not applicable.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MEASUREMENT_FIELDS.map((field) => (
          <div key={field.name}>
            <Input
              label={`${field.label} (${field.unit})`}
              type="number"
              step="0.1"
              placeholder="0.0"
              {...register(field.name, {
                min: { value: 0, message: "Must be positive" },
              })}
              error={errors[field.name]?.message}
            />
          </div>
        ))}
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          rows={3}
          className="input-field resize-none"
          placeholder="Any special notes about measurements, body shape, preferences, etc."
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
          Save Measurements
        </Button>
      </div>
    </form>
  );
}
