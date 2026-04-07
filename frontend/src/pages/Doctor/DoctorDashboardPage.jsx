import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  TrendingUp,
  Hash,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayApps, setTodayApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, statsRes] = await Promise.all([
          api.get("/appointments/today"),
          api.get("/consultations/doctor-stats"),
        ]);
        setTodayApps(appsRes.data.appointments);
        setStats(statsRes.data.stats);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartConsultation = (appointmentId) => {
    navigate(`/dashboard/consultation/${appointmentId}`);
  };

  const statusColor = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusIcon = {
    scheduled: Clock,
    in_progress: Play,
    completed: CheckCircle,
    cancelled: AlertCircle,
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

  if (user && !user.isApproved) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Pending Approval</h2>
          <p className="text-gray-600 text-sm">
            Your doctor account is currently under review. You'll be able to access the dashboard once an administrator approves your registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, Dr. {user?.firstName}! 🩺
        </h1>
        <p className="mt-1 text-teal-100 text-sm">
          You have <span className="font-bold text-white">{todayApps.filter((a) => a.status === "scheduled").length}</span> patients waiting today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Today</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.todayAppointments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completedToday || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Patients</p>
              <p className="text-3xl font-bold text-teal-600 mt-1">{stats?.uniquePatients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-teal-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">This Month</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{stats?.monthlyConsultations || 0}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-lg">Today's Patient Queue</h2>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">
              {todayApps.length} patients
            </span>
          </div>
        </div>
        <div className="p-5">
          {todayApps.length === 0 ? (
            <div className="text-center py-10">
              <Stethoscope size={48} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No Appointments Today</h3>
              <p className="text-gray-400 text-sm mt-1">Enjoy your day off! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayApps.map((app) => {
                const StatusIcon = statusIcon[app.status] || Clock;
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition group"
                  >
                    {/* Token */}
                    <div className="w-12 h-12 bg-white border-2 border-teal-200 rounded-xl flex flex-col items-center justify-center shadow-sm">
                      <Hash size={10} className="text-teal-400" />
                      <span className="text-lg font-bold text-teal-700 leading-none">
                        {app.tokenNumber || "-"}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {app.patient?.firstName} {app.patient?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {app.startTime} • {app.patient?.gender || ""} {app.patient?.bloodGroup ? `• ${app.patient.bloodGroup}` : ""}
                      </p>
                      {app.reason && (
                        <p className="text-xs text-gray-500 italic mt-0.5">{app.reason}</p>
                      )}
                    </div>

                    {/* Status */}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor[app.status]}`}>
                      <StatusIcon size={12} />
                      {app.status.replace("_", " ")}
                    </span>

                    {/* Action */}
                    {(app.status === "scheduled" || app.status === "in_progress") && (
                      <button
                        onClick={() => handleStartConsultation(app.id)}
                        className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-teal-600 transition shadow-sm opacity-80 group-hover:opacity-100"
                      >
                        {app.status === "in_progress" ? "Continue" : "Start"}
                      </button>
                    )}
                    {app.status === "completed" && app.consultation?.id && (
                      <button
                        onClick={() => navigate(`/dashboard/consultation/${app.id}`)}
                        className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-300 transition"
                      >
                        View
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">This Week</span>
              <span className="text-lg font-bold text-teal-600">{stats?.weeklyConsultations || 0} consultations</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">This Month</span>
              <span className="text-lg font-bold text-indigo-600">{stats?.monthlyConsultations || 0} consultations</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">All Time</span>
              <span className="text-lg font-bold text-gray-800">{stats?.totalConsultations || 0} consultations</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/dashboard/patients")}
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition"
            >
              <Users size={24} className="text-teal-500 mx-auto mb-2" />
              <span className="text-xs font-medium text-gray-600">Patient Records</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition"
            >
              <Stethoscope size={24} className="text-indigo-500 mx-auto mb-2" />
              <span className="text-xs font-medium text-gray-600">My Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
