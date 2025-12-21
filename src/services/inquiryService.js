import { supabase } from "../lib/supabase";

export const inquiryService = {
  // Submit a new customer inquiry (public)
  async submitInquiry(inquiryData) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .insert([
        {
          product_id: inquiryData.product_id,
          customer_name: inquiryData.customer_name,
          customer_phone: inquiryData.customer_phone,
          customer_email: inquiryData.customer_email || null,
          preferred_size: inquiryData.preferred_size,
          custom_measurements_needed: inquiryData.custom_measurements_needed || false,
          special_requests: inquiryData.special_requests || null,
          contact_method: inquiryData.contact_method || 'whatsapp',
          status: 'new'
        },
      ]);

    if (error) throw error;
    return { success: true };
  },

  // Get all inquiries (ERP - authenticated)
  async getAllInquiries(filters = {}) {
    let query = supabase
      .from("customer_inquiries")
      .select(`
        *,
        products (
          id,
          name,
          image_url,
          base_price,
          category
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get inquiry by ID
  async getInquiryById(id) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .select(`
        *,
        products (
          id,
          name,
          image_url,
          base_price,
          category,
          description
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update inquiry status
  async updateInquiryStatus(id, status, notes = null) {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updates.staff_notes = notes;
    }

    if (status === 'contacted') {
      updates.contacted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("customer_inquiries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Add staff notes to inquiry
  async addStaffNotes(id, notes) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .update({
        staff_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark inquiry as converted to order
  async markAsConverted(inquiryId, orderId) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .update({
        status: 'converted',
        converted_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete inquiry
  async deleteInquiry(id) {
    const { error } = await supabase
      .from("customer_inquiries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get inquiry statistics
  async getInquiryStats() {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data.length,
      new: data.filter(i => i.status === 'new').length,
      contacted: data.filter(i => i.status === 'contacted').length,
      converted: data.filter(i => i.status === 'converted').length,
      declined: data.filter(i => i.status === 'declined').length,
    };

    return stats;
  },
};
