import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Menu,
  Package,
  ShoppingCart,
  Users,
  X,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { NotificationBell } from "../notifications/NotificationBell";
import { useConnectionSync } from "../../hooks/useConnectionSync";
import {
  Wifi,
  WifiOff,
  RotateCw,
  RefreshCw,
  Database
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

const RealtimeStatus = () => {
  const { realtimeStatus, isOnline } = useConnectionSync();
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = () => {
    setSyncing(true);
    window.dispatchEvent(new CustomEvent('force-app-sync'));
    setTimeout(() => setSyncing(false), 1000);
  };

  const getStatusColor = () => {
    if (!isOnline) return "text-destructive bg-destructive/10";
    if (realtimeStatus === 'connected') return "text-emerald-500 bg-emerald-50";
    if (realtimeStatus === 'error') return "text-orange-500 bg-orange-50";
    return "text-muted-foreground bg-muted";
  };

  const getStatusLabel = () => {
    if (!isOnline) return "Offline";
    if (realtimeStatus === 'connected') return "Live";
    if (realtimeStatus === 'error') return "Connection Error";
    return "Connecting...";
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleManualSync}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border border-transparent hover:border-current/20 ${getStatusColor()}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'animate-pulse bg-current' : 'bg-current'}`} />
              <span className="hidden sm:inline">{getStatusLabel()}</span>
              {syncing ? (
                <RotateCw size={12} className="animate-spin ml-1" />
              ) : (
                <RefreshCw size={12} className="ml-1 opacity-50" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOnline ? `Supabase Real-time: ${realtimeStatus}` : 'No internet connection'}</p>
            <p className="text-[10px] opacity-70">Click to force data synchronization</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function Navbar({ onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    orders: [],
    customers: [],
    employees: [],
    materials: [],
  });
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults({ orders: [], customers: [], employees: [], materials: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("navbar-search-input");
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const performSearch = async (query) => {
    setSearching(true);
    try {
      const searchTerm = `%${query}%`;

      // Search orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, status, customers(name)")
        .or(`order_number.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      // Search customers
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name, phone, email")
        .or(`name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(5);

      // Search employees
      const { data: employees } = await supabase
        .from("employees")
        .select("id, name, role, email")
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(5);

      // Search materials
      const { data: materials } = await supabase
        .from("materials")
        .select("id, name, category, stock_quantity")
        .or(`name.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .limit(5);

      setSearchResults({
        orders: orders || [],
        customers: customers || [],
        employees: employees || [],
        materials: materials || [],
      });
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleNavigate = (type, item) => {
    setSearchQuery("");
    setShowResults(false);
    setShowSearch(false);

    switch (type) {
      case "order":
        navigate("/orders", { state: { openOrderId: item.id } });
        break;
      case "customer":
        navigate("/customers", { state: { openCustomerId: item.id } });
        break;
      case "employee":
        navigate("/employees", { state: { openEmployeeId: item.id } });
        break;
      case "material":
        navigate("/inventory", { state: { openMaterialId: item.id } });
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({ orders: [], customers: [], employees: [], materials: [] });
    setShowResults(false);
  };

  const getTotalResults = () => {
    return (
      searchResults.orders.length +
      searchResults.customers.length +
      searchResults.employees.length +
      searchResults.materials.length
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      manager: "bg-blue-100 text-blue-700",
      employee: "bg-green-100 text-green-700",
    };
    return colors[role] || "bg-accent text-accent-foreground";
  };

  return (
    <header className="bg-background border-b border-border px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Menu & Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg" ref={searchRef}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                size={20}
              />
              <input
                type="text"
                id="navbar-search-input"
                autoComplete="off"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                className="w-full pl-10 pr-16 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
                {searchQuery ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); clearSearch(); }}
                    className="pointer-events-auto p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded border border-border/50">
                    <span className="text-[10px] font-medium text-muted-foreground">⌘</span>
                    <span className="text-[10px] font-medium text-muted-foreground">K</span>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && getTotalResults() > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto z-50 p-2 space-y-2"
                  >
                    {!searchQuery && (
                      <div className="px-2 py-3">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 mb-2">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => { navigate("/orders"); setShowResults(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 border border-border/40 transition-colors text-left group">
                            <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"><ShoppingCart size={16} /></div>
                            <div>
                              <p className="text-sm font-semibold">New Order</p>
                              <p className="text-[10px] text-muted-foreground">Start custom garment</p>
                            </div>
                          </button>
                          <button onClick={() => { navigate("/inventory"); setShowResults(false); }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 border border-border/40 transition-colors text-left group">
                            <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Package size={16} /></div>
                            <div>
                              <p className="text-sm font-semibold">Inventory</p>
                              <p className="text-[10px] text-muted-foreground">Check stock levels</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Orders */}
                    {searchResults.orders.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-muted/50 border-b border-border">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <ShoppingCart size={14} /> ORDERS
                          </p>
                        </div>
                        {searchResults.orders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => handleNavigate("order", order)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                          >
                            <p className="font-medium text-foreground">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customers?.name || "No customer"} • {order.status}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-muted/50 border-b border-border">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <Users size={14} /> CUSTOMERS
                          </p>
                        </div>
                        {searchResults.customers.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleNavigate("customer", customer)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                          >
                            <p className="font-medium text-foreground">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Employees */}
                    {searchResults.employees.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-muted/50 border-b border-border">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <User size={14} /> EMPLOYEES
                          </p>
                        </div>
                        {searchResults.employees.map((employee) => (
                          <button
                            key={employee.id}
                            onClick={() => handleNavigate("employee", employee)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                          >
                            <p className="font-medium text-foreground">{employee.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{employee.role}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Materials */}
                    {searchResults.materials.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-muted/50 border-b border-border">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                            <Package size={14} /> MATERIALS
                          </p>
                        </div>
                        {searchResults.materials.map((material) => (
                          <button
                            key={material.id}
                            onClick={() => handleNavigate("material", material)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                          >
                            <p className="font-medium text-foreground">{material.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {material.category} • Stock: {material.stock_quantity}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search - Mobile Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Search size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Real-time Status Indicator */}
          <RealtimeStatus />

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 md:gap-3 p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm md:text-base">
                {profile?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "U"}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-foreground">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.role || "employee"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className="text-muted-foreground hidden md:block"
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                >
                  {/* Profile Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {profile?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {profile?.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile?.role)}`}
                    >
                      {profile?.role === "admin" && <Shield size={12} />}
                      {profile?.role?.charAt(0).toUpperCase() +
                        profile?.role?.slice(1)}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </button>

                    {profile?.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/users");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Shield size={18} />
                        <span>User Management</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background text-foreground"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {showResults && getTotalResults() > 0 && (
              <div className="mt-2 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {/* Same results structure as desktop but in mobile view */}
                {searchResults.orders.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted/50 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground">ORDERS</p>
                    </div>
                    {searchResults.orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleNavigate("order", order)}
                        className="w-full px-3 py-2 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
                      >
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{order.customers?.name}</p>
                      </button>
                    ))}
                  </div>
                )}
                {/* Add other categories similarly */}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

