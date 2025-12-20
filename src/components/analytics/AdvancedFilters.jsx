import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Search, Calendar } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdvancedFilters({
  onApplyFilters,
  customers = [],
  employees = [],
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    customerId: "all",
    employeeId: "all",
    status: "all",
    minAmount: "",
    maxAmount: "",
  });

  const handleApply = () => {
    // Convert "all" back to empty string for logic if needed, or handle in parent
    const appliedFilters = {
        ...filters,
        customerId: filters.customerId === "all" ? "" : filters.customerId,
        employeeId: filters.employeeId === "all" ? "" : filters.employeeId,
        status: filters.status === "all" ? "" : filters.status,
    }
    onApplyFilters(appliedFilters);
    setShowFilters(false);
  };

  const handleReset = () => {
    const defaultFilters = {
      startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      customerId: "all",
      employeeId: "all",
      status: "all",
      minAmount: "",
      maxAmount: "",
    };
    setFilters(defaultFilters);
    onApplyFilters({
        ...defaultFilters,
        customerId: "",
        employeeId: "",
        status: "",
    });
  };

  const setQuickDate = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case "this_month":
        startDate = startOfMonth(now);
        break;
      case "last_month":
        startDate = startOfMonth(subMonths(now, 1));
        break;
      case "last_3_months":
        startDate = subMonths(now, 3);
        break;
      case "last_6_months":
        startDate = subMonths(now, 6);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = subMonths(now, 3);
    }

    setFilters({
      ...filters,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(now, "yyyy-MM-dd"),
    });
  };

  return (
    <div className="mb-6">
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="mb-4"
      >
        <Filter className="mr-2 h-4 w-4" />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </Button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Advanced Filters
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Date Filters */}
              <div className="mb-6">
                <Label className="mb-2 block">Quick Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "This Month", value: "this_month" },
                    { label: "Last Month", value: "last_month" },
                    { label: "Last 3 Months", value: "last_3_months" },
                    { label: "Last 6 Months", value: "last_6_months" },
                    { label: "This Year", value: "this_year" },
                  ].map((period) => (
                    <Button
                      key={period.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDate(period.value)}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Date Range */}
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>

                {/* Customer Filter */}
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={filters.customerId}
                    onValueChange={(val) => setFilters({ ...filters, customerId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Filter */}
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select
                    value={filters.employeeId}
                    onValueChange={(val) => setFilters({ ...filters, employeeId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(val) => setFilters({ ...filters, status: val })}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Amount (K)</Label>
                    <Input
                        id="minAmount"
                        type="number"
                        placeholder="0"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount (K)</Label>
                    <Input
                        id="maxAmount"
                        type="number"
                        placeholder="10000"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleApply} className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

