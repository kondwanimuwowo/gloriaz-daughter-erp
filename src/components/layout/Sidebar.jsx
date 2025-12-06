import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Scissors,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";

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
      path: "/users",
      icon: Shield,
      label: "User Management",
      roles: ["admin"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(profile?.role || "employee")
  );

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-full bg-white border-r border-gray-200 flex flex-col"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Scissors className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">
              Gloriaz Daughter
            </h1>
            <p className="text-xs text-gray-500">Fashion ERP</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-primary-50 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-primary-900 mb-1">
            Logged in as
          </p>
          <p className="text-sm font-medium text-primary-700 capitalize">
            {profile?.role || "User"}
          </p>
        </div>
        <p className="text-xs text-gray-500 text-center">
          v1.0.0 - Gloriaz Daughter
        </p>
      </div>
    </motion.aside>
  );
}
