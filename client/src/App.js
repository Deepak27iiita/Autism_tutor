import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LearningSessionPage from "./pages/LearningSessionPage";
import WordsPage from "./pages/WordsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="learning"
          element={
            <RoleGate allowedRoles={["child"]}>
              <LearningSessionPage />
            </RoleGate>
          }
        />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="words"
          element={
            <RoleGate allowedRoles={["teacher", "admin"]}>
              <WordsPage />
            </RoleGate>
          }
        />
        <Route
          path="admin"
          element={
            <RoleGate allowedRoles={["admin"]}>
              <AdminPage />
            </RoleGate>
          }
        />
        <Route
          path="teacher"
          element={
            <RoleGate allowedRoles={["teacher", "admin"]}>
              <TeacherPage />
            </RoleGate>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
