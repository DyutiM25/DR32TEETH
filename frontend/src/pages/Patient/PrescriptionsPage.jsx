import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { FileText, Download, Pill, Calendar } from "lucide-react";
import { downloadFile } from "../../utils/download.js";

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/prescriptions/my/all");
        setPrescriptions(res.data.prescriptions);
      } catch (err) {
        console.error("Failed to load prescriptions", err);
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
          <p className="text-gray-400 text-sm">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Prescriptions</h1>
          <p className="text-sm text-gray-400 mt-1">
            View and download your prescriptions as PDF
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium">
          <FileText size={16} />
          {prescriptions.length} Total
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Pill size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No Prescriptions Yet</h3>
          <p className="text-gray-400 text-sm mt-1">
            Prescriptions from your consultations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((p) => {
            const medicines = Array.isArray(p.medicines) ? p.medicines : [];
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {p.consultation?.diagnosis || "Prescription"}
                        </h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {p.consultation?.appointment?.appointmentDate || new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(`/prescriptions/${p.id}/pdf`, `prescription-${p.id.slice(0, 8)}.pdf`)}
                      className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      <Download size={12} />
                      PDF
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mb-2">
                    Dr. {p.consultation?.doctor?.firstName} {p.consultation?.doctor?.lastName}
                    {p.consultation?.doctor?.specialization ? ` • ${p.consultation.doctor.specialization}` : ""}
                  </p>

                  <div className="space-y-2">
                    {medicines.map((med, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5"
                      >
                        <span className="w-6 h-6 bg-indigo-100 rounded-lg text-indigo-600 text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{med.name}</p>
                          <p className="text-xs text-gray-400">
                            {[med.dosage, med.frequency, med.duration]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {p.additionalNotes && (
                    <p className="text-xs text-gray-500 mt-3 italic bg-gray-50 rounded-lg p-2">
                      {p.additionalNotes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
