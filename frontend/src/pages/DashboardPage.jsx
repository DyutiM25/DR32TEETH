import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import DoctorDashboardPage from "./Doctor/DoctorDashboardPage";
import PatientDashboardPage from "./Patient/PatientDashboardPage";
import AdminDashboardPage from "./Admin/AdminDashboardPage";

const DashboardPage = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-pulse flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-red-500 font-medium">You are not authenticated.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const renderContent = () => {
        if (user.role === "admin") return <AdminDashboardPage />;
        if (user.role === "doctor") return <DoctorDashboardPage />;
        return <PatientDashboardPage />;
    };

    return (
        <DashboardLayout>
            {renderContent()}
        </DashboardLayout>
    );
};

export default DashboardPage;
