import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Clock,
  BarChart3,
  Server,
} from "lucide-react";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes, healthRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/analytics"),
          api.get("/admin/health"),
        ]);
        setStats(statsRes.data.stats);
        setAnalytics(analyticsRes.data.analytics);
        setHealth(healthRes.data.health);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Process visit trends for chart
  const visitTrends = analytics?.visitTrends || {};
  const trendDates = Object.keys(visitTrends).sort().slice(-14);
  const maxVisits = Math.max(...trendDates.map((d) => visitTrends[d]), 1);

  // Process peak hours
  const peakHours = analytics?.peakHours || {};
  const hours = Array.from({ length: 9 }, (_, i) => (i + 9).toString().padStart(2, "0"));
  const maxHourCount = Math.max(...hours.map((h) => peakHours[h] || 0), 1);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard 🛡️</h1>
        <p className="mt-1 text-purple-100 text-sm">
          Monitor system health, manage users, and track healthcare metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Patients", value: stats?.totalPatients || 0, icon: Users, color: "text-blue-500 bg-blue-50" },
          { label: "Doctors", value: stats?.totalDoctors || 0, icon: Stethoscope, color: "text-teal-500 bg-teal-50" },
          { label: "Total Visits", value: stats?.totalAppointments || 0, icon: Calendar, color: "text-indigo-500 bg-indigo-50" },
          { label: "Today", value: stats?.todayAppointments || 0, icon: Clock, color: "text-amber-500 bg-amber-50" },
          { label: "Pending", value: stats?.pendingDoctors || 0, icon: ShieldCheck, color: "text-red-500 bg-red-50", onClick: () => navigate("/admin/approvals") },
          { label: "Consultations", value: stats?.totalConsultations || 0, icon: Activity, color: "text-green-500 bg-green-50" },
        ].map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition ${card.onClick ? "cursor-pointer" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Trends */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" /> Visit Trends
            </h3>
            <span className="text-xs text-gray-400">Last 14 days</span>
          </div>
          <div className="flex items-end gap-1 h-40">
            {trendDates.map((date) => {
              const count = visitTrends[date];
              const height = (count / maxVisits) * 100;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-md transition-all duration-300 hover:from-indigo-600 hover:to-indigo-400 min-h-[4px]"
                    style={{ height: `${Math.max(height, 3)}%` }}
                  />
                  <span className="text-[8px] text-gray-400 rotate-[-45deg] origin-top-left whitespace-nowrap">
                    {date.slice(5)}
                  </span>
                  <div className="hidden group-hover:block absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
          {trendDates.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No data yet</p>
          )}
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Peak Hours
            </h3>
          </div>
          <div className="space-y-2">
            {hours.map((h) => {
              const count = peakHours[h] || 0;
              const width = (count / maxHourCount) * 100;
              return (
                <div key={h} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12">{h}:00</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(width, 0)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Users size={18} className="text-blue-500" /> Demographics
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Gender</h4>
              <div className="space-y-2">
                {(analytics?.genderStats || []).map((g) => (
                  <div key={g.gender} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{g.gender}</span>
                    <span className="text-sm font-bold text-gray-800">{g.count}</span>
                  </div>
                ))}
                {(!analytics?.genderStats || analytics.genderStats.length === 0) && (
                  <p className="text-xs text-gray-400">No data</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Blood Group</h4>
              <div className="space-y-2">
                {(analytics?.bloodGroupStats || []).map((b) => (
                  <div key={b.bloodGroup} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{b.bloodGroup}</span>
                    <span className="text-sm font-bold text-gray-800">{b.count}</span>
                  </div>
                ))}
                {(!analytics?.bloodGroupStats || analytics.bloodGroupStats.length === 0) && (
                  <p className="text-xs text-gray-400">No data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Diagnoses & Medicines */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-green-500" /> Healthcare Insights
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Top Diagnoses</h4>
              <div className="space-y-2">
                {(analytics?.topDiagnoses || []).slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-50 rounded text-green-600 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{d.name}</span>
                    <span className="text-xs font-bold text-gray-500">{d.count}</span>
                  </div>
                ))}
                {(!analytics?.topDiagnoses || analytics.topDiagnoses.length === 0) && (
                  <p className="text-xs text-gray-400">No data</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Top Medicines</h4>
              <div className="space-y-2">
                {(analytics?.topMedicines || []).slice(0, 5).map((m, i) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-50 rounded text-indigo-600 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{m.name}</span>
                    <span className="text-xs font-bold text-gray-500">{m.count}</span>
                  </div>
                ))}
                {(!analytics?.topMedicines || analytics.topMedicines.length === 0) && (
                  <p className="text-xs text-gray-400">No data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Server size={18} className="text-purple-500" /> System Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Database</p>
            <p className={`text-sm font-bold mt-1 ${health?.database === "healthy" ? "text-green-600" : "text-red-600"}`}>
              {health?.database === "healthy" ? "✅ Healthy" : "❌ Unhealthy"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Total Users</p>
            <p className="text-sm font-bold text-gray-800 mt-1">{health?.counts?.users || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Appointments</p>
            <p className="text-sm font-bold text-gray-800 mt-1">{health?.counts?.appointments || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Uptime</p>
            <p className="text-sm font-bold text-gray-800 mt-1">{health?.uptime ? `${Math.floor(health.uptime / 60)}m` : "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate("/admin/approvals")} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition text-center">
          <ShieldCheck size={28} className="text-purple-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700">Doctor Approvals</span>
          {stats?.pendingDoctors > 0 && (
            <span className="block text-xs text-red-500 font-bold mt-1">{stats.pendingDoctors} pending</span>
          )}
        </button>
        <button onClick={() => navigate("/admin/users")} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition text-center">
          <Users size={28} className="text-teal-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700">User Management</span>
        </button>
        <button onClick={() => navigate("/admin/analytics")} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition text-center">
          <BarChart3 size={28} className="text-indigo-500 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-700">Full Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
