import { create } from "zustand";
import { employeeService } from "../services/employeeService";
import toast from "react-hot-toast";

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  todayAttendance: [],
  loading: false,
  error: null,
  selectedEmployee: null,

  // Fetch all employees
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const employees = await employeeService.getAllEmployees();
      set({ employees, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch employees");
    }
  },

  // Fetch today's attendance
  fetchTodayAttendance: async () => {
    try {
      const attendance = await employeeService.getTodayAttendance();
      set({ todayAttendance: attendance });
    } catch (error) {
      toast.error("Failed to fetch attendance");
    }
  },

  // Add employee
  addEmployee: async (employee) => {
    set({ loading: true });
    try {
      const newEmployee = await employeeService.addEmployee(employee);
      set((state) => ({
        employees: [newEmployee, ...state.employees],
        loading: false,
      }));
      toast.success("Employee added successfully!");
      return newEmployee;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add employee");
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedEmployee = await employeeService.updateEmployee(id, updates);
      set((state) => ({
        employees: state.employees.map((e) =>
          e.id === id ? updatedEmployee : e
        ),
        loading: false,
      }));
      toast.success("Employee updated successfully!");
      return updatedEmployee;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to update employee");
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    set({ loading: true });
    try {
      await employeeService.deleteEmployee(id);
      set((state) => ({
        employees: state.employees.map((e) =>
          e.id === id ? { ...e, active: false } : e
        ),
        loading: false,
      }));
      toast.success("Employee deactivated successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to deactivate employee");
      throw error;
    }
  },

  // Clock in
  clockIn: async (employeeId, notes) => {
    try {
      await employeeService.clockIn(employeeId, notes);
      // Refresh today's attendance
      await get().fetchTodayAttendance();
      toast.success("Clocked in successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to clock in");
      throw error;
    }
  },

  // Clock out
  clockOut: async (employeeId, notes) => {
    try {
      await employeeService.clockOut(employeeId, notes);
      // Refresh today's attendance
      await get().fetchTodayAttendance();
      toast.success("Clocked out successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to clock out");
      throw error;
    }
  },

  // Set selected employee
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

  // Clear selected employee
  clearSelectedEmployee: () => set({ selectedEmployee: null }),
}));
