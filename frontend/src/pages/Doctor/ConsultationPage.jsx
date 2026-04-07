import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
  Stethoscope,
  Heart,
  ThermometerSun,
  Activity,
  Weight,
  FileText,
  Award,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  ArrowLeft,
  User,
} from "lucide-react";

const ConsultationPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("consultation");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Consultation form
  const [form, setForm] = useState({
    diagnosis: "",
    symptoms: "",
    notes: "",
    vitalBP: "",
    vitalTemp: "",
    vitalPulse: "",
    vitalWeight: "",
    treatmentPlan: "",
  });

  // Prescription form
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  // Certificate form
  const [certForm, setCertForm] = useState({
    reason: "",
    validFrom: "",
    validTo: "",
    additionalNotes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get existing consultation
        try {
          const res = await api.get(`/consultations/appointment/${appointmentId}`);
          setConsultation(res.data.consultation);
          const c = res.data.consultation;
          setForm({
            diagnosis: c.diagnosis || "",
            symptoms: c.symptoms || "",
            notes: c.notes || "",
            vitalBP: c.vitalBP || "",
            vitalTemp: c.vitalTemp || "",
            vitalPulse: c.vitalPulse || "",
            vitalWeight: c.vitalWeight || "",
            treatmentPlan: c.treatmentPlan || "",
          });
          setAppointment(c.appointment);
        } catch {
          // No consultation yet, fetch appointment info
          const appsRes = await api.get("/appointments/my-appointments");
          const app = appsRes.data.appointments.find((a) => a.id === appointmentId);
          setAppointment(app);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appointmentId]);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const saveConsultation = async () => {
    if (!form.diagnosis.trim()) {
      setMessage({ type: "error", text: "Diagnosis is required" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (consultation) {
        // Update existing
        await api.put(`/consultations/${consultation.id}`, form);
        setMessage({ type: "success", text: "Consultation updated" });
      } else {
        // Create new
        const res = await api.post("/consultations", {
          appointmentId,
          ...form,
        });
        setConsultation(res.data.consultation);
        setMessage({ type: "success", text: "Consultation started" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save consultation" });
    } finally {
      setSaving(false);
    }
  };

  const savePrescription = async () => {
    if (!consultation) {
      setMessage({ type: "error", text: "Save the consultation first" });
      return;
    }

    const validMeds = medicines.filter((m) => m.name.trim());
    if (validMeds.length === 0) {
      setMessage({ type: "error", text: "Add at least one medicine" });
      return;
    }

    setSaving(true);
    try {
      await api.post("/prescriptions", {
        consultationId: consultation.id,
        medicines: validMeds,
        additionalNotes: prescriptionNotes || null,
      });
      setMessage({ type: "success", text: "Prescription created successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create prescription" });
    } finally {
      setSaving(false);
    }
  };

  const saveCertificate = async () => {
    if (!consultation) {
      setMessage({ type: "error", text: "Save the consultation first" });
      return;
    }

    if (!certForm.reason || !certForm.validFrom || !certForm.validTo) {
      setMessage({ type: "error", text: "Reason and validity dates are required" });
      return;
    }

    setSaving(true);
    try {
      await api.post("/certificates", {
        consultationId: consultation.id,
        ...certForm,
      });
      setMessage({ type: "success", text: "Certificate issued successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to issue certificate" });
    } finally {
      setSaving(false);
    }
  };

  const completeConsultation = async () => {
    if (!consultation) return;
    setSaving(true);
    try {
      await api.patch(`/consultations/${consultation.id}/complete`);
      setMessage({ type: "success", text: "Consultation completed!" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to complete" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading consultation...</p>
        </div>
      </div>
    );
  }

  const patient = consultation?.patient || appointment?.patient;
  const tabs = [
    { id: "consultation", label: "Consultation", icon: Stethoscope },
    { id: "prescription", label: "Prescription", icon: FileText },
    { id: "certificate", label: "Certificate", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Consultation</h1>
            <p className="text-xs text-gray-400">
              {appointment?.appointmentDate} at {appointment?.startTime}
            </p>
          </div>
        </div>
        {consultation && (
          <button
            onClick={completeConsultation}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition shadow-sm"
          >
            <CheckCircle size={16} />
            Complete
          </button>
        )}
      </div>

      {/* Patient Info Card */}
      {patient && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <User size={24} className="text-teal-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="text-xs text-gray-400">
              {patient.gender || ""} {patient.bloodGroup ? `• ${patient.bloodGroup}` : ""} {patient.phone ? `• ${patient.phone}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message.text && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            message.type === "error"
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-green-50 text-green-600 border border-green-100"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consultation Tab */}
      {activeTab === "consultation" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Vitals */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Heart size={12} className="text-red-400" /> Blood Pressure
                </label>
                <input name="vitalBP" value={form.vitalBP} onChange={handleFormChange} placeholder="120/80 mmHg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <ThermometerSun size={12} className="text-orange-400" /> Temperature
                </label>
                <input name="vitalTemp" value={form.vitalTemp} onChange={handleFormChange} placeholder="98.6°F"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Activity size={12} className="text-pink-400" /> Pulse
                </label>
                <input name="vitalPulse" value={form.vitalPulse} onChange={handleFormChange} placeholder="72 bpm"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Weight size={12} className="text-blue-400" /> Weight
                </label>
                <input name="vitalWeight" value={form.vitalWeight} onChange={handleFormChange} placeholder="65 kg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Symptoms</label>
            <textarea name="symptoms" value={form.symptoms} onChange={handleFormChange} rows="2" placeholder="Describe patient symptoms..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Diagnosis *</label>
            <textarea name="diagnosis" value={form.diagnosis} onChange={handleFormChange} rows="2" placeholder="Enter clinical diagnosis..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Treatment Plan</label>
            <textarea name="treatmentPlan" value={form.treatmentPlan} onChange={handleFormChange} rows="2" placeholder="Outline treatment plan..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Additional Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleFormChange} rows="2" placeholder="Any additional notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>

          <button
            onClick={saveConsultation}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-600 transition shadow-sm"
          >
            <Save size={16} />
            {saving ? "Saving..." : consultation ? "Update Consultation" : "Start Consultation"}
          </button>
        </div>
      )}

      {/* Prescription Tab */}
      {activeTab === "prescription" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Medicines</h3>
          {medicines.map((med, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Medicine {i + 1}</span>
                {medicines.length > 1 && (
                  <button onClick={() => removeMedicine(i)} className="text-red-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <input value={med.name} onChange={(e) => handleMedicineChange(i, "name", e.target.value)} placeholder="Medicine name *"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input value={med.dosage} onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)} placeholder="Dosage"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input value={med.frequency} onChange={(e) => handleMedicineChange(i, "frequency", e.target.value)} placeholder="Frequency"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input value={med.duration} onChange={(e) => handleMedicineChange(i, "duration", e.target.value)} placeholder="Duration"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <input value={med.instructions} onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)} placeholder="Instructions"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          ))}

          <button onClick={addMedicine} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
            <Plus size={14} /> Add Medicine
          </button>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Additional Notes</label>
            <textarea value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)} rows="2" placeholder="Additional prescription notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <button
            onClick={savePrescription}
            disabled={saving || !consultation}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
              !consultation ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            <FileText size={16} />
            {saving ? "Creating..." : "Create Prescription"}
          </button>

          {!consultation && (
            <p className="text-xs text-amber-500">⚠️ Save the consultation first before creating a prescription.</p>
          )}
        </div>
      )}

      {/* Certificate Tab */}
      {activeTab === "certificate" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Medical Certificate</h3>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Reason *</label>
            <input value={certForm.reason} onChange={(e) => setCertForm({ ...certForm, reason: e.target.value })} placeholder="E.g., Dental surgery recovery"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Valid From *</label>
              <input type="date" value={certForm.validFrom} onChange={(e) => setCertForm({ ...certForm, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Valid To *</label>
              <input type="date" value={certForm.validTo} onChange={(e) => setCertForm({ ...certForm, validTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Additional Notes</label>
            <textarea value={certForm.additionalNotes} onChange={(e) => setCertForm({ ...certForm, additionalNotes: e.target.value })} rows="2" placeholder="Any additional notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <button
            onClick={saveCertificate}
            disabled={saving || !consultation}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
              !consultation ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            <Award size={16} />
            {saving ? "Issuing..." : "Issue Certificate"}
          </button>

          {!consultation && (
            <p className="text-xs text-amber-500">⚠️ Save the consultation first before issuing a certificate.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationPage;
