import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Mail, Eye, CheckCircle, XCircle, Clock, Package, Trash2 } from "lucide-react";
import { inquiryService } from "../services/inquiryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "../components/dashboard/StatsCard";
import toast from "react-hot-toast";
import { format } from "date-fns";

import { supabase } from "../lib/supabase"; // NEW IMPORT

export default function InquiryDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [viewingInquiry, setViewingInquiry] = useState(null);
  const [staffNotes, setStaffNotes] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();

    const subscription = supabase
      .channel("inquiries")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_inquiries" },
        () => {
          loadData();
          toast("Inquiry list updated", { icon: "🔔" });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allInquiries, inquiryStats] = await Promise.all([
        inquiryService.getAllInquiries(),
        inquiryService.getInquiryStats(),
      ]);
      setInquiries(allInquiries);
      setStats(inquiryStats);
    } catch (error) {
      console.error("Error loading inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await inquiryService.updateInquiryStatus(inquiryId, newStatus);
      toast.success("Status updated successfully");
      loadData();
      if (viewingInquiry?.id === inquiryId) {
        setViewingInquiry(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    if (!viewingInquiry) return;
    
    try {
      await inquiryService.addStaffNotes(viewingInquiry.id, staffNotes);
      toast.success("Notes saved successfully");
      loadData();
      setViewingInquiry(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }
    
    try {
      await inquiryService.deleteInquiry(inquiryId);
      toast.success("Inquiry deleted successfully");
      loadData();
      if (viewingInquiry?.id === inquiryId) {
        setViewingInquiry(null);
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast.error("Failed to delete inquiry");
    }
  };

  const handleConvertToOrder = (inquiry) => {
    // Navigate to orders page with pre-filled data
    navigate("/orders", {
      state: {
        createOrder: true,
        customerName: inquiry.customer_name,
        customerPhone: inquiry.customer_phone,
        customerEmail: inquiry.customer_email,
        productId: inquiry.product_id,
        specialRequests: inquiry.special_requests,
      },
    });
  };

  const getWhatsAppUrl = (inquiry) => {
    const message = `Hi ${inquiry.customer_name}! Thank you for your interest in our ${inquiry.products?.name}. How can we assist you?`;
    return `https://wa.me/${inquiry.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { text: "New", className: "bg-blue-100 text-blue-800" },
      contacted: { text: "Contacted", className: "bg-yellow-100 text-yellow-800" },
      converted: { text: "Converted", className: "bg-green-100 text-green-800" },
      declined: { text: "Declined", className: "bg-gray-100 text-gray-800" },
    };
    const badge = badges[status] || badges.new;
    return <Badge className={badge.className}>{badge.text}</Badge>;
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (activeTab === "all") return true;
    return inquiry.status === activeTab;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Inquiries</h1>
        </div>
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Inquiries</h1>
          <p className="text-muted-foreground">Manage product inquiries from the catalog</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Inquiries"
            value={stats.total}
            subtitle="All time"
            icon={Package}
            color="blue"
          />
          <StatsCard
            title="New"
            value={stats.new}
            subtitle="Awaiting response"
            icon={Clock}
            color="purple"
          />
          <StatsCard
            title="Contacted"
            value={stats.contacted}
            subtitle="In progress"
            icon={MessageCircle}
            color="yellow"
          />
          <StatsCard
            title="Converted"
            value={stats.converted}
            subtitle="Became orders"
            icon={CheckCircle}
            color="green"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
          <TabsTrigger value="new">New ({stats?.new || 0})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({stats?.contacted || 0})</TabsTrigger>
          <TabsTrigger value="converted">Converted ({stats?.converted || 0})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({stats?.declined || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No inquiries found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Product & Customer Info */}
                      <div className="flex gap-4 flex-1">
                        {/* Product Image */}
                        {inquiry.products?.image_url && (
                          <img
                            src={inquiry.products.image_url}
                            alt={inquiry.products.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{inquiry.customer_name}</h3>
                            {getStatusBadge(inquiry.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            Interested in: <strong>{inquiry.products?.name}</strong>
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {inquiry.customer_phone}
                            </span>
                            {inquiry.customer_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {inquiry.customer_email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                            </span>
                          </div>

                          {inquiry.preferred_size && (
                            <p className="text-sm mt-2">
                              <strong>Size:</strong> {inquiry.preferred_size}
                              {inquiry.custom_measurements_needed && " (Custom measurements needed)"}
                            </p>
                          )}

                          {inquiry.special_requests && (
                            <p className="text-sm mt-2 text-muted-foreground italic">
                              "{inquiry.special_requests}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setViewingInquiry(inquiry);
                            setStaffNotes(inquiry.staff_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>

                        <a
                          href={getWhatsAppUrl(inquiry)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="w-full bg-[#25D366] hover:bg-[#20BA5A]">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Button>
                        </a>

                        <a href={`tel:${inquiry.customer_phone}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </a>

                        {inquiry.status === "new" || inquiry.status === "contacted" ? (
                          <Button
                            size="sm"
                            onClick={() => handleConvertToOrder(inquiry)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Convert
                          </Button>
                        ) : null}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View/Edit Modal */}
      {viewingInquiry && (
        <Dialog open={!!viewingInquiry} onOpenChange={() => setViewingInquiry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{viewingInquiry.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{viewingInquiry.customer_phone}</p>
                  </div>
                  {viewingInquiry.customer_email && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{viewingInquiry.customer_email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Preferred Contact</p>
                    <p className="font-medium capitalize">{viewingInquiry.contact_method}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-semibold mb-2">Product Requested</h3>
                <p className="font-medium">{viewingInquiry.products?.name}</p>
                <p className="text-sm text-muted-foreground">
                  K{viewingInquiry.products?.base_price.toLocaleString()}
                </p>
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select
                  value={viewingInquiry.status}
                  onValueChange={(value) => handleStatusChange(viewingInquiry.id, value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Staff Notes */}
              <div>
                <Label>Staff Notes</Label>
                <Textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  rows={4}
                  className="mt-1"
                  placeholder="Add notes about this inquiry..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveNotes} className="flex-1">
                  Save Notes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleConvertToOrder(viewingInquiry)}
                  className="flex-1"
                >
                  Convert to Order
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteInquiry(viewingInquiry.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
