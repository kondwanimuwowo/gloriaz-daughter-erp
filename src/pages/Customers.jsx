import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, User, TrendingUp, ShoppingCart } from "lucide-react";
import { useCustomerStore } from "../store/useCustomerStore";
import { customerService } from "../services/customerService";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import CustomerCard from "../components/customers/CustomerCard";
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter customers
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate overall stats
  const totalCustomers = customers.length;
  const customersWithMeasurements = customers.filter(
    (c) => c.measurements
  ).length;

  const handleAddCustomer = async (data) => {
    await addCustomer(data);
    setShowAddModal(false);
  };

  const handleUpdateCustomer = async (data) => {
    await updateCustomer(editingCustomer.id, data);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id);
    }
  };

  const handleViewCustomer = async (customer) => {
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
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Management
          </h1>
          <p className="text-gray-600">
            Manage your customers and their information
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={Plus}>
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="text-primary-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">With Measurements</p>
              <p className="text-3xl font-bold text-gray-900">
                {customersWithMeasurements}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  customers.filter((c) => {
                    const created = new Date(c.created_at);
                    const now = new Date();
                    return (
                      created.getMonth() === now.getMonth() &&
                      created.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="search"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </Card>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <Card className="text-center py-12">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No customers found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by adding your first customer"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddModal(true)} icon={Plus}>
              Add Your First Customer
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={handleViewCustomer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer"
      >
        <AddCustomerForm
          onSubmit={handleAddCustomer}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        title="Edit Customer"
      >
        <AddCustomerForm
          customer={editingCustomer}
          onSubmit={handleUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
        />
      </Modal>

      {/* View Customer Modal */}
      <Modal
        isOpen={!!viewingCustomer}
        onClose={() => {
          setViewingCustomer(null);
          setCustomerStats(null);
        }}
        title="Customer Details"
        size="xl"
      >
        {viewingCustomer && (
          <CustomerDetailsView
            customer={viewingCustomer}
            stats={customerStats}
            onEdit={handleEditCustomer}
            onUpdateMeasurements={handleUpdateMeasurements}
          />
        )}
      </Modal>
    </div>
  );
}
