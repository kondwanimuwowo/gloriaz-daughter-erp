import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  User,
  TrendingUp,
  ShoppingCart,
  MoreHorizontal,
  Ruler,
} from "lucide-react";
import { format } from "date-fns";
import { useCustomerStore } from "../store/useCustomerStore";
import { customerService } from "../services/customerService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import StatsCard from "../components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AddCustomerForm from "../components/customers/AddCustomerForm";
import CustomerDetailsView from "../components/customers/CustomerDetailsView";
import toast from "react-hot-toast";

export default function Customers() {
  const {
    customers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateMeasurements,
  } = useCustomerStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle deep linking for specific customer
  useEffect(() => {
    if (location.state?.openCustomerId && customers.length > 0) {
      const customerToView = customers.find(c => c.id === location.state.openCustomerId);
      if (customerToView) {
        handleViewCustomer(customerToView);
        // Clear state to avoid opening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, customers]);

  // Calculate overall stats
  const totalCustomers = customers.length;
  const customersWithMeasurements = customers.filter(
    (c) => c.measurements
  ).length;

  const handleAddCustomer = async (data) => {
    await addCustomer(data);
    setShowAddModal(false);
    toast.success("Customer added successfully");
  };

  const handleUpdateCustomer = async (data) => {
    await updateCustomer(editingCustomer.id, data);
    setEditingCustomer(null);
    toast.success("Customer updated successfully");
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id);
      toast.success("Customer deleted");
    }
  };

  const handleViewCustomer = async (customer) => {
    setLoadingDetails(true);
    try {
      // Fetch full customer data with orders
      const fullCustomer = await customerService.getCustomerWithOrders(
        customer.id
      );
      const stats = await customerService.getCustomerStats(customer.id);

      setViewingCustomer(fullCustomer);
      setCustomerStats(stats);
    } catch (error) {
      toast.error("Failed to load customer details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setViewingCustomer(null);
  };

  const handleUpdateMeasurements = async (customerId, measurements) => {
    await updateMeasurements(customerId, measurements);
    // Refresh customer details
    const fullCustomer =
      await customerService.getCustomerWithOrders(customerId);
    setViewingCustomer(fullCustomer);
    toast.success("Measurements updated");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        id: "measurements",
        header: "Measurements",
        cell: ({ row }) => {
          const hasMeasurements = !!row.original.measurements;
          return hasMeasurements ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
              <Ruler className="w-3 h-3 mr-1" /> Yes
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        }
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => {
          const date = row.getValue("created_at");
          return date ? format(new Date(date), "MMM d, yyyy") : "N/A";
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const customer = row.original;
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
                <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and their information
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Customers"
          value={totalCustomers}
          icon={User}
          color="blue"
        />
        <StatsCard
          title="With Measurements"
          value={customersWithMeasurements}
          icon={Ruler}
          color="green"
        />
        <StatsCard
          title="New This Month"
          value={customers.filter((c) => {
            const created = new Date(c.created_at);
            const now = new Date();
            return (
              created.getMonth() === now.getMonth() &&
              created.getFullYear() === now.getFullYear()
            );
          }).length}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <Card className="p-6">
        <DataTable
          columns={columns}
          data={customers}
          filterColumn="name"
          searchPlaceholder="Filter customers..."
          onRowClick={(row) => handleViewCustomer(row.original)}
        />
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <AddCustomerForm
            onSubmit={handleAddCustomer}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <AddCustomerForm
            customer={editingCustomer}
            onSubmit={handleUpdateCustomer}
            onCancel={() => setEditingCustomer(null)}
          />
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={(open) => !open && setViewingCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : viewingCustomer ? (
            <CustomerDetailsView
              customer={viewingCustomer}
              stats={customerStats}
              onEdit={handleEditCustomer}
              onUpdateMeasurements={handleUpdateMeasurements}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

