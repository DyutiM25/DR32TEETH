import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    startTime: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/appointments/doctors");
        setDoctors(res.data.doctors);
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.doctorId && formData.appointmentDate) {
        setLoading(true);
        setError("");
        try {
          const res = await api.get(
            `/appointments/available-slots?doctorId=${formData.doctorId}&date=${formData.appointmentDate}`
          );
          setAvailableSlots(res.data.availableSlots);
        } catch (err) {
          setError("Failed to load available slots.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSlots();
  }, [formData.doctorId, formData.appointmentDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // If they change doc or date, clear the selected time
    if (e.target.name === 'doctorId' || e.target.name === 'appointmentDate') {
        setFormData(prev => ({...prev, startTime: ""}));
    }
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, startTime: slot });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/appointments/book", formData);
      setSuccess("Appointment booked successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-[#009688]">
            Book an Appointment
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select a doctor, pick a date, and choose a time that works for you.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Step 1: Doctor & Date */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm rounded-md border"
              >
                <option value="" disabled>Select a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.firstName} {doc.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Select Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm rounded-md border"
              />
            </div>
          </div>

          {/* Step 2: Time Slots */}
          {formData.doctorId && formData.appointmentDate && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
              {loading ? (
                <p className="text-sm text-gray-500">Loading slots...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-red-500">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className={`py-2 px-4 border rounded-md text-sm font-medium transition ${
                        formData.startTime === slot
                          ? "bg-[#009688] text-white border-[#009688]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reason */}
          {formData.startTime && (
            <div className="pt-4 border-t border-gray-200">
               <label className="block text-sm font-medium text-gray-700">Reason for Visit (Optional)</label>
               <textarea
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
                  placeholder="e.g. Regular Checkup, Toothache, etc."
               />
            </div>
          )}

          <div className="flex gap-4 pt-4">
             <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.startTime || loading || success}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !formData.startTime || loading || success
                  ? "bg-[#80cbc4] cursor-not-allowed"
                  : "bg-[#009688] hover:bg-[#00796b]"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688] transition`}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
