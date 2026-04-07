import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import {
  Activity,
  Stethoscope,
  ThermometerSun,
  Heart,
  Weight,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const HealthDashboardPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/consultations/my-history");
        setConsultations(res.data.consultations);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading health records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Health Records</h1>
          <p className="text-sm text-gray-400 mt-1">
            Your complete medical history at Dr.32 Teeth
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-medium">
          <Activity size={16} />
          {consultations.length} Records
        </div>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Stethoscope size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No Records Yet</h3>
          <p className="text-gray-400 text-sm mt-1">
            Your medical history will appear here after your first consultation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Summary Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="w-full p-5 flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-teal-600 font-medium">
                      {c.appointment?.appointmentDate
                        ? new Date(c.appointment.appointmentDate + "T00:00:00").toLocaleDateString("en-US", { month: "short" })
                        : ""}
                    </span>
                    <span className="text-lg font-bold text-teal-700 leading-none">
                      {c.appointment?.appointmentDate
                        ? new Date(c.appointment.appointmentDate + "T00:00:00").getDate()
                        : ""}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {c.diagnosis}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dr. {c.doctor?.firstName} {c.doctor?.lastName}
                      {c.doctor?.specialization ? ` • ${c.doctor.specialization}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.prescriptions?.length > 0 && (
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-medium px-2 py-1 rounded-lg">
                        {c.prescriptions.length} Rx
                      </span>
                    )}
                    {c.certificates?.length > 0 && (
                      <span className="bg-amber-50 text-amber-600 text-[10px] font-medium px-2 py-1 rounded-lg">
                        {c.certificates.length} Cert
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50">
                    {/* Vitals */}
                    {(c.vitalBP || c.vitalTemp || c.vitalPulse || c.vitalWeight) && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vitals</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {c.vitalBP && (
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Heart size={14} className="text-red-400" />
                                <span className="text-[10px] text-gray-400 uppercase">Blood Pressure</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{c.vitalBP}</p>
                            </div>
                          )}
                          {c.vitalTemp && (
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center gap-2 mb-1">
                                <ThermometerSun size={14} className="text-orange-400" />
                                <span className="text-[10px] text-gray-400 uppercase">Temperature</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{c.vitalTemp}</p>
                            </div>
                          )}
                          {c.vitalPulse && (
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity size={14} className="text-pink-400" />
                                <span className="text-[10px] text-gray-400 uppercase">Pulse</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{c.vitalPulse}</p>
                            </div>
                          )}
                          {c.vitalWeight && (
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Weight size={14} className="text-blue-400" />
                                <span className="text-[10px] text-gray-400 uppercase">Weight</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{c.vitalWeight}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Symptoms & Treatment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {c.symptoms && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Symptoms</h4>
                          <p className="text-sm text-gray-700">{c.symptoms}</p>
                        </div>
                      )}
                      {c.treatmentPlan && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Treatment Plan</h4>
                          <p className="text-sm text-gray-700">{c.treatmentPlan}</p>
                        </div>
                      )}
                    </div>

                    {c.notes && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h4>
                        <p className="text-sm text-gray-700">{c.notes}</p>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {c.prescriptions?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prescriptions</h4>
                        {c.prescriptions.map((p) => (
                          <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-100 mb-2">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-400">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                              <a
                                href={`http://localhost:3000/api/prescriptions/${p.id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                              >
                                <FileText size={12} />
                                Download PDF
                              </a>
                            </div>
                            <div className="space-y-1">
                              {(Array.isArray(p.medicines) ? p.medicines : []).map((med, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                  <span className="w-5 h-5 bg-teal-50 rounded text-teal-600 text-xs flex items-center justify-center font-semibold">
                                    {i + 1}
                                  </span>
                                  <span className="font-medium text-gray-800">{med.name}</span>
                                  <span className="text-gray-400">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default HealthDashboardPage;
