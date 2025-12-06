import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  Scissors,
  Shield,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";

export default function MobileSidebar({ isOpen, onClose }) {
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {filteredNavItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
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

            {/* Footer */}
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
        </>
      )}
    </AnimatePresence>
  );
}
