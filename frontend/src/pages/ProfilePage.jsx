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
      setIsEditing(false); // Switch back to view mode
      
      // If they just completed the profile, wait briefly then go to home
      if (!profileData?.profileCompleted) {
         setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
              <div className="text-center text-gray-500">Loading profile...</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isEditing ? (profileData?.profileCompleted ? "Update Profile" : "Complete Your Profile") : "Your Profile"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {!profileData?.profileCompleted && isEditing && "Please provide your details to complete registration."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm text-center mb-4">
              {success}
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                        <p className="mt-1 text-md text-gray-900">{profileData?.firstName || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                        <p className="mt-1 text-md text-gray-900">{profileData?.lastName || "-"}</p>
                    </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-md text-gray-900">{profileData?.phone || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                        <p className="mt-1 text-md text-gray-900">{profileData?.gender || "-"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Blood Group</h3>
                        <p className="mt-1 text-md text-gray-900">{profileData?.bloodGroup || "-"}</p>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => { setSuccess(""); setError(""); setIsEditing(true); }}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#009688] hover:bg-[#00796b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688] transition"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688] transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <div className="mt-1">
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <div className="mt-1">
                    <input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <div className="mt-1">
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <div className="mt-1">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <div className="mt-1">
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#009688] hover:bg-[#00796b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688] transition"
                  >
                    {loading ? "Saving..." : (profileData?.profileCompleted ? "Update Profile" : "Complete Registration")}
                  </button>
              </div>
            </form>
          )}
          
          {isEditing && profileData?.profileCompleted && (
             <div className="mt-6">
                <button
                   onClick={() => { setSuccess(""); setError(""); setIsEditing(false); }}
                   className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688] transition"
                >
                   Cancel Edit
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
