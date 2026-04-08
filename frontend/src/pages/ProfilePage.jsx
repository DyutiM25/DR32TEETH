import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    bloodGroup: "",
  });
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [doctorForm, setDoctorForm] = useState({
    specialization: "",
    qualification: "",
    licenseNumber: "",
  });
  const [isRegisteringDoctor, setIsRegisteringDoctor] = useState(false);

  // Fetch from DB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/profile");
        const fetchedUser = res.data.user;
        setProfileData(fetchedUser);
        setUser(fetchedUser); // Update context
        
        if (fetchedUser.profileCompleted) {
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }

        setFormData({
            firstName: fetchedUser.firstName || "",
            lastName: fetchedUser.lastName || "",
            phone: fetchedUser.phone || "",
            gender: fetchedUser.gender || "",
            bloodGroup: fetchedUser.bloodGroup || "",
        });

        if (fetchedUser.role === 'doctor') {
            setDoctorForm({
                specialization: fetchedUser.specialization || "",
                qualification: fetchedUser.qualification || "",
                licenseNumber: fetchedUser.licenseNumber || "",
            });
        }
      } catch (err) {
        setError("Failed to fetch profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDoctorChange = (e) => {
    setDoctorForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.put("/auth/profile", formData);
      setUser(res.data.user);
      setProfileData(res.data.user);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      if (!profileData?.profileCompleted) {
         setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register-doctor", doctorForm);
      setUser(res.data.user);
      setProfileData(res.data.user);
      setSuccess("Doctor registration submitted! Pending admin approval.");
      setIsRegisteringDoctor(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit registration.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-gray-500 font-medium">Loading profile...</div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isEditing ? (profileData?.profileCompleted ? "Update Profile" : "Complete Your Profile") : "Your Profile"}
        </h2>
        {profileData?.role === 'doctor' && (
          <div className="mt-2 flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${profileData.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {profileData.isApproved ? '✅ Approved Doctor' : '⏳ Pending Approval'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm border border-green-100 flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          {!isEditing && !isRegisteringDoctor ? (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-5">
                    <div>
                        <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">First Name</h3>
                        <p className="mt-1 text-md font-semibold text-gray-800">{profileData?.firstName || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Name</h3>
                        <p className="mt-1 text-md font-semibold text-gray-800">{profileData?.lastName || "-"}</p>
                    </div>
                </div>

                <div className="border-b border-gray-100 pb-5">
                    <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</h3>
                    <p className="mt-1 text-md font-semibold text-gray-800">{profileData?.email}</p>
                </div>

                <div className="border-b border-gray-100 pb-5">
                    <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Phone Number</h3>
                    <p className="mt-1 text-md font-semibold text-gray-800">{profileData?.phone || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-5">
                    <div>
                        <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gender</h3>
                        <p className="mt-1 text-md font-semibold text-gray-800">{profileData?.gender || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Blood Group</h3>
                        <p className="mt-1 text-md font-semibold text-gray-800">{profileData?.bloodGroup || "-"}</p>
                    </div>
                </div>

                {profileData?.role === 'doctor' && (
                    <div className="bg-teal-50 rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2">
                            🩺 Professional Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <h3 className="text-[10px] uppercase font-bold text-teal-600/60 tracking-wider">Specialization</h3>
                                <p className="text-sm font-semibold text-teal-900">{profileData.specialization}</p>
                            </div>
                            <div>
                                <h3 className="text-[10px] uppercase font-bold text-teal-600/60 tracking-wider">Qualification</h3>
                                <p className="text-sm font-semibold text-teal-900">{profileData.qualification}</p>
                            </div>
                            <div>
                                <h3 className="text-[10px] uppercase font-bold text-teal-600/60 tracking-wider">License Number</h3>
                                <p className="text-sm font-semibold text-teal-900">{profileData.licenseNumber}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-2 space-y-3">
                    <button
                        onClick={() => { setSuccess(""); setError(""); setIsEditing(true); }}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Edit Personal Info
                    </button>
                    
                    {profileData?.role === 'patient' && (
                        <button
                            onClick={() => setIsRegisteringDoctor(true)}
                            className="w-full flex justify-center py-3 px-4 border-2 border-teal-100 rounded-xl text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition"
                        >
                            Become a Doctor 🩺
                        </button>
                    )}

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
          ) : isRegisteringDoctor ? (
            <form className="space-y-6" onSubmit={handleDoctorRegister}>
              <div className="bg-teal-50 rounded-2xl p-4 text-center mb-4">
                <p className="text-xs text-teal-700 font-medium">Registering as a healthcare professional at Dr.32 Teeth.</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Specialization *</label>
                <input
                  name="specialization"
                  type="text"
                  required
                  placeholder="e.g. Orthodontist, General Dentist"
                  value={doctorForm.specialization}
                  onChange={handleDoctorChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Qualification *</label>
                <input
                  name="qualification"
                  type="text"
                  required
                  placeholder="e.g. BDS, MDS"
                  value={doctorForm.qualification}
                  onChange={handleDoctorChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Medical License Number *</label>
                <input
                  name="licenseNumber"
                  type="text"
                  required
                  placeholder="Enter your valid registration number"
                  value={doctorForm.licenseNumber}
                  onChange={handleDoctorChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div className="pt-2 space-y-3">
                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
                  >
                    {loading ? "Submitting..." : "Submit Registration"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegisteringDoctor(false)}
                    className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">First Name *</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Last Name *</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
                  >
                    {loading ? "Saving..." : (profileData?.profileCompleted ? "Update Profile" : "Complete Registration")}
                  </button>
                  {profileData?.profileCompleted && (
                    <button
                        type="button"
                        onClick={() => { setSuccess(""); setError(""); setIsEditing(false); }}
                        className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                  )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
