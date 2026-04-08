import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  GraduationCap,
  BadgeCheck,
  Clock,
} from "lucide-react";

const DoctorApprovalPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending-doctors");
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error("Failed to load pending doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/doctors/${id}/approve`);
      setDoctors(doctors.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to approve doctor", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this doctor registration?")) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/doctors/${id}/reject`);
      setDoctors(doctors.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to reject doctor", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Approvals</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and approve doctor registrations
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium">
          <ShieldCheck size={16} />
          {doctors.length} Pending
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <BadgeCheck size={48} className="text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">All Clear!</h3>
          <p className="text-gray-400 text-sm mt-1">
            No pending doctor registrations at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-white font-bold text-lg">
                      {doc.firstName?.[0] || "?"}
                      {doc.lastName?.[0] || ""}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={12} /> {doc.email}
                      </span>
                      {doc.phone && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={12} /> {doc.phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} /> {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Specialization</p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">{doc.specialization || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Qualification</p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">{doc.qualification || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">License Number</p>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">{doc.licenseNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-5 justify-end">
                  <button
                    onClick={() => handleReject(doc.id)}
                    disabled={actionLoading === doc.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <UserX size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(doc.id)}
                    disabled={actionLoading === doc.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition shadow-sm"
                  >
                    <UserCheck size={16} />
                    {actionLoading === doc.id ? "Processing..." : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorApprovalPage;
