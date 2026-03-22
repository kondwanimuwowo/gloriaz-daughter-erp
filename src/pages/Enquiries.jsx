import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  AlertCircle,
  Phone,
  ShoppingCart,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  ArrowRight,
  Clock,
  Mail,
  User,
  Shirt,
  Ruler,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryService } from "../services/inquiryService";
import { useQueryRecovery } from "../hooks/useQueryRecovery";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import StatsCard from "../components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/PageSkeleton";
import toast from "react-hot-toast";

const statusConfig = {
  new: { label: "New", variant: "default", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" },
  contacted: { label: "Contacted", variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50" },
  converted: { label: "Converted", variant: "outline", className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" },
  dismissed: { label: "Dismissed", variant: "secondary", className: "text-muted-foreground" },
};

export default function Enquiries() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useQueryRecovery();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["inquiries"],
    queryFn: () => inquiryService.getAllInquiries(),
    meta: { erpCritical: true },
  });

  const { data: stats } = useQuery({
    queryKey: ["inquiry-stats"],
    queryFn: () => inquiryService.getInquiryStats(),
  });

  const [viewingInquiry, setViewingInquiry] = useState(null);
  const [notesDialog, setNotesDialog] = useState(null);
  const [staffNotes, setStaffNotes] = useState("");
  const [dismissConfirm, setDismissConfirm] = useState(null);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    queryClient.invalidateQueries({ queryKey: ["inquiry-stats"] });
    queryClient.invalidateQueries({ queryKey: ["new-inquiry-count"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      inquiryService.updateInquiryStatus(id, status, notes),
    onSuccess: () => invalidateQueries(),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => inquiryService.dismissInquiry(id),
    onSuccess: () => invalidateQueries(),
  });

  const handleMarkContacted = async (inquiry) => {
    try {
      await statusMutation.mutateAsync({ id: inquiry.id, status: "contacted" });
      toast.success(`Marked as contacted`);
      if (viewingInquiry?.id === inquiry.id) {
        setViewingInquiry({ ...viewingInquiry, status: "contacted", contacted_at: new Date().toISOString() });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    if (!notesDialog) return;
    try {
      await statusMutation.mutateAsync({
        id: notesDialog.id,
        status: notesDialog.status,
        notes: staffNotes,
      });
      toast.success("Notes saved");
      if (viewingInquiry?.id === notesDialog.id) {
        setViewingInquiry({ ...viewingInquiry, staff_notes: staffNotes });
      }
      setNotesDialog(null);
      setStaffNotes("");
    } catch (error) {
      toast.error("Failed to save notes");
    }
  };

  const handleConvertToOrder = (inquiry) => {
    navigate("/orders", {
      state: {
        openCreateForm: true,
        prefillData: {
          customer_name: inquiry.customer_name,
          customer_phone: inquiry.customer_phone,
          customer_email: inquiry.customer_email,
          product_id: inquiry.product_id,
          special_requests: inquiry.special_requests,
        },
        inquiryId: inquiry.id,
      },
    });
  };

  const handleDismiss = async () => {
    if (!dismissConfirm) return;
    try {
      await dismissMutation.mutateAsync(dismissConfirm.id);
      toast.success("Enquiry dismissed");
      setDismissConfirm(null);
      if (viewingInquiry?.id === dismissConfirm.id) {
        setViewingInquiry(null);
      }
    } catch (error) {
      toast.error("Failed to dismiss enquiry");
    }
  };

  const openNotesDialog = (inquiry) => {
    setStaffNotes(inquiry.staff_notes || "");
    setNotesDialog(inquiry);
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.new;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => {
          const date = row.getValue("created_at");
          return date ? (
            <span className="text-sm text-muted-foreground">
              {format(new Date(date), "MMM d, yyyy")}
            </span>
          ) : "N/A";
        },
      },
      {
        accessorKey: "customer_name",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.getValue("customer_name")}</span>
            <p className="text-xs text-muted-foreground">{row.original.customer_phone}</p>
          </div>
        ),
      },
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original.products;
          return product ? (
            <span className="text-sm">{product.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "preferred_size",
        header: "Size",
        cell: ({ row }) => {
          const size = row.getValue("preferred_size");
          return size ? (
            <span className="text-sm">{size}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "contact_method",
        header: "Contact Via",
        cell: ({ row }) => {
          const method = row.getValue("contact_method");
          return (
            <span className="text-sm capitalize">{method || "WhatsApp"}</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const inquiry = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewingInquiry(inquiry)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                {inquiry.status === "new" && (
                  <DropdownMenuItem onClick={() => handleMarkContacted(inquiry)}>
                    <Phone className="mr-2 h-4 w-4" /> Mark as Contacted
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openNotesDialog(inquiry)}>
                  <FileText className="mr-2 h-4 w-4" /> Add Notes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {inquiry.status !== "converted" && (
                  <DropdownMenuItem onClick={() => handleConvertToOrder(inquiry)}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Convert to Order
                  </DropdownMenuItem>
                )}
                {inquiry.status !== "dismissed" && inquiry.status !== "converted" && (
                  <DropdownMenuItem
                    onClick={() => setDismissConfirm(inquiry)}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Dismiss
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return <PageSkeleton layout="table" statsCount={4} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Enquiries"
        description="Manage customer enquiries from the catalog"
      />

      <div className="flex flex-wrap gap-3">
        <StatsCard
          title="Total Enquiries"
          value={stats?.total || 0}
          icon={MessageSquare}
          color="blue"
        />
        <StatsCard
          title="New"
          value={stats?.new || 0}
          icon={AlertCircle}
          color="red"
        />
        <StatsCard
          title="Contacted"
          value={stats?.contacted || 0}
          icon={Phone}
          color="yellow"
        />
        <StatsCard
          title="Converted"
          value={stats?.converted || 0}
          icon={ShoppingCart}
          color="green"
        />
      </div>

      <Card className="overflow-hidden border-border/60">
        <DataTable
          columns={columns}
          data={inquiries}
          filterColumn="customer_name"
          searchPlaceholder="Search enquiries..."
          onRowClick={(inquiry) => setViewingInquiry(inquiry)}
        />
      </Card>

      {/* View Inquiry Detail Dialog */}
      <Dialog
        open={!!viewingInquiry}
        onOpenChange={(open) => !open && setViewingInquiry(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              Submitted {viewingInquiry && format(new Date(viewingInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>

          {viewingInquiry && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingInquiry.status)}
                {viewingInquiry.contacted_at && (
                  <span className="text-xs text-muted-foreground">
                    Contacted {format(new Date(viewingInquiry.contacted_at), "MMM d, yyyy")}
                  </span>
                )}
              </div>

              {/* Customer Info */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{viewingInquiry.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{viewingInquiry.customer_phone}</span>
                  </div>
                  {viewingInquiry.customer_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{viewingInquiry.customer_email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="capitalize">Prefers: {viewingInquiry.contact_method || "WhatsApp"}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {viewingInquiry.products && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</h4>
                  <div className="flex items-center gap-3">
                    {viewingInquiry.products.image_url && (
                      <img
                        src={viewingInquiry.products.image_url}
                        alt={viewingInquiry.products.name}
                        className="w-12 h-16 object-cover rounded bg-muted"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{viewingInquiry.products.name}</p>
                      {viewingInquiry.products.category && (
                        <p className="text-xs text-muted-foreground">{viewingInquiry.products.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {viewingInquiry.preferred_size && (
                    <div>
                      <span className="text-muted-foreground">Size</span>
                      <p className="font-medium">{viewingInquiry.preferred_size}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Custom Measurements</span>
                    <p className="font-medium">{viewingInquiry.custom_measurements_needed ? "Yes" : "No"}</p>
                  </div>
                </div>
                {viewingInquiry.special_requests && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Special Requests</span>
                    <p className="mt-1 font-medium">{viewingInquiry.special_requests}</p>
                  </div>
                )}
              </div>

              {/* Staff Notes */}
              {viewingInquiry.staff_notes && (
                <div className="rounded-lg border border-border p-4 space-y-2 bg-muted/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Staff Notes</h4>
                  <p className="text-sm">{viewingInquiry.staff_notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {viewingInquiry.status === "new" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkContacted(viewingInquiry)}
                    disabled={statusMutation.isPending}
                  >
                    <Phone className="mr-2 h-4 w-4" /> Mark Contacted
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openNotesDialog(viewingInquiry)}
                >
                  <FileText className="mr-2 h-4 w-4" /> Notes
                </Button>
                {viewingInquiry.status !== "converted" && (
                  <Button
                    size="sm"
                    onClick={() => handleConvertToOrder(viewingInquiry)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Convert to Order
                  </Button>
                )}
                {viewingInquiry.status !== "dismissed" && viewingInquiry.status !== "converted" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDismissConfirm(viewingInquiry)}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Dismiss
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog
        open={!!notesDialog}
        onOpenChange={(open) => {
          if (!open) {
            setNotesDialog(null);
            setStaffNotes("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Notes</DialogTitle>
            <DialogDescription>
              Add internal notes about this enquiry from {notesDialog?.customer_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Enter notes about this enquiry..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={statusMutation.isPending}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dismiss Confirmation Dialog */}
      <Dialog
        open={!!dismissConfirm}
        onOpenChange={(open) => !open && setDismissConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dismiss Enquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to dismiss this enquiry from{" "}
              <strong>{dismissConfirm?.customer_name}</strong>? This can be undone by changing the status later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDismissConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDismiss}
              disabled={dismissMutation.isPending}
            >
              Dismiss Enquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
