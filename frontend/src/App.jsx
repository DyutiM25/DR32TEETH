import { Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import BookAppointmentPage from "./pages/Patient/BookAppointmentPage";
import DashboardLayout from "./components/layout/DashboardLayout";

// Patient pages
import HealthDashboardPage from "./pages/Patient/HealthDashboardPage";
import PrescriptionsPage from "./pages/Patient/PrescriptionsPage";
import CertificatesPage from "./pages/Patient/CertificatesPage";

// Doctor pages
import ConsultationPage from "./pages/Doctor/ConsultationPage";
import PatientHistoryPage from "./pages/Doctor/PatientHistoryPage";
import PatientDetailPage from "./pages/Doctor/PatientDetailPage";

// Admin pages
import DoctorApprovalPage from "./pages/Admin/DoctorApprovalPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Main Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/book-appointment" element={<DashboardLayout><BookAppointmentPage /></DashboardLayout>} />

      {/* Patient Routes */}
      <Route path="/dashboard/health" element={<DashboardLayout><HealthDashboardPage /></DashboardLayout>} />
      <Route path="/dashboard/prescriptions" element={<DashboardLayout><PrescriptionsPage /></DashboardLayout>} />
      <Route path="/dashboard/certificates" element={<DashboardLayout><CertificatesPage /></DashboardLayout>} />

      {/* Doctor Routes */}
      <Route path="/dashboard/consultation/:appointmentId" element={<DashboardLayout><ConsultationPage /></DashboardLayout>} />
      <Route path="/dashboard/consultation" element={<DashboardLayout><ConsultationPage /></DashboardLayout>} />
      <Route path="/dashboard/patients" element={<DashboardLayout><PatientHistoryPage /></DashboardLayout>} />
      <Route path="/dashboard/patient-history/:patientId" element={<DashboardLayout><PatientDetailPage /></DashboardLayout>} />

      {/* Admin Routes */}
      <Route path="/admin/approvals" element={<DashboardLayout><DoctorApprovalPage /></DashboardLayout>} />
      <Route path="/admin/users" element={<DashboardLayout><UserManagementPage /></DashboardLayout>} />
      <Route path="/admin/analytics" element={<DashboardLayout><AdminDashboardPage /></DashboardLayout>} />
    </Routes>
  );
}

export default App;
