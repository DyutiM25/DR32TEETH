import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    try {
      const params = roleFilter ? `?role=${roleFilter}` : "";
      const res = await api.get(`/admin/users${params}`);
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const filtered = users.filter((u) => {
    const name = `${u.firstName || ""} ${u.lastName || ""} ${u.email}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const roleColor = {
    patient: "bg-blue-50 text-blue-700",
    doctor: "bg-teal-50 text-teal-700",
    admin: "bg-purple-50 text-purple-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all system users
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">
          <Users size={16} />
          {users.length} Users
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          {["", "patient", "doctor", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => {
                setRoleFilter(role);
                setLoading(true);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                roleFilter === role
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {role || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Contact</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.specialization && (
                          <p className="text-[10px] text-gray-400">{user.specialization}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={10} /> {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {user.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${roleColor[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.role === "doctor" ? (
                      user.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <UserCheck size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <ShieldCheck size={12} /> Pending
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        {user.profileCompleted ? "Complete" : "Incomplete"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
