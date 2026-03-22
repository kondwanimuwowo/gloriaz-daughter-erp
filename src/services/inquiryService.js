import { supabase } from "../lib/supabase";

export const inquiryService = {
  async getAllInquiries() {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .select("*, products(id, name, image_url, category)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInquiryById(id) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .select("*, products(id, name, image_url, category)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateInquiryStatus(id, status, staffNotes = null) {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (staffNotes !== null) {
      updates.staff_notes = staffNotes;
    }

    if (status === "contacted") {
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

  async convertToOrder(id, orderId) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .update({
        status: "converted",
        converted_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async dismissInquiry(id) {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .update({
        status: "dismissed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNewInquiriesCount() {
    const { count, error } = await supabase
      .from("customer_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    if (error) throw error;
    return count || 0;
  },

  async getInquiryStats() {
    const { data, error } = await supabase
      .from("customer_inquiries")
      .select("status");

    if (error) throw error;

    const stats = { total: 0, new: 0, contacted: 0, converted: 0, dismissed: 0 };
    for (const item of data || []) {
      stats.total++;
      if (stats[item.status] !== undefined) {
        stats[item.status]++;
      }
    }
    return stats;
  },
};
