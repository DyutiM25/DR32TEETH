import { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { Award, Download, Calendar, Shield } from "lucide-react";

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/certificates/my/all");
        setCertificates(res.data.certificates);
      } catch (err) {
        console.error("Failed to load certificates", err);
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
          <p className="text-gray-400 text-sm">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medical Certificates</h1>
          <p className="text-sm text-gray-400 mt-1">
            View and download your medical certificates
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium">
          <Award size={16} />
          {certificates.length} Total
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Shield size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No Certificates Yet</h3>
          <p className="text-gray-400 text-sm mt-1">
            Medical certificates issued by your doctor will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const validFrom = new Date(cert.validFrom).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric",
            });
            const validTo = new Date(cert.validTo).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric",
            });

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Award size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">Medical Certificate</h3>
                        <p className="text-xs text-gray-400">
                          {cert.consultation?.appointment?.appointmentDate || ""}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`http://localhost:3000/api/certificates/${cert.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      <Download size={12} />
                      PDF
                    </a>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Reason</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">{cert.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Diagnosis</p>
                    <p className="text-sm text-gray-700 mt-1">{cert.consultation?.diagnosis}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{validFrom}</span> — <span className="font-medium">{validTo}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Dr. {cert.consultation?.doctor?.firstName} {cert.consultation?.doctor?.lastName}
                    {cert.consultation?.doctor?.specialization ? ` • ${cert.consultation.doctor.specialization}` : ""}
                  </p>
                  {cert.additionalNotes && (
                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2">
                      {cert.additionalNotes}
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

export default CertificatesPage;
