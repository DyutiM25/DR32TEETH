import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  ArrowLeft,
  User,
  Activity,
  Heart,
  ThermometerSun,
  Weight,
  FileText,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/consultations/patient/${patientId}/history`);
        setPatient(res.data.patient);
        setConsultations(res.data.consultations);
      } catch (err) {
        console.error("Failed to load patient history", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading patient history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Patient History</h1>
      </div>

      {/* Patient Info */}
      {patient && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-sm">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{patient.firstName} {patient.lastName}</h2>
            <p className="text-sm text-gray-400">
              {patient.gender || ""} {patient.bloodGroup ? `• ${patient.bloodGroup}` : ""} {patient.phone ? `• ${patient.phone}` : ""} {patient.email ? `• ${patient.email}` : ""}
            </p>
          </div>
          <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl text-sm font-medium">
            {consultations.length} Visits
          </div>
        </div>
      )}

      {/* Consultations */}
      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Activity size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No History</h3>
          <p className="text-gray-400 text-sm mt-1">No consultations found for this patient.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="w-full p-4 flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] text-teal-600 font-medium">
                      {c.appointment?.appointmentDate ? new Date(c.appointment.appointmentDate + "T00:00:00").toLocaleDateString("en-US", { month: "short" }) : ""}
                    </span>
                    <span className="text-sm font-bold text-teal-700 leading-none">
                      {c.appointment?.appointmentDate ? new Date(c.appointment.appointmentDate + "T00:00:00").getDate() : ""}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm">{c.diagnosis}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.appointment?.appointmentDate} at {c.appointment?.startTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.prescriptions?.length > 0 && (
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-medium px-2 py-0.5 rounded-lg">{c.prescriptions.length} Rx</span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                    {(c.vitalBP || c.vitalTemp || c.vitalPulse || c.vitalWeight) && (
                      <div className="grid grid-cols-4 gap-2">
                        {c.vitalBP && <div className="bg-white rounded-lg p-2 border border-gray-100"><p className="text-[9px] text-gray-400">BP</p><p className="text-xs font-semibold">{c.vitalBP}</p></div>}
                        {c.vitalTemp && <div className="bg-white rounded-lg p-2 border border-gray-100"><p className="text-[9px] text-gray-400">Temp</p><p className="text-xs font-semibold">{c.vitalTemp}</p></div>}
                        {c.vitalPulse && <div className="bg-white rounded-lg p-2 border border-gray-100"><p className="text-[9px] text-gray-400">Pulse</p><p className="text-xs font-semibold">{c.vitalPulse}</p></div>}
                        {c.vitalWeight && <div className="bg-white rounded-lg p-2 border border-gray-100"><p className="text-[9px] text-gray-400">Weight</p><p className="text-xs font-semibold">{c.vitalWeight}</p></div>}
                      </div>
                    )}
                    {c.symptoms && <div className="bg-white rounded-lg p-3 border border-gray-100"><p className="text-[9px] text-gray-400 uppercase font-medium mb-1">Symptoms</p><p className="text-xs text-gray-700">{c.symptoms}</p></div>}
                    {c.treatmentPlan && <div className="bg-white rounded-lg p-3 border border-gray-100"><p className="text-[9px] text-gray-400 uppercase font-medium mb-1">Treatment</p><p className="text-xs text-gray-700">{c.treatmentPlan}</p></div>}
                    {c.notes && <div className="bg-white rounded-lg p-3 border border-gray-100"><p className="text-[9px] text-gray-400 uppercase font-medium mb-1">Notes</p><p className="text-xs text-gray-700">{c.notes}</p></div>}

                    {c.prescriptions?.map((p) => (
                      <div key={p.id} className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] text-gray-400 uppercase font-medium">Prescription</p>
                          <a href={`http://localhost:3000/api/prescriptions/${p.id}/pdf`} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 hover:text-teal-700 font-medium"><FileText size={10} className="inline mr-1" />PDF</a>
                        </div>
                        {(Array.isArray(p.medicines) ? p.medicines : []).map((med, i) => (
                          <div key={i} className="text-xs text-gray-700 flex gap-2"><span className="font-medium">{med.name}</span><span className="text-gray-400">{med.dosage} • {med.frequency} • {med.duration}</span></div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientDetailPage;
