"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { submitInquiry } from "@/services/catalogService";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface FittingBookingFormProps {
  onSuccess?: () => void;
}

export function FittingBookingForm({ onSuccess }: FittingBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      product_id: null,
      customer_name: formData.get("customer_name"),
      customer_phone: formData.get("customer_phone"),
      customer_email: formData.get("customer_email"),
      preferred_date: formData.get("preferred_date"),
      preferred_time: formData.get("preferred_time"),
      fitting_type: formData.get("fitting_type"),
      special_requests: formData.get("special_requests"),
      contact_method: formData.get("contact_method"),
    };

    try {
      await submitInquiry(data);
      setStatus("success");
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-10 text-center space-y-4"
      >
        <div className="h-14 w-14 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="text-xl font-serif font-medium">Booking Confirmed</h3>
        <p className="text-sm text-muted-foreground font-light max-w-sm">
          Thank you for booking a fitting appointment. Our team will contact you shortly to confirm your appointment.
        </p>
      </motion.div>
    );
  }

  const selectClass = "flex h-11 w-full border-b border-border bg-transparent px-0 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:border-foreground appearance-none";
  const inputClass = "flex h-11 w-full border-b border-border bg-transparent px-0 py-2 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-foreground";

  // Get minimum date (today or tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === "error" && (
        <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to book appointment. Please try again.</span>
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="customer_name" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Full Name *</label>
        <Input id="customer_name" name="customer_name" required placeholder="Jane Doe" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label htmlFor="customer_email" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Email *</label>
          <Input id="customer_email" name="customer_email" type="email" required placeholder="jane@example.com" />
        </div>
        <div className="space-y-1">
          <label htmlFor="customer_phone" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Phone *</label>
          <Input id="customer_phone" name="customer_phone" type="tel" required placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label htmlFor="preferred_date" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Preferred Date *</label>
          <input
            id="preferred_date"
            name="preferred_date"
            type="date"
            required
            min={minDate}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="preferred_time" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Preferred Time *</label>
          <input
            id="preferred_time"
            name="preferred_time"
            type="time"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="fitting_type" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Fitting Type *</label>
        <select id="fitting_type" name="fitting_type" required className={selectClass}>
          <option value="">Select fitting type...</option>
          <option value="initial_consultation">Initial Consultation</option>
          <option value="custom_measurements">Custom Measurements</option>
          <option value="design_discussion">Design Discussion</option>
          <option value="fabric_selection">Fabric Selection</option>
          <option value="fitting_adjustment">Fitting Adjustment</option>
          <option value="final_fitting">Final Fitting</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="contact_method" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Preferred Contact Method</label>
        <select id="contact_method" name="contact_method" defaultValue="whatsapp" className={selectClass}>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone Call</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="special_requests" className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Special Requests or Notes</label>
        <textarea
          id="special_requests"
          name="special_requests"
          rows={3}
          className="flex w-full border-b border-border bg-transparent px-0 py-2 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-foreground resize-none"
          placeholder="Any specific preferences or details about your custom piece?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-sm font-medium uppercase tracking-[0.15em] bg-foreground text-background px-8 py-4 hover:bg-foreground/85 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none mt-2"
      >
        {isSubmitting ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
}
