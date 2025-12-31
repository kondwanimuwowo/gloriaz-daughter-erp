import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, subMonths, addMonths, startOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useQueryRecovery } from "../hooks/useQueryRecovery";
import { useFinanceRealtime } from "../hooks/useFinanceRealtime";

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
    Wallet,
    Info,
    FileText
} from "lucide-react";
import { Skeleton as SkeletonComp } from "@/components/ui/skeleton";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

import GarmentTypeManager from "../components/finance/GarmentTypeManager";
import OverheadManager from "../components/finance/OverheadManager";
import FinancialSettings from "../components/finance/FinancialSettings";
import { useForm } from "react-hook-form";
import StatsCard from "../components/dashboard/StatsCard";
import { exportExpenses, exportPayments, exportFinancialSummary } from "../utils/excelExport";

export default function Finance() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. HARD RECOVERY ORCHESTRATION
    useQueryRecovery();
    useFinanceRealtime();

    const [periodType, setPeriodType] = useState("monthly"); // monthly, quarterly, annual
    const [selectedDate, setSelectedDate] = useState(new Date()); // Base date to calculate range from
    const [activeTab, setActiveTab] = useState("profitloss");
    const [showSettings, setShowSettings] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [completedOrders, setCompletedOrders] = useState([]);



    // Calculate Date Range based on periodType and selectedDate
    const dateRange = useMemo(() => {
        let start, end;
        const date = new Date(selectedDate);

        if (periodType === "annual") {
            start = new Date(date.getFullYear(), 0, 1);
            end = new Date(date.getFullYear(), 11, 31);
        } else if (periodType === "quarterly") {
            const quarter = Math.floor(date.getMonth() / 3);
            start = new Date(date.getFullYear(), quarter * 3, 1);
            end = new Date(date.getFullYear(), (quarter * 3) + 3, 0);
        } else {
            // Monthly
            start = new Date(date.getFullYear(), date.getMonth(), 1);
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }
        return { start, end };
    }, [periodType, selectedDate]);

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
        fetchFinancialSummary,
        fetchExpenses,
        fetchPayments,
        fetchOverheadCosts,
        addExpense,
        deleteExpense,
    } = useFinancialStore();

    // 2. DATA QUERIES (Marked as erpCritical)
    const { isLoading: loading } = useQuery({
        queryKey: ['finance-data', periodType, format(dateRange.start, 'yyyy-MM-dd')],
        queryFn: async () => {
            const startDate = format(dateRange.start, "yyyy-MM-dd");
            const endDate = format(dateRange.end, "yyyy-MM-dd");

            await Promise.all([
                fetchFinancialSummary(startDate, endDate),
                fetchExpenses(startDate, endDate),
                fetchPayments(startDate, endDate),
                fetchOverheadCosts(startDate, endDate),
                fetchCompletedOrders(startDate, endDate),
            ]);
            return true;
        },
        meta: { erpCritical: true },
        enabled: !!dateRange.start,
    });

    const loadData = () => {
        const startDate = format(dateRange.start, "yyyy-MM-dd");
        const endDate = format(dateRange.end, "yyyy-MM-dd");

        fetchFinancialSummary(startDate, endDate);
        fetchExpenses(startDate, endDate);
        fetchPayments(startDate, endDate);
        fetchOverheadCosts(startDate, endDate);
        fetchCompletedOrders(startDate, endDate);
    };

    const fetchCompletedOrders = async (startDate, endDate) => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .select(`
          id,
          order_number,
          customer_id,
          customers(name),
          total_cost,
          material_cost,
          labour_cost,
          overhead_cost,
          created_at,
          updated_at
        `)
                .in("status", ["completed", "delivered"])
                .gte("updated_at", startDate)
                .lte("updated_at", endDate)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            setCompletedOrders(data || []);
        } catch (error) {
            console.error("Error fetching completed orders:", error);
            toast.error("Failed to load P&L data");
        }
    };

    const handlePeriodChange = (direction) => {
        const newDate = new Date(selectedDate);
        const offset = direction === "prev" ? -1 : 1;

        if (periodType === "annual") {
            newDate.setFullYear(newDate.getFullYear() + offset);
        } else if (periodType === "quarterly") {
            newDate.setMonth(newDate.getMonth() + (offset * 3));
        } else {
            newDate.setMonth(newDate.getMonth() + offset);
        }
        setSelectedDate(newDate);
    };

    const isNextDisabled = () => {
        const today = new Date();
        // Simple check: if start of next period is in future
        // Actually, users might want to see future projections if overheads are set? 
        // But usually we limit to current time.
        // Let's limit strictly to current period containing today.
        if (periodType === 'monthly' && selectedDate >= startOfMonth(today)) return true;
        if (periodType === 'annual' && selectedDate.getFullYear() >= today.getFullYear()) return true;
        // Quarterly check is a bit complex, let's just allow it for now or implement strict logic
        return false;
    };

    const formatPeriodLabel = () => {
        if (periodType === "annual") {
            return format(selectedDate, "yyyy");
        } else if (periodType === "quarterly") {
            const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
            return `Q${quarter} ${format(selectedDate, "yyyy")}`;
        } else {
            return format(selectedDate, "MMMM yyyy");
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
                    if (window.confirm("Delete this expense?")) {
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

    // P&L Columns
    const plColumns = useMemo(() => [
        {
            accessorKey: "order_number",
            header: () => (
                <div className="flex items-center gap-1">
                    Order #
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Order reference number</TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
        {
            accessorKey: "customers.name",
            header: "Customer",
            cell: ({ row }) => row.original.customers?.name || "-"
        },
        {
            accessorKey: "updated_at",
            header: "Completed",
            cell: ({ row }) => format(new Date(row.getValue("updated_at")), "MMM d, yyyy"),
        },
        {
            accessorKey: "total_cost",
            header: () => (
                <div className="flex items-center gap-1">
                    Revenue
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Total amount charged to customer</TooltipContent>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_cost") || 0);
                return <span className="font-semibold text-green-600">K{amount.toFixed(2)}</span>
            }
        },
        {
            id: "cost",
            header: () => (
                <div className="flex items-center gap-1">
                    Cost
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Materials + Labour + Overhead</TooltipContent>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const cost = parseFloat(row.original.material_cost || 0) +
                    parseFloat(row.original.labour_cost || 0) +
                    parseFloat(row.original.overhead_cost || 0);
                return <span className="font-semibold">K{cost.toFixed(2)}</span>
            }
        },
        {
            id: "profit",
            header: () => (
                <div className="flex items-center gap-1">
                    Profit
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Revenue minus total costs</TooltipContent>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const revenue = parseFloat(row.original.total_cost || 0);
                const cost = parseFloat(row.original.material_cost || 0) +
                    parseFloat(row.original.labour_cost || 0) +
                    parseFloat(row.original.overhead_cost || 0);
                const profit = revenue - cost;
                return (
                    <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        K{profit.toFixed(2)}
                    </span>
                )
            }
        },
        {
            id: "margin",
            header: () => (
                <div className="flex items-center gap-1">
                    Margin %
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>(Profit ÷ Revenue) × 100</TooltipContent>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const revenue = parseFloat(row.original.total_cost || 0);
                const cost = parseFloat(row.original.material_cost || 0) +
                    parseFloat(row.original.labour_cost || 0) +
                    parseFloat(row.original.overhead_cost || 0);
                const profit = revenue - cost;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                return (
                    <Badge
                        variant="outline"
                        className={margin < 0 ? 'bg-red-50 text-red-700' : margin < 20 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}
                    >
                        {margin.toFixed(1)}%
                    </Badge>
                )
            }
        },
    ], []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <SkeletonComp className="h-10 w-48" />
                        <SkeletonComp className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <SkeletonComp className="h-10 w-32" />
                        <SkeletonComp className="h-10 w-32" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonComp key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <SkeletonComp className="h-[500px] w-full rounded-xl" />
            </div>
        );
    }

    // Calculate P&L totals
    const plTotals = useMemo(() => {
        const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total_cost || 0), 0);
        const totalCost = completedOrders.reduce((sum, order) => {
            return sum + parseFloat(order.material_cost || 0) +
                parseFloat(order.labour_cost || 0) +
                parseFloat(order.overhead_cost || 0);
        }, 0);
        const totalProfit = totalRevenue - totalCost;
        const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
            revenue: totalRevenue,
            cost: totalCost,
            profit: totalProfit,
            margin: avgMargin,
            count: completedOrders.length
        };
    }, [completedOrders]);

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
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                    {/* Period Type Selection */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={periodType} onValueChange={setPeriodType}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Period Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center justify-center gap-4 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => handlePeriodChange("prev")}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2 text-lg font-semibold min-w-[200px] justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                            {formatPeriodLabel()}
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => handlePeriodChange("next")} disabled={isNextDisabled()}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-full sm:w-auto"></div>
                </div>
            </Card>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profitloss">Profit & Loss</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="labour">Labour Rates</TabsTrigger>
                    <TabsTrigger value="overhead">Overhead</TabsTrigger>
                </TabsList>

                <TabsContent value="profitloss" className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <div>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Profit & Loss Statement
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Completed orders for {formatPeriodLabel()}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                            // Export P&L logic here
                            toast.success("P&L export coming soon!");
                        }}>
                            <Download className="h-4 w-4 mr-2" /> Export P&L
                        </Button>
                    </div>

                    {/* P&L Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">K{plTotals.revenue.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{plTotals.count} completed orders</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Costs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">K{plTotals.cost.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">All production costs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${plTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    K{plTotals.profit.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Revenue - Costs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Margin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${plTotals.margin >= 20 ? 'text-green-600' : plTotals.margin >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {plTotals.margin.toFixed(1)}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Average profit margin</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* P&L Table */}
                    <Card className="overflow-hidden border-border/60">
                        <DataTable
                            columns={plColumns}
                            data={completedOrders}
                            filterColumn="order_number"
                            searchPlaceholder="Search orders..."
                            emptyMessage="No completed orders in this period"
                            emptyDescription="Complete some orders to see them in the P&L statement"
                        />
                    </Card>
                </TabsContent>

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
                                <Download className="h-4 w-4 mr-2" /> Export
                            </Button>
                            <Button onClick={() => setShowAddExpense(true)}><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
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
                            <Download className="h-4 w-4 mr-2" /> Export
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
                    <OverheadManager selectedMonth={selectedDate} onDataChange={loadData} />
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
                        } catch (e) {
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

