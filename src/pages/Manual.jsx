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
    LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Manual = () => {
    const [activeSection, setActiveSection] = useState("getting-started");

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-5 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <MousePointer2 size={18} className="text-primary" />
                                1. Logging In
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2"><ArrowRight size={14} className="mt-1 flex-shrink-0" /> Open your browser (Chrome is best).</li>
                                <li className="flex gap-2"><ArrowRight size={14} className="mt-1 flex-shrink-0" /> Enter your email and password.</li>
                                <li className="flex gap-2"><ArrowRight size={14} className="mt-1 flex-shrink-0" /> Click <strong>Sign In</strong>.</li>
                            </ul>
                        </div>
                        <div className="p-5 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <LayoutDashboard size={18} className="text-primary" />
                                2. The Dashboard
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This is your "Home" screen. It shows you how many orders are active and which fabrics are running low. Use the <strong>Quick Links</strong> to jump straight to work.
                            </p>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
                            <Lightbulb className="text-primary" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-primary mb-1">Practical Tip</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
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
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <div className="h-8 w-1 bg-primary rounded-full" />
                            How to Create a New Order
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: "Start", text: "Click 'Create Order' and choose 'Custom' for bespoke items or 'Standard' for items you already have in stock." },
                                { title: "Customer", text: "Select an existing customer or click '+ Add New' to quickly save their name and phone number." },
                                { title: "Requirements", text: "Select the garment type (e.g., Chitenge Dress) and describe what the customer wants." },
                                { title: "Materials", text: "Choose the fabrics and trims needed. The system will automatically calculate the cost for you." },
                                { title: "Pricing & Deposit", text: "Review the suggested price, set your final price, and record the deposit paid." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="pt-2">
                                        <h4 className="font-bold text-slate-900">{step.title}</h4>
                                        <p className="text-sm text-muted-foreground">{step.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white">
                        <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                            <AlertCircle size={20} />
                            Critical Workflow Rule
                        </h4>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            Always update the <strong>Order Status</strong> as you work. This keeps the customer timeline accurate and sends notifications to the team.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Enquiry', 'Measurements', 'Production', 'Fitting', 'Completed'].map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-300">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
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
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                            Why Inventory Matters
                        </h3>
                        <p className="text-muted-foreground">
                            When you record your fabrics and buttons here, the system can warn you <strong>before</strong> you run out. It also knows exactly how much money is sitting on your shelves.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-bold flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-emerald-500" />
                                Adding Stock
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                When you buy new fabric, use the <strong>Restock</strong> button. Enter how much you bought and the price. The system will update your average cost automatically.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold flex items-center gap-2">
                                <Scissors size={18} className="text-emerald-500" />
                                Workshop Batches
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Use <strong>Production Batches</strong> to track making multiple pieces at once (like school uniforms). As you mark stages as 'Done', the system tracks progress.
                            </p>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex gap-4">
                        <Clock className="text-emerald-600 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-emerald-800 mb-1">Wait for Completion</h4>
                            <p className="text-sm text-emerald-700 leading-relaxed">
                                When you set a Production Batch to <strong>Completed</strong>, the system automatically adds those finished pieces to your inventory so they can be sold!
                            </p>
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
                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        You don't need to be an accountant. The system does all the calculations to show you if you are making money or losing it.
                    </p>

                    <Card className="bg-slate-50 border-none">
                        <CardHeader>
                            <CardTitle className="text-lg">Financial Definitions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                                <div>
                                    <h5 className="font-bold">Revenue</h5>
                                    <p className="text-xs text-muted-foreground">Total money coming in from sales.</p>
                                </div>
                                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">+ PLUS</span>
                            </div>
                            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                                <div>
                                    <h5 className="font-bold">COGS (Materials & Labour)</h5>
                                    <p className="text-xs text-muted-foreground">How much it cost you to make the items.</p>
                                </div>
                                <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">- MINUS</span>
                            </div>
                            <div className="flex justify-between items-start pt-2">
                                <div>
                                    <h5 className="font-bold text-primary">Net Profit</h5>
                                    <p className="text-xs text-muted-foreground">The "Steak"—the actual profit you made.</p>
                                </div>
                                <span className="bg-primary text-white font-bold px-3 py-1 rounded text-xs">= EQUALS</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4 p-5 bg-white border rounded-2xl shadow-sm">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl h-fit">
                            <Download size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">Exporting Reports</h4>
                            <p className="text-sm text-muted-foreground">
                                Use the <strong>Export</strong> button on the Finance page to download an Excel file you can send to your accountant or bank.
                            </p>
                        </div>
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
                <div className="space-y-6">
                    <section>
                        <h4 className="font-bold mb-4">Common Questions</h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-white border rounded-xl">
                                <p className="font-bold text-sm mb-1 text-primary">"The suggested price seems too low."</p>
                                <p className="text-sm text-muted-foreground">Go to <strong>Settings</strong> and increase your profit margin or hourly rate. The system will recalculate everything instantly.</p>
                            </div>
                            <div className="p-4 bg-white border rounded-xl">
                                <p className="font-bold text-sm mb-1 text-primary">"I made a mistake on an order."</p>
                                <p className="text-sm text-muted-foreground">Click the three dots (⋮) next to the order and select <strong>Edit</strong>. You can fix any detail at any time.</p>
                            </div>
                            <div className="p-4 bg-white border rounded-xl">
                                <p className="font-bold text-sm mb-1 text-primary">"I can't find a material in the list."</p>
                                <p className="text-sm text-muted-foreground">You must add the material to the <strong>Inventory</strong> page first before you can use it in an order.</p>
                            </div>
                        </div>
                    </section>

                    <div className="p-6 bg-primary rounded-3xl text-white text-center shadow-lg shadow-primary/30">
                        <h4 className="text-xl font-bold mb-2">Still Need Help?</h4>
                        <p className="text-sm opacity-90 mb-6">Our support team is available during business hours via WhatsApp.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <div className="bg-white/20 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <HelpCircle size={18} />
                                [SUPPORT-NUMBER]
                            </div>
                            <div className="bg-white/20 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <FileText size={18} />
                                [SUPPORT-EMAIL]
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentSection = sections.find(s => s.id === activeSection);

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-lg text-white">
                            <BookOpen size={24} />
                        </div>
                        How to use Gloria's Daughter ERP
                    </h1>
                    <p className="text-muted-foreground mt-1 px-11 font-medium">A step-by-step guide for non-technical users</p>
                </div>
                <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="no-print border-primary text-primary hover:bg-primary/5 font-bold px-6 rounded-xl flex items-center gap-2 h-12"
                >
                    <Download size={18} />
                    Export to PDF
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden min-h-0">
                {/* Fixed Navigation Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0 no-print">
                    <div className="bg-slate-50 border rounded-3xl p-3 h-fit">
                        <div className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left",
                                        activeSection === section.id
                                            ? "bg-white shadow-md text-primary font-bold scale-[1.02]"
                                            : "text-muted-foreground hover:bg-white/60 hover:text-slate-900"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors",
                                        activeSection === section.id ? section.bg + " " + section.color : "bg-slate-200/50 text-slate-400"
                                    )}>
                                        {section.icon}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{section.title}</div>
                                        <div className="text-[10px] font-medium opacity-60 leading-tight block lg:hidden xl:block">{section.subtitle}</div>
                                    </div>
                                    {activeSection === section.id && (
                                        <ChevronRight size={14} className="text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Road Test Period</h5>
                            <p className="text-[11px] text-slate-600 leading-normal">
                                This manual is updated weekly based on your feedback. Have a suggestion? Let us know!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 overflow-y-auto pr-2 custom-scrollbar no-print">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-full"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={cn("p-4 rounded-2xl", currentSection.bg, currentSection.color)}>
                                    {React.cloneElement(currentSection.icon, { size: 32 })}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">{currentSection.title}</h2>
                                    <p className="text-slate-500 font-medium">{currentSection.subtitle}</p>
                                </div>
                            </div>

                            <hr className="border-slate-100 mb-8" />

                            {currentSection.content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Print Version (Always visible for window.print()) */}
                <div className="hidden print:block print:w-full">
                    {sections.map(section => (
                        <div key={section.id} className="mb-12 page-break-after-always">
                            <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-6">{section.title}</h2>
                            {section.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print\\:block { display: block !important; }
                    body { background: white !important; }
                    main { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

// Generic ShoppingCart icon as fallback since Lucide import might need adjustment based on project
const ShoppingCart = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
);

export default Manual;
