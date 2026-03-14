"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitInquiry } from "@/services/catalogService";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface InquiryFormProps {
  productId: string;
  productName: string;
  onSuccess?: () => void;
}

export function InquiryForm({ productId, productName, onSuccess }: InquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      product_id: productId,
      customer_name: formData.get("customer_name"),
      customer_phone: formData.get("customer_phone"),
      customer_email: formData.get("customer_email"),
      preferred_size: formData.get("preferred_size"),
      custom_measurements_needed: formData.get("custom_measurements_needed") === "on",
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 text-center space-y-4"
      >
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Inquiry Sent!</h3>
        <p className="text-muted-foreground">
          Thank you for your interest in the {productName}. Our team will contact you shortly via your preferred method.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to submit inquiry. Please try again.</span>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="customer_name" className="text-sm font-medium">Full Name *</label>
        <Input id="customer_name" name="customer_name" required placeholder="Jane Doe" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="customer_email" className="text-sm font-medium">Email *</label>
          <Input id="customer_email" name="customer_email" type="email" required placeholder="jane@example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="customer_phone" className="text-sm font-medium">Phone Number *</label>
          <Input id="customer_phone" name="customer_phone" type="tel" required placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="preferred_size" className="text-sm font-medium">Preferred Size</label>
          <select 
            id="preferred_size" 
            name="preferred_size" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select a size...</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="Custom">Custom Measurements</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="contact_method" className="text-sm font-medium">Preferred Contact Method</label>
          <select 
            id="contact_method" 
            name="contact_method" 
            defaultValue="whatsapp"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone Call</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input 
          type="checkbox" 
          id="custom_measurements_needed" 
          name="custom_measurements_needed" 
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="custom_measurements_needed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I need to come in for custom measurements
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="special_requests" className="text-sm font-medium">Special Requests / Notes</label>
        <textarea 
          id="special_requests" 
          name="special_requests" 
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Any specific color preferences, fabric requests, or timeline constraints?"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Submit Inquiry"}
      </Button>
    </form>
  );
}
