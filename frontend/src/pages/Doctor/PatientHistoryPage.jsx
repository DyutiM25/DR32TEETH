import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  Search,
  Users,
  User,
  Calendar,
  ChevronRight,
  FileText,
} from "lucide-react";

const PatientHistoryPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/appointments/my-appointments");
        setAppointments(res.data.appointments);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Get unique patients from appointments
  const patientsMap = {};
  appointments.forEach((app) => {
    if (app.patient && !patientsMap[app.patient.id]) {
      patientsMap[app.patient.id] = {
        ...app.patient,
        appointmentCount: 0,
        lastVisit: app.appointmentDate,
      };
    }
    if (app.patient && patientsMap[app.patient.id]) {
      patientsMap[app.patient.id].appointmentCount++;
    }
  });
  const patients = Object.values(patientsMap);

  const filtered = patients.filter((p) => {
    const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          <p className="text-sm text-gray-400 mt-1">
            Search and view patient consultation history
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-medium">
          <Users size={16} />
          {patients.length} Patients
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Patient List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <User size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            {search ? "No patients match your search" : "No Patients Yet"}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Patient records will appear here after consultations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((patient) => (
            <button
              key={patient.id}
              onClick={() => navigate(`/dashboard/patient-history/${patient.id}`)}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition text-left group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {patient.firstName?.[0] || "?"}
                  {patient.lastName?.[0] || ""}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {patient.gender || "N/A"} {patient.bloodGroup ? `• ${patient.bloodGroup}` : ""} {patient.phone ? `• ${patient.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={10} /> {patient.appointmentCount} visits
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500 transition" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistoryPage;
