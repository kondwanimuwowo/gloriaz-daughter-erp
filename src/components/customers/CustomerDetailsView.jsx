import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Ruler,
  Edit,
  Plus,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MeasurementsForm from "./MeasurementsForm";
import OrderStatusBadge from "../orders/OrderStatusBadge";

export default function CustomerDetailsView({
  customer,
  onEdit,
  onUpdateMeasurements,
  stats,
}) {
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const navigate = useNavigate();

  const handleOrderClick = (orderId) => {
    navigate("/orders", { state: { openOrderId: orderId } });
  };

  const handleSaveMeasurements = async (measurements) => {
    await onUpdateMeasurements(customer.id, measurements);
    setShowMeasurementsModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-4xl shadow-sm">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h2 className="text-4xl font-black text-foreground tracking-tight mb-2">
              {customer.name}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1 rounded-full w-fit">
              <Calendar size={14} className="text-primary/60" />
              <span className="text-sm font-medium">Joined {format(new Date(customer.created_at), "MMMM yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/10 hover:text-primary rounded-xl"
            onClick={() => onEdit(customer)}
            >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <User size={18} className="text-primary" />
                    CONTACT DETAILS
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Phone size={18} className="text-primary" />
                        </div>
                        <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Mobile</p>
                        <p className="font-bold text-foreground">
                            {customer.phone}
                        </p>
                        </div>
                    </div>
                    {customer.email && (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                <Mail size={18} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Email</p>
                                <p className="font-bold text-foreground">
                                {customer.email}
                                </p>
                            </div>
                        </div>
                    )}
                    {customer.address && (
                        <div className="md:col-span-2 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                                <MapPin size={18} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Address</p>
                                <p className="font-semibold text-foreground">
                                {customer.address}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {customer.notes && (
                    <div className="mt-6 pt-6 border-t border-border/40">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Internal Notes</p>
                        <div className="bg-muted/20 p-4 rounded-xl text-muted-foreground text-sm font-medium leading-relaxed">
                            {customer.notes}
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4 flex flex-row items-center justify-between space-y-0">
                 <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <Ruler size={18} className="text-primary" />
                    MEASUREMENTS
                 </CardTitle>
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMeasurementsModal(true)}
                    className="h-8 border-primary/40 text-primary hover:bg-primary/10 text-xs font-bold rounded-lg"
                  >
                    {customer.measurements ? <Edit className="mr-2 h-3 w-3" /> : <Plus className="mr-2 h-3 w-3" />}
                    {customer.measurements ? "Refine" : "Add Stats"}
                  </Button>
            </CardHeader>
            <CardContent className="pt-6">
                {customer.measurements ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(customer.measurements)
                    .filter(([key]) => key !== "notes")
                    .map(([key, value]) => (
                        <div key={key} className="p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/10 transition-colors">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1 truncate">
                                {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-lg font-black text-foreground">{value}<span className="text-[10px] ml-0.5 text-muted-foreground uppercase">in</span></p>
                        </div>
                    ))}
                    {customer.measurements.notes && (
                    <div className="col-span-2 md:col-span-4 mt-2 bg-primary/[0.03] border border-primary/10 rounded-xl p-4">
                        <p className="text-[10px] uppercase font-bold text-primary/70 tracking-widest mb-1.5">BODY NOTES</p>
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                        {customer.measurements.notes}
                        </p>
                    </div>
                    )}
                </div>
                ) : (
                <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/60">
                    <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ruler className="text-muted-foreground/60" size={32} />
                    </div>
                    <p className="text-foreground font-bold">No stats recorded</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">
                        Track body metrics for perfect garment fitting.
                    </p>
                </div>
                )}
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <ShoppingCart size={18} className="text-primary" />
                    RECENT ORDERS
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                    {customer.orders.map((order, index) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleOrderClick(order.id)}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-card rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
                            #{order.order_number}
                            </span>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm font-bold text-foreground line-clamp-1 mb-1">
                            {order.description}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-primary/60" />
                                {format(new Date(order.order_date), "MMM dd, yyyy")}
                            </span>
                            {order.due_date && (
                                <span className="text-orange-600/80">
                                    DUE: {format(new Date(order.due_date), "MMM dd")}
                                </span>
                            )}
                        </div>
                        </div>
                        <div className="text-right mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                            <p className="text-xl font-black text-foreground">
                                K{parseFloat(order.total_cost).toLocaleString()}
                            </p>
                            {order.balance > 0 && (
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">
                                    PENDING K{parseFloat(order.balance).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </motion.div>
                    ))}
                </div>
                ) : (
                <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/60">
                    <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="text-muted-foreground/60" size={32} />
                    </div>
                    <p className="text-foreground font-bold">No orders found</p>
                    <p className="text-sm text-muted-foreground mt-1">Ready to create their first order?</p>
                </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-8">
          {/* Customer Stats - Ultra Minimal */}
          {stats && (
            <>
              <div className="grid grid-cols-1 gap-6">
                <Card className="rounded-2xl border-l-4 border-l-primary border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow cursor-default overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Revenue Generated</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-muted-foreground text-xl font-bold">K</span>
                            <span className="text-4xl font-black text-foreground tracking-tight">{stats.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Lifetime Sales</span>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign size={14} className="text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-l-4 border-l-blue-500 border-border/60 shadow-sm bg-card hover:shadow-md transition-shadow cursor-default overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Order Frequency</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-foreground tracking-tight">{stats.totalOrders}</span>
                            <span className="text-muted-foreground text-sm font-bold uppercase ml-1">Orders</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Conversion Rate</span>
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <ShoppingCart size={14} className="text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">LOYALTY STATS</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground">Active Projects</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">currently in production</p>
                        </div>
                        <span className="text-2xl font-black text-primary">
                            {stats.activeOrders}
                        </span>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-border/40">
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground">Completed Assets</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">delivered successfully</p>
                        </div>
                        <span className="text-2xl font-black text-green-500">
                            {stats.completedOrders}
                        </span>
                    </div>
                    {stats.lastOrderDate && (
                        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/40">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Last Interaction</p>
                        <p className="text-sm font-black text-foreground">
                            {format(new Date(stats.lastOrderDate), "MMMM dd, yyyy")}
                        </p>
                        </div>
                    )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Measurements Modal (Dialog) */}
      <Dialog open={showMeasurementsModal} onOpenChange={setShowMeasurementsModal}>
        <DialogContent className="sm:max-w-[700px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
                {customer.measurements ? "Update Measurements" : "Add Measurements"}
            </DialogTitle>
          </DialogHeader>
          <MeasurementsForm
            customer={customer}
            onSubmit={handleSaveMeasurements}
            onCancel={() => setShowMeasurementsModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

