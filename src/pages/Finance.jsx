import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, subMonths, addMonths } from "date-fns";
import {
  DollarSign,
  Calendar,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Trash2,
  TrendingUp,
  CreditCard,
  Wallet
} from "lucide-react";

import { useFinancialStore } from "../store/useFinancialStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input as ShadInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import toast from "react-hot-toast";

import GarmentTypeManager from "../components/finance/GarmentTypeManager";
import OverheadManager from "../components/finance/OverheadManager";
import FinancialSettings from "../components/finance/FinancialSettings";
import { useForm } from "react-hook-form";
import StatsCard from "../components/dashboard/StatsCard";
import { exportExpenses, exportPayments, exportFinancialSummary } from "../utils/excelExport";

export default function Finance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handlePaymentClick = (payment) => {
    if (payment.order_id) {
       navigate("/orders", { state: { openOrderId: payment.order_id } });
    }
  };

  const handleExpenseClick = (expense) => {
    if (expense.order_id) {
        navigate("/orders", { state: { openOrderId: expense.order_id } });
    } else if (expense.employee_id) {
        navigate("/employees", { state: { openEmployeeId: expense.employee_id } });
    }
  };

  const {
    monthlyFinancialSummary,
    expenses,
    payments,
    overheadCosts,
    fetchMonthlyFinancialSummary,
    fetchExpenses,
    fetchPayments,
    fetchOverheadCosts,
    addExpense,
    deleteExpense,
    loading,
  } = useFinancialStore();

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    const startDate = format(selectedMonth, "yyyy-MM-01");
    const endDate = format(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0),
      "yyyy-MM-dd"
    );

    await Promise.all([
      fetchMonthlyFinancialSummary(selectedMonth),
      fetchExpenses(startDate, endDate),
      fetchPayments(startDate, endDate),
      fetchOverheadCosts(selectedMonth),
    ]);
  };

  const handleMonthChange = (direction) => {
    if (direction === "prev") {
      setSelectedMonth(subMonths(selectedMonth, 1));
    } else {
      const next = addMonths(selectedMonth, 1);
      if (next <= new Date()) {
        setSelectedMonth(next);
      }
    }
  };

  const handleExportSummary = () => {
    if (!monthlyFinancialSummary) {
      toast.error("No data to export");
      return;
    }
    try {
      exportFinancialSummary(monthlyFinancialSummary);
      toast.success("Financial summary exported!");
    } catch (error) {
      toast.error("Failed to export summary");
    }
  };

  const handleExportExpenses = () => {
    if (!expenses || expenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }
    try {
      exportExpenses(expenses);
      toast.success("Expenses exported!");
    } catch (error) {
      toast.error("Failed to export expenses");
    }
  };

  const handleExportPayments = () => {
    if (!payments || payments.length === 0) {
      toast.error("No payments to export");
      return;
    }
    try {
      exportPayments(payments);
      toast.success("Payments exported!");
    } catch (error) {
      toast.error("Failed to export payments");
    }
  };

  // Expenses Columns
  const expenseColumns = useMemo(() => [
      {
          accessorKey: "expense_date",
          header: "Date",
          cell: ({ row }) => format(new Date(row.getValue("expense_date")), "MMM d, yyyy"),
      },
      {
          accessorKey: "category",
          header: "Category",
          cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.getValue("category")}</Badge>
      },
      {
          accessorKey: "description",
          header: "Description",
      },
      {
          accessorKey: "amount",
          header: "Amount",
          cell: ({ row }) => {
              const amount = parseFloat(row.getValue("amount"));
              return <span className="font-semibold">{new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(amount)}</span>
          }
      },
      {
          id: "actions",
          cell: ({ row }) => (
              <Button variant="ghost" size="icon" onClick={() => {
                  if(window.confirm("Delete this expense?")) {
                      deleteExpense(row.original.id);
                  }
              }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
          )
      }
  ], [deleteExpense]);

  // Payments Columns
  const paymentColumns = useMemo(() => [
    {
        accessorKey: "payment_date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("payment_date")), "MMM d, yyyy"),
    },
    {
        accessorKey: "orders.order_number", 
        header: "Order",
        cell: ({ row }) => row.original.orders?.order_number || "-"
    },
    {
        accessorKey: "orders.customers.name",
        header: "Customer",
        cell: ({ row }) => row.original.orders?.customers?.name || "-"
    },
    {
        accessorKey: "payment_method",
        header: "Method",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("payment_method")?.replace("_", " ")}</Badge>
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            return <span className="font-semibold text-green-600">{new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(amount)}</span>
        }
    }
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Financial management and profitability tracking</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={handleExportSummary}>
              <Download className="mr-2 h-4 w-4" /> Export Summary
           </Button>
           <Button variant="outline" onClick={() => setShowSettings(true)}>
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
           </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-2">
           <Button variant="ghost" onClick={() => handleMonthChange("prev")}>
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <div className="flex items-center gap-2">
             <Calendar className="h-5 w-5 text-primary" />
             <span className="text-lg font-semibold">{format(selectedMonth, "MMMM yyyy")}</span>
           </div>
           <Button variant="ghost" onClick={() => handleMonthChange("next")} disabled={selectedMonth >= new Date()}>
             <ChevronRight className="h-4 w-4" />
           </Button>
        </div>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="labour">Labour Rates</TabsTrigger>
            <TabsTrigger value="overhead">Overhead</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
            {monthlyFinancialSummary && (
                <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                      title="Revenue"
                      value={`K${monthlyFinancialSummary.totalRevenue.toLocaleString()}`}
                      subtitle={`${monthlyFinancialSummary.totalOrders} orders`}
                      icon={DollarSign}
                      color="green"
                    />
                    <StatsCard
                      title="Total Costs"
                      value={`K${monthlyFinancialSummary.totalCosts.toLocaleString()}`}
                      subtitle="All expenses"
                      icon={TrendingUp}
                      color="red"
                    />
                    <StatsCard
                      title="Net Profit"
                      value={`K${monthlyFinancialSummary.netProfit.toLocaleString()}`}
                      subtitle={`${monthlyFinancialSummary.profitMargin.toFixed(1)}% margin`}
                      icon={Wallet}
                      color={monthlyFinancialSummary.netProfit >= 0 ? "blue" : "red"}
                    />
                    <StatsCard
                      title="Cash Flow"
                      value={`K${monthlyFinancialSummary.cashFlow.toLocaleString()}`}
                      subtitle="Inflow - Outflow"
                      icon={CreditCard}
                      color="purple"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">%</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { label: "Revenue", amount: monthlyFinancialSummary.totalRevenue, color: "text-green-600", isTotal: false },
                                        { label: "Material Costs", amount: monthlyFinancialSummary.totalMaterial, color: "text-gray-900", isTotal: false },
                                        { label: "Labour Costs", amount: monthlyFinancialSummary.totalLabour, color: "text-gray-900", isTotal: false },
                                        { label: "Overhead", amount: monthlyFinancialSummary.totalOverhead, color: "text-gray-900", isTotal: false },
                                        { label: "Other Expenses", amount: monthlyFinancialSummary.totalExpenses, color: "text-gray-900", isTotal: false },
                                        { label: "Net Profit", amount: monthlyFinancialSummary.netProfit, color: "text-blue-600", isTotal: true },
                                    ].map((item) => (
                                        <TableRow key={item.label} className={item.isTotal ? "font-bold bg-muted/50" : ""}>
                                            <TableCell>{item.label}</TableCell>
                                            <TableCell className={`text-right ${item.color}`}>K{item.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                {monthlyFinancialSummary.totalRevenue > 0 ? ((item.amount / monthlyFinancialSummary.totalRevenue) * 100).toFixed(1) : 0}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div>Completed</div>
                                    <span className="font-bold">{monthlyFinancialSummary.completedOrders}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>Pending</div>
                                    <span className="font-bold">{monthlyFinancialSummary.pendingOrders}</span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="font-medium">Total Orders</span>
                                    <span className="font-bold">{monthlyFinancialSummary.totalOrders}</span>
                                </div>
                             </div>
                         </CardContent>
                    </Card>
                </div>
                </>
            )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-medium">Expense Records</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportExpenses}>
                    <Download className="h-4 w-4 mr-2"/> Export
                  </Button>
                  <Button onClick={() => setShowAddExpense(true)}><Plus className="h-4 w-4 mr-2"/> Add Expense</Button>
                </div>
            </div>
            <Card className="overflow-hidden border-border/60">
                <DataTable 
                  columns={expenseColumns} 
                  data={expenses || []} 
                  filterColumn="description" 
                  searchPlaceholder="Search expenses..." 
                  onRowClick={handleExpenseClick}
                />
            </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-medium">Payment Records</h3>
                <Button variant="outline" size="sm" onClick={handleExportPayments}>
                  <Download className="h-4 w-4 mr-2"/> Export
                </Button>
            </div>
            <Card className="overflow-hidden border-border/60">
                <DataTable 
                  columns={paymentColumns} 
                  data={payments || []} 
                  filterColumn="orders.order_number" 
                  searchPlaceholder="Search by order number..." 
                  onRowClick={handlePaymentClick}
                />
            </Card>
        </TabsContent>

        <TabsContent value="labour" className="space-y-4">
             <GarmentTypeManager />
        </TabsContent>

        <TabsContent value="overhead" className="space-y-4">
             <OverheadManager selectedMonth={selectedMonth} onDataChange={loadData} />
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Financial Settings</DialogTitle>
            </DialogHeader>
            <FinancialSettings onClose={() => setShowSettings(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <SimpleExpenseForm onSubmit={async (data) => {
                  try {
                    await addExpense(data);
                    setShowAddExpense(false);
                    loadData(); // Refresh overview
                  } catch(e) { 
                      console.error(e) 
                  }
              }} onCancel={() => setShowAddExpense(false)} />
          </DialogContent>
      </Dialog>
    </div>
  );
}

function SimpleExpenseForm({ onSubmit, onCancel }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            expense_date: format(new Date(), "yyyy-MM-dd"),
            category: "materials",
            payment_method: "cash"
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <ShadInput id="date" type="date" {...register("expense_date", { required: true })} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(val) => register("category").onChange({ target: { value: val, name: "category" } })} defaultValue="materials">
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <ShadInput id="desc" {...register("description", { required: true })} placeholder="e.g. Fabric purchase" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (ZMW)</Label>
                <ShadInput id="amount" type="number" step="0.01" {...register("amount", { required: true, min: 0 })} />
            </div>
             <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>Save Expense</Button>
            </div>
        </form>
    );
}

