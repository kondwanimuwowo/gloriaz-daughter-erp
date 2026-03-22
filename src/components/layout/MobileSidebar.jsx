import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Shield,
  DollarSign,
  BarChart3,
  X,
  Scissors,
  HelpCircle,
  Shirt,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/useAuthStore";
import { inquiryService } from "../../services/inquiryService";
import { cn } from "@/lib/utils";

export default function MobileSidebar({ isOpen, onClose }) {
  const { profile } = useAuthStore();

  const { data: newInquiryCount = 0 } = useQuery({
    queryKey: ["new-inquiry-count"],
    queryFn: () => inquiryService.getNewInquiriesCount(),
    refetchInterval: 30000,
  });

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/inventory",
      icon: Package,
      label: "Inventory",
      roles: ["admin", "manager"],
    },
    {
      path: "/products",
      icon: Shirt,
      label: "Products",
      roles: ["admin", "manager"],
    },
    {
      path: "/orders",
      icon: ShoppingCart,
      label: "Orders",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/production",
      icon: Scissors,
      label: "Production",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/employees",
      icon: Users,
      label: "Employees",
      roles: ["admin", "manager"],
    },
    {
      path: "/customers",
      icon: UserCircle,
      label: "Customers",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/enquiries",
      icon: MessageSquare,
      label: "Enquiries",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/finance",
      icon: DollarSign,
      label: "Finance",
      roles: ["admin", "manager"],
    },
    {
      path: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      roles: ["admin", "manager"],
    },
    {
      path: "/users",
      icon: Shield,
      label: "Users",
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile?.role || "employee")
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 h-full w-60 bg-card shadow-2xl z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Scissors className="text-primary" size={16} />
                </div>
                <div>
                  <h1 className="font-bold text-sm text-primary tracking-tight leading-none">GLORIA'S</h1>
                  <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">Daughter</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2 px-2 overflow-y-auto">
              <ul className="space-y-0.5">
                {filteredNavItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 text-xs font-medium",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )
                      }
                    >
                      <item.icon size={15} className="text-primary shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.path === "/enquiries" && newInquiryCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                          {newInquiryCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-border">
              <NavLink
                to="/manual"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md mb-2 transition-all text-[10px] font-semibold",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20"
                  )
                }
              >
                <HelpCircle size={12} />
                <span>HELP & MANUAL</span>
              </NavLink>

              <div className="bg-muted/30 rounded-md p-2 border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Access Level
                </p>
                <p className="text-xs font-semibold text-foreground capitalize">
                  {profile?.role || "User"}
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

