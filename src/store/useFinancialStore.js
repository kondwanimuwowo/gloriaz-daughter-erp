import { create } from "zustand";
import { financeService } from "../services/financeService";
import toast from "react-hot-toast";

export const useFinancialStore = create((set, get) => ({
  garmentTypes: [],
  overheadCosts: [],
  expenses: [],
  payments: [],
  financialSettings: null,
  monthlyFinancialSummary: null,
  loading: false,
  error: null,

  fetchGarmentTypes: async () => {
    set({ loading: true });
    try {
      const data = await financeService.getAllGarmentTypes();
      set({ garmentTypes: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch garment types");
    }
  },

  addGarmentType: async (garmentType) => {
    set({ loading: true });
    try {
      const newType = await financeService.addGarmentType(garmentType);
      set((state) => ({
        garmentTypes: [...state.garmentTypes, newType],
        loading: false,
      }));
      toast.success("Garment type added!");
      return newType;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add garment type");
      throw error;
    }
  },

  updateGarmentType: async (id, updates) => {
    try {
      const updated = await financeService.updateGarmentType(id, updates);
      set((state) => ({
        garmentTypes: state.garmentTypes.map((g) =>
          g.id === id ? updated : g
        ),
      }));
      toast.success("Garment type updated!");
      return updated;
    } catch (error) {
      toast.error("Failed to update garment type");
      throw error;
    }
  },

  deleteGarmentType: async (id) => {
    try {
      await financeService.deleteGarmentType(id);
      set((state) => ({
        garmentTypes: state.garmentTypes.filter((g) => g.id !== id),
      }));
      toast.success("Garment type removed");
    } catch (error) {
      toast.error("Failed to remove garment type");
      throw error;
    }
  },

  fetchOverheadCosts: async (month = new Date()) => {
    set({ loading: true });
    try {
      const data = await financeService.getOverheadCosts(month);
      set({ overheadCosts: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch overhead costs");
    }
  },

  addOverheadCost: async (cost) => {
    set({ loading: true });
    try {
      const newCost = await financeService.addOverheadCost(cost);
      set((state) => ({
        overheadCosts: [...state.overheadCosts, newCost],
        loading: false,
      }));
      toast.success("Overhead cost added!");
      return newCost;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add overhead cost");
      throw error;
    }
  },

  updateOverheadCost: async (id, updates) => {
    try {
      const updated = await financeService.updateOverheadCost(id, updates);
      set((state) => ({
        overheadCosts: state.overheadCosts.map((c) =>
          c.id === id ? updated : c
        ),
      }));
      toast.success("Overhead cost updated!");
      return updated;
    } catch (error) {
      toast.error("Failed to update overhead cost");
      throw error;
    }
  },

  deleteOverheadCost: async (id) => {
    try {
      await financeService.deleteOverheadCost(id);
      set((state) => ({
        overheadCosts: state.overheadCosts.filter((c) => c.id !== id),
      }));
      toast.success("Overhead cost deleted");
    } catch (error) {
      toast.error("Failed to delete overhead cost");
      throw error;
    }
  },

  fetchExpenses: async (startDate = null, endDate = null) => {
    set({ loading: true });
    try {
      const data = await financeService.getAllExpenses(startDate, endDate);
      set({ expenses: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch expenses");
    }
  },

  addExpense: async (expense) => {
    set({ loading: true });
    try {
      const newExpense = await financeService.addExpense(expense);
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        loading: false,
      }));
      toast.success("Expense added!");
      return newExpense;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add expense");
      throw error;
    }
  },

  updateExpense: async (id, updates) => {
    try {
      const updated = await financeService.updateExpense(id, updates);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
      }));
      toast.success("Expense updated!");
      return updated;
    } catch (error) {
      toast.error("Failed to update expense");
      throw error;
    }
  },

  deleteExpense: async (id) => {
    try {
      await financeService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
      toast.success("Expense deleted");
    } catch (error) {
      toast.error("Failed to delete expense");
      throw error;
    }
  },

  fetchPayments: async (startDate = null, endDate = null) => {
    set({ loading: true });
    try {
      const data = await financeService.getPayments(startDate, endDate);
      set({ payments: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch payments");
    }
  },

  addPayment: async (payment) => {
    set({ loading: true });
    try {
      const newPayment = await financeService.addPayment(payment);
      set((state) => ({
        payments: [newPayment, ...state.payments],
        loading: false,
      }));
      toast.success("Payment recorded!");
      return newPayment;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to record payment");
      throw error;
    }
  },

  deletePayment: async (id) => {
    try {
      await financeService.deletePayment(id);
      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
      }));
      toast.success("Payment deleted");
    } catch (error) {
      toast.error("Failed to delete payment");
      throw error;
    }
  },

  fetchFinancialSettings: async () => {
    try {
      const data = await financeService.getFinancialSettings();
      set({ financialSettings: data });
    } catch (error) {
      toast.error("Failed to fetch settings");
    }
  },

  updateFinancialSettings: async (updates) => {
    try {
      const updated = await financeService.updateFinancialSettings(updates);
      set({ financialSettings: updated });
      toast.success("Settings updated!");
      return updated;
    } catch (error) {
      toast.error("Failed to update settings");
      throw error;
    }
  },

  fetchMonthlyFinancialSummary: async (month = new Date()) => {
    set({ loading: true });
    try {
      const summary = await financeService.getMonthlyFinancialSummary(month);
      set({ monthlyFinancialSummary: summary, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch financial summary");
    }
  },
}));
