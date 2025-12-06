import { supabase } from "../lib/supabase";

export const employeeService = {
  // Get all employees
  async getAllEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get active employees only
  async getActiveEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Get employee by ID
  async getEmployeeById(id) {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Add new employee
  async addEmployee(employee) {
    const { data, error } = await supabase
      .from("employees")
      .insert([employee])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update employee
  async updateEmployee(id, updates) {
    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete employee (soft delete - set active to false)
  async deleteEmployee(id) {
    const { data, error } = await supabase
      .from("employees")
      .update({ active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Clock in
  async clockIn(employeeId, notes = "") {
    const today = new Date().toISOString().split("T")[0];

    // Check if already clocked in today
    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", today)
      .single();

    if (existing && existing.clock_in && !existing.clock_out) {
      throw new Error("Already clocked in for today");
    }

    if (existing && existing.clock_out) {
      throw new Error("Already completed shift for today");
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert([
        {
          employee_id: employeeId,
          date: today,
          clock_in: new Date().toISOString(),
          notes: notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Clock out
  async clockOut(employeeId, notes = "") {
    const today = new Date().toISOString().split("T")[0];

    // Get today's attendance record
    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", today)
      .single();

    if (!attendance) {
      throw new Error("No clock-in record found for today");
    }

    if (attendance.clock_out) {
      throw new Error("Already clocked out for today");
    }

    // Calculate hours worked
    const clockIn = new Date(attendance.clock_in);
    const clockOut = new Date();
    const hoursWorked = (clockOut - clockIn) / (1000 * 60 * 60);

    const { data, error } = await supabase
      .from("attendance")
      .update({
        clock_out: clockOut.toISOString(),
        hours_worked: hoursWorked.toFixed(2),
        notes: notes || attendance.notes,
      })
      .eq("id", attendance.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get attendance records for an employee
  async getEmployeeAttendance(employeeId, startDate = null, endDate = null) {
    let query = supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get today's attendance for all employees
  async getTodayAttendance() {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        *,
        employees (
          id,
          name,
          role,
          email
        )
      `
      )
      .eq("date", today)
      .order("clock_in", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get attendance status for an employee today
  async getTodayStatus(employeeId) {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
    return data;
  },

  // Get attendance summary for date range
  async getAttendanceSummary(startDate, endDate) {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        *,
        employees (
          id,
          name,
          role
        )
      `
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Calculate total hours for employee in date range
  async calculateTotalHours(employeeId, startDate, endDate) {
    const { data, error } = await supabase
      .from("attendance")
      .select("hours_worked")
      .eq("employee_id", employeeId)
      .gte("date", startDate)
      .lte("date", endDate)
      .not("hours_worked", "is", null);

    if (error) throw error;

    const totalHours = data.reduce(
      (sum, record) => sum + parseFloat(record.hours_worked || 0),
      0
    );

    return totalHours;
  },
};
