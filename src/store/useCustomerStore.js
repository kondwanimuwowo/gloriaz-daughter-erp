import { create } from "zustand";
import { customerService } from "../services/customerService";
import toast from "react-hot-toast";

export const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,

  // Fetch all customers
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await customerService.getAllCustomers();
      set({ customers, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch customers");
    }
  },

  // Fetch customer with orders
  fetchCustomerWithOrders: async (id) => {
    set({ loading: true });
    try {
      const customer = await customerService.getCustomerWithOrders(id);
      set({ selectedCustomer: customer, loading: false });
      return customer;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch customer details");
      throw error;
    }
  },

  // Add customer
  addCustomer: async (customer) => {
    set({ loading: true });
    try {
      const newCustomer = await customerService.addCustomer(customer);
      set((state) => ({
        customers: [newCustomer, ...state.customers],
        loading: false,
      }));
      toast.success("Customer added successfully!");
      return newCustomer;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add customer");
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedCustomer = await customerService.updateCustomer(id, updates);
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? updatedCustomer : c
        ),
        selectedCustomer:
          state.selectedCustomer?.id === id
            ? updatedCustomer
            : state.selectedCustomer,
        loading: false,
      }));
      toast.success("Customer updated successfully!");
      return updatedCustomer;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to update customer");
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    set({ loading: true });
    try {
      await customerService.deleteCustomer(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        loading: false,
      }));
      toast.success("Customer deleted successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to delete customer");
      throw error;
    }
  },

  // Update measurements
  updateMeasurements: async (id, measurements) => {
    try {
      const updatedCustomer = await customerService.updateMeasurements(
        id,
        measurements
      );
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? updatedCustomer : c
        ),
        selectedCustomer:
          state.selectedCustomer?.id === id
            ? updatedCustomer
            : state.selectedCustomer,
      }));
      toast.success("Measurements updated successfully!");
      return updatedCustomer;
    } catch (error) {
      toast.error("Failed to update measurements");
      throw error;
    }
  },

  // Set selected customer
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  // Clear selected customer
  clearSelectedCustomer: () => set({ selectedCustomer: null }),
}));
