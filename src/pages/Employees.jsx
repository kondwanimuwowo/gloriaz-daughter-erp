import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Clock, TrendingUp, Search } from "lucide-react";
import { useEmployeeStore } from "../store/useEmployeeStore";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import EmployeeCard from "../components/employees/EmployeeCard";
import AddEmployeeForm from "../components/employees/AddEmployeeForm";
import ClockInOut from "../components/employees/ClockInOut";
import TodayAttendance from "../components/employees/TodayAttendance";
import AttendanceTable from "../components/employees/AttendanceTable";

export default function Employees() {
  const {
    employees,
    todayAttendance,
    loading,
    fetchEmployees,
    fetchTodayAttendance,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingAttendance, setViewingAttendance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchTodayAttendance();
  }, [fetchEmployees, fetchTodayAttendance]);

  // Calculate stats
  const activeEmployees = employees.filter((e) => e.active).length;
  const clockedInToday = todayAttendance.filter((a) => !a.clock_out).length;
  const totalHoursToday = todayAttendance.reduce(
    (sum, a) => sum + parseFloat(a.hours_worked || 0),
    0
  );

  // Filter employees
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = async (data) => {
    await addEmployee(data);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = async (data) => {
    await updateEmployee(editingEmployee.id, data);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this employee?")) {
      await deleteEmployee(id);
    }
  };

  const handleClockAction = () => {
    fetchTodayAttendance();
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
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
            Employee Management
          </h1>
          <p className="text-gray-600">Manage employees and track attendance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={Plus}>
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900">
                {activeEmployees}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clocked In Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {clockedInToday}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hours Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalHoursToday.toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Clock In/Out and Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClockInOut employees={employees} onClockAction={handleClockAction} />
        <TodayAttendance attendance={todayAttendance} />
      </div>

      {/* Employee List Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">All Employees</h2>
          <div className="relative flex-1 max-w-md ml-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="search"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No employees found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding your first employee"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddModal(true)} icon={Plus}>
                Add Your First Employee
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={setEditingEmployee}
                onDeactivate={handleDeleteEmployee}
                onViewDetails={setViewingAttendance}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
      >
        <AddEmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee"
      >
        <AddEmployeeForm
          employee={editingEmployee}
          onSubmit={handleUpdateEmployee}
          onCancel={() => setEditingEmployee(null)}
        />
      </Modal>

      {/* View Attendance Modal */}
      <Modal
        isOpen={!!viewingAttendance}
        onClose={() => setViewingAttendance(null)}
        title="Attendance Records"
        size="lg"
      >
        {viewingAttendance && <AttendanceTable employee={viewingAttendance} />}
      </Modal>
    </div>
  );
}
