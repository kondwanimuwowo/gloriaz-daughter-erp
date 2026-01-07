import React, { useState } from "react";
import {
    BookOpen,
    FileText,
    Package,
    Scissors,
    DollarSign,
    Settings,
    HelpCircle,
    Download,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    ArrowRight,
    MousePointer2,
    Clock,
    ChevronRight,
    LayoutDashboard,
    ShoppingCart,
    Menu,
    X,
    Users,
    BarChart3,
    Sliders,
    TrendingUp,
    Bell,
    Wallet,
    Target,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Manual = () => {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const sections = [
        {
            id: "getting-started",
            title: "Getting Started",
            subtitle: "Your first steps in the ERP",
            icon: <LayoutDashboard size={20} />,
            color: "text-blue-500",
            bg: "bg-blue-50",
            content: (
                <div className="space-y-6">
                    <div className="prose max-w-none">
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Welcome to <strong>Gloria's Daughter ERP</strong>. This system is your digital assistant, designed to help you manage orders, track materials, and understand your business profits without needing to be a computer expert.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold flex items-center gap-3 mb-4 text-lg">
                                <MousePointer2 size={20} className="text-primary" />
                                1. Logging In
                            </h4>
                            <ul className="space-y-3 text-base text-muted-foreground">
                                <li className="flex gap-3"><ArrowRight size={16} className="mt-0.5 flex-shrink-0" /> Open your browser (Chrome is best).</li>
                                <li className="flex gap-3"><ArrowRight size={16} className="mt-0.5 flex-shrink-0" /> Enter your email and password.</li>
                                <li className="flex gap-3"><ArrowRight size={16} className="mt-0.5 flex-shrink-0" /> Click <strong>Sign In</strong>.</li>
                            </ul>
                        </div>
                        <div className="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold flex items-center gap-3 mb-4 text-lg">
                                <LayoutDashboard size={20} className="text-primary" />
                                2. The Dashboard
                            </h4>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                This is your "Home" screen. It shows you how many orders are active and which fabrics are running low. Use the <strong>Quick Links</strong> to jump straight to work.
                            </p>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
                            <Lightbulb className="text-primary" size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold text-primary mb-2 text-lg">Practical Tip</h4>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Bookmark this page in your browser by clicking the <strong>Star (⭐)</strong> icon in the address bar so you can find it instantly every morning.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "orders",
            title: "Managing Orders",
            subtitle: "From enquiry to delivery",
            icon: <ShoppingCart size={20} />,
            color: "text-purple-500",
            bg: "bg-purple-50",
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-primary rounded-full" />
                            How to Create a New Order
                        </h3>
                        <div className="space-y-6">
                            {[
                                { title: "Start", text: "Click 'Create Order' and choose 'Custom' for bespoke items or 'Pre-designed Garment' for items you already have in stock." },
                                { title: "Customer", text: "Select an existing customer or click '+ Add New' to quickly save their name and phone number." },
                                { title: "Requirements", text: "Select the garment type (e.g., Chitenge Dress) and describe what the customer wants." },
                                { title: "Materials", text: "Choose the fabrics and trims needed. The system will automatically calculate the cost for you." },
                                { title: "Pricing & Deposit", text: "Review the suggested price, set your final price, and record the deposit paid." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="pt-2 flex-1">
                                        <h4 className="font-bold text-xl text-slate-900 mb-1">{step.title}</h4>
                                        <p className="text-base text-muted-foreground leading-relaxed">{step.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white">
                        <h4 className="font-bold flex items-center gap-3 mb-5 text-primary text-xl">
                            <AlertCircle size={24} />
                            Critical Workflow Rule
                        </h4>
                        <p className="text-base text-slate-300 mb-6 leading-relaxed">
                            Always update the <strong>Order Status</strong> as you work. This keeps the customer timeline accurate and sends notifications to the team.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {['Enquiry', 'Measurements', 'Production', 'Fitting', 'Completed'].map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-slate-800 rounded-full text-sm font-bold text-slate-300">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-purple-500 rounded-full" />
                            Handling Payments & Balances
                        </h3>
                        <div className="space-y-4">
                            <p className="text-base text-muted-foreground leading-relaxed">
                                The system automatically tracks deposits and balances. When a customer pays:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                                    <h5 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                        <Wallet size={18} />
                                        Recording Deposits
                                    </h5>
                                    <p className="text-sm text-green-800">
                                        Enter the deposit amount when creating the order. The system will calculate the remaining balance automatically.
                                    </p>
                                </div>
                                <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                                    <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                        <TrendingUp size={18} />
                                        Final Payment
                                    </h5>
                                    <p className="text-sm text-amber-800">
                                        When the customer collects their order, record the final payment. The balance will update to zero.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )
        },
        {
            id: "inventory",
            title: "Inventory & Production",
            subtitle: "Materials and workshop tracking",
            icon: <Package size={20} />,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-emerald-500 rounded-full" />
                            Why Inventory Matters
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            When you record your fabrics and buttons here, the system can warn you <strong>before</strong> you run out. It also knows exactly how much money is sitting on your shelves.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-5 p-6 bg-white border rounded-2xl shadow-sm">
                            <h4 className="font-bold flex items-center gap-3 text-xl">
                                <CheckCircle2 size={24} className="text-emerald-500" />
                                Adding Stock
                            </h4>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                When you buy new fabric, use the <strong>Restock</strong> button. Enter how much you bought and the price. The system will update your average cost automatically.
                            </p>
                        </div>
                        <div className="space-y-5 p-6 bg-white border rounded-2xl shadow-sm">
                            <h4 className="font-bold flex items-center gap-3 text-xl">
                                <Scissors size={24} className="text-emerald-500" />
                                Workshop Batches
                            </h4>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Use <strong>Production Batches</strong> to track making multiple pieces at once (like school uniforms). As you mark stages as 'Done', the system tracks progress.
                            </p>
                        </div>
                    </div>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-emerald-500 rounded-full" />
                            Production with Materials
                        </h3>
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                            <h4 className="font-bold text-emerald-900 mb-4 text-lg flex items-center gap-2">
                                <Zap size={20} />
                                NEW: Material Tracking
                            </h4>
                            <p className="text-base text-emerald-800 leading-relaxed mb-4">
                                When creating a production batch, you can now select which materials you'll use. The system will:
                            </p>
                            <ul className="space-y-2 text-emerald-800">
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                                    <span>Automatically reduce inventory stock levels</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                                    <span>Calculate total material cost for the batch</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                                    <span>Warn you if there's not enough stock</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                                    <span>Track material usage history</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 flex gap-5">
                        <Clock className="text-emerald-600 flex-shrink-0" size={32} />
                        <div>
                            <h4 className="font-bold text-emerald-800 mb-2 text-xl">Wait for Completion</h4>
                            <p className="text-base text-emerald-700 leading-relaxed">
                                When you set a Production Batch to <strong>Completed</strong>, the system automatically adds those finished pieces to your inventory so they can be sold!
                            </p>
                            <div className="mt-4 pt-4 border-t border-emerald-200">
                                <h5 className="font-bold text-emerald-800 mb-1">Deleting Batches</h5>
                                <p className="text-sm text-emerald-700">
                                    Admin users can delete batches using the trash icon (🗑️) on the batch card. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "finance",
            title: "Understanding Profits",
            subtitle: "Finance and reporting simplified",
            icon: <DollarSign size={20} />,
            color: "text-amber-500",
            bg: "bg-amber-50",
            content: (
                <div className="space-y-8">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        You don't need to be an accountant. The system does all the calculations to show you if you are making money or losing it.
                    </p>

                    <Card className="bg-slate-50 border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl">Financial Definitions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                                <div>
                                    <h5 className="font-bold text-xl">Revenue</h5>
                                    <p className="text-base text-muted-foreground mt-1">Total money coming in from sales.</p>
                                </div>
                                <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg text-sm">+ PLUS</span>
                            </div>
                            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                                <div>
                                    <h5 className="font-bold text-xl">COGS (Materials & Labour)</h5>
                                    <p className="text-base text-muted-foreground mt-1">How much it cost you to make the items.</p>
                                </div>
                                <span className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-lg text-sm">- MINUS</span>
                            </div>
                            <div className="flex justify-between items-start pt-4">
                                <div>
                                    <h5 className="font-bold text-xl text-primary">Net Profit</h5>
                                    <p className="text-base text-muted-foreground mt-1">The "Steak"—the actual profit you made.</p>
                                </div>
                                <span className="bg-primary text-white font-bold px-5 py-2 rounded-lg text-sm">= EQUALS</span>
                            </div>
                        </CardContent>
                    </Card>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-amber-500 rounded-full" />
                            Reading the Finance Dashboard
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 bg-white border rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <TrendingUp size={20} className="text-green-600" />
                                    </div>
                                    <h5 className="font-bold">Revenue Card</h5>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Shows total sales for the selected period. Green means you're making sales!
                                </p>
                            </div>
                            <div className="p-5 bg-white border rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Package size={20} className="text-red-600" />
                                    </div>
                                    <h5 className="font-bold">Costs Card</h5>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Shows how much you spent on materials and labor. Keep this lower than revenue!
                                </p>
                            </div>
                            <div className="p-5 bg-white border rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Target size={20} className="text-primary" />
                                    </div>
                                    <h5 className="font-bold">Profit Card</h5>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    The most important number! This is what you actually earned after all costs.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="flex gap-5 p-6 bg-white border rounded-2xl shadow-sm">
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-xl h-fit">
                            <Download size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold mb-2 text-xl">Exporting Reports</h4>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Use the <strong>Export</strong> button on the Finance page to download an Excel file you can send to your accountant or bank.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "customers",
            title: "Customer Management",
            subtitle: "Building lasting relationships",
            icon: <Users size={20} />,
            color: "text-pink-500",
            bg: "bg-pink-50",
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-pink-500 rounded-full" />
                            Managing Your Customer Database
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                            Every customer is valuable. The system helps you remember their preferences, track their orders, and build loyalty.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white border rounded-2xl">
                                <h4 className="font-bold text-lg mb-3">Adding New Customers</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-pink-500" />
                                        <span>Save name and phone number (minimum required)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-pink-500" />
                                        <span>Add email for automatic notifications</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-pink-500" />
                                        <span>Record measurements for repeat orders</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl">
                                <h4 className="font-bold text-lg mb-3">Customer History</h4>
                                <p className="text-muted-foreground mb-3">
                                    Click on any customer to see:
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex gap-2">
                                        <ArrowRight size={18} className="mt-0.5 flex-shrink-0 text-pink-500" />
                                        <span>All previous orders</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <ArrowRight size={18} className="mt-0.5 flex-shrink-0 text-pink-500" />
                                        <span>Total amount spent</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <ArrowRight size={18} className="mt-0.5 flex-shrink-0 text-pink-500" />
                                        <span>Favorite garment styles</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="bg-pink-50 p-6 rounded-2xl border border-pink-200">
                        <h4 className="font-bold text-pink-900 mb-3 text-lg flex items-center gap-2">
                            <Bell size={20} />
                            Customer Notifications
                        </h4>
                        <p className="text-pink-800 leading-relaxed">
                            When you update an order status, customers with email addresses will receive automatic notifications. This keeps them informed without you having to make phone calls!
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "reports",
            title: "Reports & Analytics",
            subtitle: "Understanding your business trends",
            icon: <BarChart3 size={20} />,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-indigo-500 rounded-full" />
                            Available Reports
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white border rounded-2xl">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <DollarSign size={20} className="text-indigo-500" />
                                    Financial Reports
                                </h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Revenue by month/year</li>
                                    <li>• Profit margins</li>
                                    <li>• Cost breakdowns</li>
                                    <li>• Outstanding payments</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Package size={20} className="text-indigo-500" />
                                    Inventory Reports
                                </h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Stock levels by material</li>
                                    <li>• Low stock alerts</li>
                                    <li>• Material usage trends</li>
                                    <li>• Inventory value</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Scissors size={20} className="text-indigo-500" />
                                    Production Reports
                                </h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Batches by status</li>
                                    <li>• Average completion time</li>
                                    <li>• Material costs per batch</li>
                                    <li>• Production efficiency</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Users size={20} className="text-indigo-500" />
                                    Customer Reports
                                </h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li>• Top customers by revenue</li>
                                    <li>• Customer retention rate</li>
                                    <li>• Popular garment types</li>
                                    <li>• Average order value</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-indigo-500 rounded-full" />
                            Understanding Trends
                        </h3>
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200">
                            <p className="text-indigo-900 leading-relaxed mb-4">
                                The dashboard shows charts and graphs to help you spot patterns:
                            </p>
                            <ul className="space-y-3 text-indigo-800">
                                <li className="flex gap-3">
                                    <TrendingUp size={18} className="mt-0.5 flex-shrink-0" />
                                    <span><strong>Upward trends</strong> mean your business is growing</span>
                                </li>
                                <li className="flex gap-3">
                                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                    <span><strong>Sudden drops</strong> might mean you need to market more</span>
                                </li>
                                <li className="flex gap-3">
                                    <Target size={18} className="mt-0.5 flex-shrink-0" />
                                    <span><strong>Seasonal patterns</strong> help you plan inventory purchases</span>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            )
        },
        {
            id: "settings",
            title: "Settings Hub",
            subtitle: "One place to manage everything",
            icon: <Settings size={20} />,
            color: "text-cyan-500",
            bg: "bg-cyan-50",
            content: (
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="h-9 w-1 bg-cyan-500 rounded-full" />
                            Everything in One Place
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                            The new <strong>Settings Hub</strong> brings all your workshop configurations into one simple dashboard. You no longer need to look for settings in different pages.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Building2 size={20} className="text-cyan-600" />
                                    1. General Settings
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Update your business name and manage system preferences. This is where you'll soon be able to change your workshop's logo and contact details.
                                </p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <DollarSign size={20} className="text-amber-600" />
                                    2. Financial Rules
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Control your <strong>Profit Margins</strong> and <strong>Tax Rates</strong>. This affects how the system suggests prices for your customers.
                                </p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Scissors size={20} className="text-primary" />
                                    3. Workshop & Labour
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Manage your <strong>Garment Types</strong> and <strong>Labour Rates</strong>. Adding new types here makes them available when creating orders.
                                </p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <User size={20} className="text-blue-600" />
                                    4. Account & Security
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Update your personal profile, change your password, and manage your account status.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-200">
                        <h4 className="font-bold text-cyan-900 mb-3 text-lg flex items-center gap-2">
                            <Lightbulb size={20} />
                            Efficient Workshop Pro Tip
                        </h4>
                        <p className="text-cyan-800 leading-relaxed">
                            Review your <strong>Labour Rates</strong> every few months. If fabric prices or electricity costs go up, adjusting your rates in Settings will immediately help protect your profit margins!
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "support",
            title: "Help & Troubleshooting",
            subtitle: "What to do if you get stuck",
            icon: <HelpCircle size={20} />,
            color: "text-slate-500",
            bg: "bg-slate-50",
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="font-bold mb-6 text-2xl">Common Questions</h4>
                        <div className="space-y-5">
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <p className="font-bold text-lg mb-2 text-primary">"The suggested price seems too low."</p>
                                <p className="text-base text-muted-foreground leading-relaxed">Go to <strong>Settings</strong> and increase your profit margin or hourly rate. The system will recalculate everything instantly.</p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <p className="font-bold text-lg mb-2 text-primary">"I made a mistake on an order."</p>
                                <p className="text-base text-muted-foreground leading-relaxed">Click the three dots (⋮) next to the order and select <strong>Edit</strong>. You can fix any detail at any time.</p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <p className="font-bold text-lg mb-2 text-primary">"I can't find a material in the list."</p>
                                <p className="text-base text-muted-foreground leading-relaxed">You must add the material to the <strong>Inventory</strong> page first before you can use it in an order.</p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <p className="font-bold text-lg mb-2 text-primary">"The system is running slow."</p>
                                <p className="text-base text-muted-foreground leading-relaxed">Try refreshing your browser (press F5). If using mobile data, switch to WiFi for better performance. Close other browser tabs you're not using.</p>
                            </div>
                            <div className="p-6 bg-white border rounded-2xl shadow-sm">
                                <p className="font-bold text-lg mb-2 text-primary">"I accidentally deleted something."</p>
                                <p className="text-base text-muted-foreground leading-relaxed">Contact support immediately. Some deletions can be recovered if reported quickly. This is why we recommend only admins have delete permissions.</p>
                            </div>
                        </div>
                    </section>

                    <div className="p-8 bg-primary rounded-3xl text-white text-center shadow-2xl">
                        <h4 className="text-2xl font-bold mb-3">Still Need Help?</h4>
                        <p className="text-base opacity-90 mb-8 max-w-md mx-auto">Our support team is available during business hours via WhatsApp or email.</p>
                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <a href="tel:[SUPPORT-NUMBER]" className="bg-white/20 hover:bg-white/30 transition px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg">
                                <HelpCircle size={24} />
                                Call Support
                            </a>
                            <a href="mailto:[SUPPORT-EMAIL]" className="bg-white/20 hover:bg-white/30 transition px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg">
                                <FileText size={24} />
                                Email Support
                            </a>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentSection = sections.find(s => s.id === activeSection);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-primary rounded-2xl text-white">
                                <BookOpen size={32} />
                            </div>
                            <span>User Manual</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg font-medium">A complete guide to Gloria's Daughter ERP</p>
                    </div>
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        size="lg"
                        className="border-primary text-primary hover:bg-primary/5 font-bold px-8 rounded-2xl flex items-center gap-3 h-14 text-lg"
                    >
                        <Download size={24} />
                        Export to PDF
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden mb-6">
                    <Button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        variant="outline"
                        className="w-full justify-between text-lg font-medium py-7 rounded-2xl"
                    >
                        <span className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", currentSection.bg, currentSection.color)}>
                                {React.cloneElement(currentSection.icon, { size: 20 })}
                            </div>
                            {currentSection.title}
                        </span>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className={cn(
                        "flex-shrink-0 w-full lg:w-80",
                        mobileMenuOpen ? "block" : "hidden lg:block"
                    )}>
                        <nav className="bg-white border rounded-3xl p-4 shadow-lg sticky top-6">
                            <div className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-5 py-5 rounded-2xl transition-all duration-200 text-left",
                                            activeSection === section.id
                                                ? "bg-primary text-white shadow-md font-bold"
                                                : "hover:bg-slate-100 text-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-xl transition-colors",
                                            activeSection === section.id ? "bg-white/20" : "bg-slate-100"
                                        )}>
                                            {React.cloneElement(section.icon, {
                                                size: 24,
                                                className: activeSection === section.id ? "text-white" : section.color.replace("text-", "text-")
                                            })}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-lg">{section.title}</div>
                                            <div className="text-sm opacity-70 mt-1">{section.subtitle}</div>
                                        </div>
                                        {activeSection === section.id && <ChevronRight size={20} />}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                <h5 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Road Test Period</h5>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    This manual is updated weekly based on your feedback. Have a suggestion? Let us know!
                                </p>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.article
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 lg:p-12 shadow-xl"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
                                    <div className={cn("p-6 rounded-3xl", currentSection.bg, currentSection.color)}>
                                        {React.cloneElement(currentSection.icon, { size: 48 })}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">{currentSection.title}</h2>
                                        <p className="text-xl text-slate-600 mt-2 font-medium">{currentSection.subtitle}</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 -mx-8 sm:-mx-10 lg:-mx-12 px-8 sm:px-10 lg:px-12 py-8">
                                    {currentSection.content}
                                </div>
                            </motion.article>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Manual;