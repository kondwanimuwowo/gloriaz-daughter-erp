import React, { useState, useEffect } from "react";
import {
    BookOpen,
    FileText,
    Package,
    Scissors,
    DollarSign,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ---------------------------------- */
/* Mobile Collapse Helper */
/* ---------------------------------- */
const MobileCollapse = ({ title, icon, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border rounded-xl mb-4">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4"
            >
                <div className="flex items-center gap-2 font-bold">
                    {icon}
                    {title}
                </div>
                <ChevronRight
                    size={16}
                    className={cn("transition-transform", open && "rotate-90")}
                />
            </button>
            {open && <div className="p-4 pt-0">{children}</div>}
        </div>
    );
};

const Manual = () => {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const sections = [
        {
            id: "getting-started",
            title: "Getting Started",
            subtitle: "Your first steps in the ERP",
            icon: <LayoutDashboard size={20} />,
            color: "text-blue-500",
            bg: "bg-blue-50",
            content: (
                <>
                    <p className="text-sm lg:text-base text-muted-foreground mb-6">
                        Welcome to <strong>Gloria's Daughter ERP</strong>. This system helps
                        you manage orders, materials, and profits without technical skills.
                    </p>

                    <MobileCollapse
                        title="Logging In"
                        icon={<MousePointer2 size={18} />}
                    >
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Open your browser (Chrome recommended)</li>
                            <li>Enter your email and password</li>
                            <li>Click Sign In</li>
                        </ul>
                    </MobileCollapse>

                    <MobileCollapse
                        title="The Dashboard"
                        icon={<LayoutDashboard size={18} />}
                    >
                        <p className="text-sm text-muted-foreground">
                            Your home screen showing active orders and low stock alerts.
                        </p>
                    </MobileCollapse>

                    <div className="flex gap-3 p-4 bg-primary/5 rounded-xl">
                        <Lightbulb className="text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Bookmark this page for quick access every morning.
                        </p>
                    </div>
                </>
            ),
        },
        {
            id: "orders",
            title: "Managing Orders",
            subtitle: "From enquiry to delivery",
            icon: <ShoppingCart size={20} />,
            color: "text-purple-500",
            bg: "bg-purple-50",
            content: (
                <>
                    <MobileCollapse
                        title="How to Create a New Order"
                        icon={<ShoppingCart size={18} />}
                    >
                        {[
                            "Choose Custom or Standard order",
                            "Select or add customer",
                            "Enter garment requirements",
                            "Select materials",
                            "Confirm pricing and deposit",
                        ].map((step, i) => (
                            <div key={i} className="flex gap-3 mb-3">
                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                    {i + 1}
                                </div>
                                <p className="text-sm text-muted-foreground">{step}</p>
                            </div>
                        ))}
                    </MobileCollapse>

                    <div className="p-4 bg-slate-900 rounded-2xl text-white">
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                            <AlertCircle size={16} />
                            Always Update Status
                        </h4>
                        <p className="text-sm text-slate-400">
                            Keeping order status updated ensures correct timelines and alerts.
                        </p>
                    </div>
                </>
            ),
        },
        {
            id: "inventory",
            title: "Inventory & Production",
            subtitle: "Materials and workshop tracking",
            icon: <Package size={20} />,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            content: (
                <>
                    <MobileCollapse
                        title="Adding Stock"
                        icon={<CheckCircle2 size={18} />}
                    >
                        <p className="text-sm text-muted-foreground">
                            Use Restock when buying new materials to keep costs accurate.
                        </p>
                    </MobileCollapse>

                    <MobileCollapse
                        title="Workshop Batches"
                        icon={<Scissors size={18} />}
                    >
                        <p className="text-sm text-muted-foreground">
                            Track progress when producing items in bulk.
                        </p>
                    </MobileCollapse>

                    <div className="flex gap-3 p-4 bg-emerald-50 rounded-xl">
                        <Clock className="text-emerald-600" />
                        <p className="text-sm text-emerald-700">
                            Completed batches automatically update your inventory.
                        </p>
                    </div>
                </>
            ),
        },
        {
            id: "finance",
            title: "Understanding Profits",
            subtitle: "Finance and reporting simplified",
            icon: <DollarSign size={20} />,
            color: "text-amber-500",
            bg: "bg-amber-50",
            content: (
                <>
                    <Card className="border-none bg-slate-50 mb-4">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Simple Profit Formula
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>Revenue minus costs equals profit.</p>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 p-4 border rounded-xl">
                        <Download />
                        <p className="text-sm text-muted-foreground">
                            Export reports to Excel anytime.
                        </p>
                    </div>
                </>
            ),
        },
        {
            id: "support",
            title: "Help & Troubleshooting",
            subtitle: "What to do if you get stuck",
            icon: <HelpCircle size={20} />,
            color: "text-slate-500",
            bg: "bg-slate-50",
            content: (
                <>
                    <MobileCollapse
                        title="Common Questions"
                        icon={<HelpCircle size={18} />}
                    >
                        <p className="text-sm text-muted-foreground">
                            You can edit orders, adjust pricing, and add missing materials at
                            any time.
                        </p>
                    </MobileCollapse>

                    <div className="p-5 bg-primary rounded-2xl text-white text-center">
                        <h4 className="font-bold mb-2">Still need help?</h4>
                        <p className="text-sm">Contact support via WhatsApp or email.</p>
                    </div>
                </>
            ),
        },
    ];

    const currentSection = sections.find(s => s.id === activeSection);

    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">

            {/* Mobile Task Entry */}
            {isMobile && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button onClick={() => setActiveSection("orders")} className="h-24">
                        <ShoppingCart />
                        Create Order
                    </Button>
                    <Button onClick={() => setActiveSection("inventory")} className="h-24">
                        <Package />
                        Inventory
                    </Button>
                    <Button onClick={() => setActiveSection("finance")} className="h-24">
                        <DollarSign />
                        Profit
                    </Button>
                    <Button onClick={() => setActiveSection("support")} className="h-24">
                        <HelpCircle />
                        Help
                    </Button>
                </div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl border p-4 lg:p-8"
                >
                    <h2 className="text-xl lg:text-3xl font-bold mb-2">
                        {currentSection.title}
                    </h2>
                    <p className="text-sm lg:text-base text-muted-foreground mb-6">
                        {currentSection.subtitle}
                    </p>

                    {currentSection.content}
                </motion.div>
            </AnimatePresence>

            {/* Mobile Bottom Sheet Navigation */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:hidden">
                <Button onClick={() => setMobileNavOpen(true)} className="rounded-full">
                    <BookOpen size={18} />
                    Sections
                </Button>
            </div>

            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <DialogContent className="bottom-0 top-auto rounded-t-3xl">
                    <div className="space-y-2">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    setMobileNavOpen(false);
                                }}
                                className="w-full flex gap-3 p-3 border rounded-xl text-left"
                            >
                                {section.icon}
                                {section.title}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Manual;
