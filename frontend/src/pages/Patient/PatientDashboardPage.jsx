import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  Calendar,
  Clock,
  FileText,
  Award,
  Activity,
  Plus,
  ChevronRight,
  Hash,
} from "lucide-react";

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/appointments/my-appointments");
        const apps = res.data.appointments;
        setAppointments(apps);

        const today = new Date().toISOString().split("T")[0];
        setStats({
          total: apps.length,
          upcoming: apps.filter(
            (a) => a.status === "scheduled" && a.appointmentDate >= today
          ).length,
          completed: apps.filter((a) => a.status === "completed").length,
        });
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcomingApps = appointments
    .filter((a) => a.status === "scheduled" && a.appointmentDate >= today)
    .slice(0, 5);
  const recentApps = appointments
    .filter((a) => a.status === "completed")
    .slice(0, 3);

  const statusColor = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName || "there"}! 👋
        </h1>
        <p className="mt-1 text-teal-100 text-sm">
          Here's an overview of your health journey at Dr.32 Teeth.
        </p>
        <button
          id="quick-book-appointment"
          onClick={() => navigate("/book-appointment")}
          className="mt-4 inline-flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition shadow"
        >
          <Plus size={16} />
          Book Appointment
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Visits</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-teal-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.upcoming}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Health Records", icon: Activity, path: "/dashboard/health", color: "text-teal-600 bg-teal-50" },
          { label: "Prescriptions", icon: FileText, path: "/dashboard/prescriptions", color: "text-indigo-600 bg-indigo-50" },
          { label: "Certificates", icon: Award, path: "/dashboard/certificates", color: "text-amber-600 bg-amber-50" },
          { label: "Book Visit", icon: Plus, path: "/book-appointment", color: "text-emerald-600 bg-emerald-50" },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
              <action.icon size={20} />
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
            <button
              onClick={() => navigate("/book-appointment")}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              Book New <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-5">
            {upcomingApps.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No upcoming appointments</p>
                <button
                  onClick={() => navigate("/book-appointment")}
                  className="mt-3 text-sm text-teal-600 hover:underline font-medium"
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-teal-600 font-medium">
                        {new Date(app.appointmentDate + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold text-teal-700 leading-none">
                        {new Date(app.appointmentDate + "T00:00:00").getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {app.startTime} {app.doctor?.specialization ? `• ${app.doctor.specialization}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.tokenNumber && (
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">
                          <Hash size={10} /> {app.tokenNumber}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusColor[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent History</h2>
            <button
              onClick={() => navigate("/dashboard/health")}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-5">
            {recentApps.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">
                        Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                      </p>
                      <span className="text-xs text-gray-400">{app.appointmentDate}</span>
                    </div>
                    {app.reason && (
                      <p className="text-xs text-gray-500 mt-1 italic">{app.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
