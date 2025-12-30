import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Scissors,
  Shield,
  DollarSign,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { profile } = useAuthStore();

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
      label: "User Management",
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile?.role || "employee")
  );

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-card border-r border-border flex flex-col"
    >
      {/* Fixed Header - Logo Section */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Scissors className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-primary tracking-tight">GLORIA'S</h1>
            <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest -mt-1">Daughter</p>
          </div>
        </div>
      </div>

      {/* Scrollable Menu Section */}
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )
                }
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  "text-primary" // Icons always in primary color as requested
                )} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Fixed Footer - User Info Section */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card">
        <NavLink
          to="/manual"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-2 rounded-md mb-4 transition-all text-xs font-semibold",
              isActive
                ? "bg-primary text-white"
                : "bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20"
            )
          }
        >
          <HelpCircle size={14} />
          <span>HELP & MANUAL</span>
        </NavLink>

        <div className="bg-muted/30 rounded-lg p-3 mb-3 border border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Access Level
          </p>
          <p className="text-sm font-semibold text-foreground capitalize">
            {profile?.role || "User"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center font-medium">
          GLORIA'S DAUGHTER ERP
        </p>
      </div>
    </motion.aside>
  );
}

