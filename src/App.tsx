import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ApprovalsPage from "./pages/admin/ApprovalsPage";
import FacultyListPage from "./pages/admin/FacultyListPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import LandingPage from "./pages/LandingPage";
import DirectoryPage from "./pages/directory/DirectoryPage";
import PublicProfilePage from "./pages/directory/PublicProfilePage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";


function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "ADMIN" | "FACULTY";
}) {
  const { user, token } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/directory/:id" element={<PublicProfilePage />} />

      {/* faculty */}
      <Route
        path="/faculty/*"
        element={
          <ProtectedRoute role="FACULTY">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      {/* admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="faculty" element={<FacultyListPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
