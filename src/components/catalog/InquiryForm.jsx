import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { inquiryService } from "../../services/inquiryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";

export default function InquiryForm({ product, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      preferred_size: "",
      custom_measurements_needed: false,
      special_requests: "",
      contact_method: "whatsapp",
    },
  });

  const customMeasurementsNeeded = watch("custom_measurements_needed");

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      await inquiryService.submitInquiry({
        product_id: product.id,
        ...data,
      });

      setSubmitted(true);
      toast.success("Inquiry submitted successfully!");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Validate Zambian phone number
  const validatePhone = (value) => {
    const phoneRegex = /^(\+260|0)?[79]\d{8}$/;
    return phoneRegex.test(value.replace(/\s/g, "")) || "Please enter a valid Zambian phone number";
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#2C2C2C] mb-2">
            Thank You!
          </h3>
          <p className="text-[#6B6B6B] mb-4">
            We've received your inquiry for <strong>{product.name}</strong>.
          </p>
          <p className="text-sm text-[#6B6B6B] mb-6">
            We'll contact you within 24 hours via your preferred method.
          </p>
          <Button
            onClick={onClose}
            className="bg-[#8B4513] hover:bg-[#A0522D]"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#2C2C2C]">
              Request This Design
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#2C2C2C]">Your Information</h3>
            
            {/* Name */}
            <div>
              <Label htmlFor="customer_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customer_name"
                {...register("customer_name", { required: "Name is required" })}
                placeholder="John Doe"
                className="mt-1"
              />
              {errors.customer_name && (
                <p className="text-sm text-red-500 mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="customer_phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customer_phone"
                {...register("customer_phone", {
                  required: "Phone number is required",
                  validate: validatePhone,
                })}
                placeholder="+260 97 1234567"
                className="mt-1"
              />
              {errors.customer_phone && (
                <p className="text-sm text-red-500 mt-1">{errors.customer_phone.message}</p>
              )}
              <p className="text-xs text-[#6B6B6B] mt-1">
                Format: +260 97 1234567 or 0971234567
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <Label htmlFor="customer_email">Email (Optional)</Label>
              <Input
                id="customer_email"
                type="email"
                {...register("customer_email")}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
          </div>

          {/* Size Preference */}
          <div className="space-y-4 pt-2">
            <h3 className="font-semibold text-[#2C2C2C] border-b pb-2">Size & Measurements</h3>
            
            {/* Size Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_size">Preferred Size</Label>
                <Select
                  onValueChange={(value) => setValue("preferred_size", value)}
                  defaultValue=""
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Small (S)</SelectItem>
                    <SelectItem value="M">Medium (M)</SelectItem>
                    <SelectItem value="L">Large (L)</SelectItem>
                    <SelectItem value="XL">Extra Large (XL)</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                    <SelectItem value="Custom">Custom Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Measurements Checkbox */}
              <div className="flex items-center space-x-2 mt-8 md:mt-0 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Checkbox
                  id="custom_measurements_needed"
                  checked={!!customMeasurementsNeeded}
                  onCheckedChange={(checked) =>
                    setValue("custom_measurements_needed", !!checked, { shouldDirty: true })
                  }
                />
                <Label
                  htmlFor="custom_measurements_needed"
                  className="text-sm font-medium cursor-pointer"
                >
                  I need custom measurements taken
                </Label>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="pt-2">
            <Label htmlFor="special_requests" className="font-semibold text-[#2C2C2C] mb-2 block">
              Special Requests or Notes
            </Label>
            <Textarea
              id="special_requests"
              {...register("special_requests")}
              placeholder="Any specific requirements, color preferences, or questions..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          {/* Contact Method */}
          <div className="bg-[#fdf8f6] p-4 rounded-lg border border-[#eaddd7]">
            <Label htmlFor="contact_method" className="font-semibold text-[#8B4513]">
              Preferred Contact Method <span className="text-red-500">*</span>
            </Label>
             <p className="text-xs text-[#a0522d] mb-2">How should we reach out to you?</p>
            <Select
              onValueChange={(value) => setValue("contact_method", value)}
              defaultValue="whatsapp"
            >
              <SelectTrigger className="mt-1 bg-white border-[#eaddd7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#8B4513] hover:bg-[#A0522D] py-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Inquiry"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-center text-[#6B6B6B]">
            By submitting this form, you agree to be contacted by Gloria's Daughter
            regarding your inquiry.
          </p>
        </form>
      </div>
    </div>
  );
}
