import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Award,
  Stethoscope,
  Users,
  ShieldCheck,
  BarChart3,
  Activity,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

const patientNav = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Book Appointment", path: "/book-appointment", icon: Calendar },
  { label: "Health Records", path: "/dashboard/health", icon: Activity },
  { label: "Prescriptions", path: "/dashboard/prescriptions", icon: FileText },
  { label: "Certificates", path: "/dashboard/certificates", icon: Award },
];

const doctorNav = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Consultation", path: "/dashboard/consultation", icon: Stethoscope },
  { label: "Patient Records", path: "/dashboard/patients", icon: Users },
];

const adminNav = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Doctor Approvals", path: "/admin/approvals", icon: ShieldCheck },
  { label: "User Management", path: "/admin/users", icon: Users },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems =
    user?.role === "admin"
      ? adminNav
      : user?.role === "doctor"
      ? doctorNav
      : patientNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "doctor"
      ? "Doctor"
      : "Patient";

  const roleBadgeColor =
    user?.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : user?.role === "doctor"
      ? "bg-teal-100 text-teal-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="min-h-screen bg-gray-50 flex" id="dashboard-layout">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">32</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-sm leading-tight">
                  Dr.32 Teeth
                </h1>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Healthcare Center
                </p>
              </div>
            </div>
            <button
              className="md:hidden p-1 hover:bg-gray-100 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4">
          <div
            className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => navigate("/profile")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.role === "doctor" ? "Dr. " : ""}
                  {user?.firstName || ""} {user?.lastName || ""}
                </p>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadgeColor}`}
                >
                  {roleLabel}
                </span>
              </div>
              <ChevronRight size={14} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-teal-50 text-teal-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-teal-600" : "text-gray-400"}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            id="logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            id="sidebar-toggle"
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800">
              {navItems.find((n) => n.path === location.pathname)?.label ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition"
            >
              <User size={16} className="text-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
